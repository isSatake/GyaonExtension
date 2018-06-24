import {upload} from "gyaonup";
import chromep from 'chrome-promise';

declare var MediaRecorder: any;
declare var webkitSpeechRecognition: any;

const disabelIcon = chrome.runtime.getURL("/icons/disable.png");
const activeIcon = chrome.runtime.getURL("/icons/active.png");
const deactiveIcon = chrome.runtime.getURL("/icons/deactive.png");
const bigIcon = chrome.runtime.getURL("/icons/bigicon.png");

//インストール時に実行する
chrome.runtime.onInstalled.addListener(async (details) => {
    chrome.browserAction.disable();
    chrome.browserAction.setIcon({path: disabelIcon});
    console.log(`Install reason : ${details.reason}, previous version : ${details.previousVersion}`);
    //ペースト用のDOMを設定
    const backGroundTextArea = document.createElement("textArea");
    backGroundTextArea.id = "textArea";
    document.body.appendChild(backGroundTextArea);
    //インストールしたらまずGyaonIDを設定してもらう
    chrome.runtime.openOptionsPage();
});

chrome.runtime.onStartup.addListener(() => {
    //
});

chrome.runtime.onUpdateAvailable.addListener(async (details) => {
    reloadExtenison();
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === "notification") {
        const text = request.text;
        console.log(text);
        notificate(text);
    }
});

chrome.commands.onCommand.addListener(command => {
    if (command == "mic_rec") {
        console.log("mic_rec");
        if (isRecording != true) {
            startRecording();
        } else {
            stopRecording();
        }
        isRecording = !isRecording;
    } else if (command == "tab_rec") {
        if (isRecording != true) {
            startTabRecording();
        } else {
            stopTabRecording();
        }
        isRecording = !isRecording;
    }
});

//通知用関数
async function notificate(message) {
    const notifOption = {
        type: "basic",
        iconUrl: bigIcon,
        title: "GyaonExtension",
        message: `${message}`
    };

    try {
        await chromep.notifications.getPermissionLevel();
        chrome.notifications.create(notifOption);
    } catch (error) {
        console.log(error);
        console.log("User has elected not to show notifications from the app or extension.")
    }
}

async function reloadExtenison() {
    console.log(`Gyaon Extension will be reload`);
    chrome.runtime.reload();
}

async function pasteToClipBoard(text) {
    const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
    textArea.value = text;
    textArea.select();
    document.execCommand("copy");
}

async function sendURLtoScrapbox(url, title) {
    const queryInfo = {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };

    const tabs = await chromep.tabs.query(queryInfo);
    const currentTab = tabs.shift();
    const sendData = {cmd: "pasteToScrapbox", url: url, title: title};
    chrome.tabs.sendMessage(currentTab.id, sendData, async () => {
    });
}

async function reNameSoundFile(id: String) {
    const url = `https://gyaon.com/comment/${id}`;
    const method = "POST";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({value: recognizedText});

    try {
        const request = await fetch(url, {method, headers, body});
        console.log(request);
        if (request.status == 200) {
            notificate(`音声をアップロードしました。: ${recognizedText}`);
        }
    } catch (error) {
        console.log(error);
    }
}

let recorder: any;
let tabRecorder:any;
let isRecording: boolean = false;
let isRecognizing: boolean = false;
let recognizedText: String;
const recordedChunks = [];


navigator.mediaDevices.getUserMedia({audio: true})
    .then(async (stream) => {
        recorder = new MediaRecorder(stream);
        recorder.addEventListener('dataavailable', async (event) => {
            recordedChunks.push(event.data);
            console.dir(recordedChunks);

            const localGyaonID = await chromep.storage.local.get("gyaonID");
            const gyaonID : String = localGyaonID.gyaonID;
            //GyaonIDが設定されているかチェックする
            if (gyaonID === "undefined") {
                console.log("gyaonID is not set!");
                chrome.runtime.openOptionsPage();
            } else {
                try {
                   const request = await upload(gyaonID.toString(), new Blob(recordedChunks));
                   console.dir(request);
                    if (request.status === 200) {
                        recordedChunks.length = 0;
                        const uploadedURL = `${request.data.endpoint}/sound/${request.data.object.key}`;
                        console.log(`uploadedURL : ${uploadedURL}`);
                        pasteToClipBoard(uploadedURL);

                        if (recognizedText != undefined) {
                            console.log("renaming...");
                            reNameSoundFile(request.data.object.key);
                        } else {
                            console.log("認識できませんでした。")
                        }

                        const queryInfo = {
                            active: true,
                            windowId: chrome.windows.WINDOW_ID_CURRENT
                        };
                        const tabs = await chromep.tabs.query(queryInfo);
                        const activeTab = tabs.shift();
                        if (activeTab.url.includes("https://scrapbox.io")) {
                            console.log("Its Scrapbox!");
                            const pasteText =  `[${recognizedText} ${uploadedURL}]`;
                            await chromep.tabs.executeScript(activeTab.id,{code: `document.execCommand("insertText",false, "${pasteText}");`});
                        } else {
                            console.log("Its not Scrapbox!");
                        }
                    }

                } catch (error) {
                    console.log(error);
                }
            }
        });
    })
    .catch(error => {
        console.dir(error)
    });

async function initRecorder() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true});
        console.log("mediaDeveices is initialized!");
    } catch (error) {
        console.log(error);
        reloadExtenison();
    }
}

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.onend = function () {
    console.log("recognition onEnd");
    isRecognizing = false;
};

recognition.onresult = function (event) {
    const result = event.results[event.results.length - 1];
    const item = result[0];
    console.log(item.transcript);
    recognizedText = item.transcript;
};

function tabRecord () {
    chrome.tabCapture.capture({audio:true}, stream => {
        // const audioSource = new AudioContext().createMediaStreamSource(stream);
        const audioSource = stream.getAudioTracks();
        tabRecorder = new MediaRecorder(audioSource);
        tabRecorder.start();
        console.log("startTabRecording");
        chrome.browserAction.setIcon({path: activeIcon});
        chrome.browserAction.setBadgeText({text: "REC"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#3c4dc0"});

        tabRecorder.addEventListener('dataavailable', function (event) {
            //tabCaptureを終了する
            stream.getAudioTracks()[0].stop();
            recordedChunks.push(event.data);
            console.dir(recordedChunks);

            chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
                console.dir(tabs);
                const fileName = tabs[0].title;

                chrome.storage.local.get("gyaonID", function (items) {
                    if (items != undefined) {
                        const gyaonID = items.gyaonID;
                        upload(gyaonID, new Blob(recordedChunks))
                            .then(response => {
                                console.dir(response);
                                recordedChunks.length = 0;
                                if (response.status === 200) {
                                    //アップロードに成功
                                    const uploadedURL = `${response.data.endpoint}/sound/${response.data.object.key}`;
                                    console.log(`uploadedURL : ${uploadedURL}`);
                                    pasteToClipBoard(uploadedURL);
                                } else {
                                    //TODO リトライ処理
                                    console.log("failed to upload");
                                }
                            })
                            .catch(error => {
                                //TODO リトライ処理
                                console.log(error)
                            })
                    } else {
                        console.log("item is undefined")
                    }
                })
            });
        });
    })
}

function startTabRecording(){
    try {
        tabRecord ();
    } catch (e) {
        console.log(e);
    }
}

function stopTabRecording() {
    try {
        tabRecorder.stop();
        console.log("stopTabRecording");
        chrome.browserAction.setIcon({path: deactiveIcon});
        chrome.browserAction.setBadgeText({text: ""});
    } catch (e) {
        console.log(e)
    }
}


async function startRecording() {
    if (recorder != null) {
        try {
            recorder.start();
        } catch (e) {
            console.log(e);
            //ここにMediaRecorderをリセット
            initRecorder();
        }

        console.log("startRecording");
        chrome.browserAction.setIcon({path: activeIcon});
        chrome.browserAction.setBadgeText({text: "REC"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#c0392b"});

        recognition.start();
        isRecognizing = true;
        console.log("recognition start");
    } else {
        console.log("recorder is null");
        reloadExtenison();
    }
}

async function stopRecording() {
    if (recorder != null) {
        recorder.stop();
        console.log("stopRecording");
        chrome.browserAction.setIcon({path: deactiveIcon});
        chrome.browserAction.setBadgeText({text: ""});

        recognition.stop();
        isRecognizing = false;
        console.log("recognition stopped");
    } else {
        console.log("recorder is null");
        reloadExtenison();
    }
}

chrome.browserAction.onClicked.addListener(tab => {
    console.log("browserAction is clicked");
    console.dir(tab);

    if (chrome.runtime.lastError && chrome.runtime.lastError.message.match(/cannot be scripted/)) {
        window.alert('It is not allowed to use Gyaon extension in this page.');
        chrome.browserAction.disable();
        reloadExtenison();
    }

    if (isRecording != true) {
        startRecording();
    } else {
        stopRecording();
    }
    isRecording = !isRecording;
});