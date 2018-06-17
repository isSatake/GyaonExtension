import {upload} from "gyaonup";
import thenChrome from "then-chrome";

declare var MediaRecorder: any;
declare var webkitSpeechRecognition: any;

const disabelIcon = chrome.runtime.getURL("/icons/disable.png");
const activeIcon = chrome.runtime.getURL("/icons/active.png");
const deactiveIcon = chrome.runtime.getURL("/icons/deactive.png");
const bigIcon = chrome.runtime.getURL("/icons/bigicon.png");

//インストール時に実行する
chrome.runtime.onInstalled.addListener(details => {
    chrome.browserAction.disable();
    chrome.browserAction.setIcon({path: disabelIcon});
    console.log(`Install reason : ${details.reason}, previous version : ${details.previousVersion}`);
    //ペースト用のDOMを設定
    const backGroundTextArea = document.createElement("textArea");
    backGroundTextArea.id = "textArea";
    document.body.appendChild(backGroundTextArea);
    //インストールしたらまずGyaonIDを設定してもらう
    chrome.runtime.openOptionsPage();
    // chrome.storage.local.get("gyaonID", item =>{
    //     if (item != undefined) {
    //         //すでに設定されてる場合はスキップする
    //         console.dir(item.gyaonID);
    //         initialize();
    //     } else {
    //         chrome.runtime.openOptionsPage();
    //     }
    // });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // if (request.message === "initExtension") {
    //     console.log("initExtension");
    // } else
    if (request.message === "notification") {
        const text = request.text;
        console.log(text);
        notificate(text);
    }
});

//通知用関数
function notificate(message) {
    const notifOption = {
        type: "basic",
        iconUrl: bigIcon,
        title: "GyaonExtension",
        message: `${message}`
    };

    chrome.notifications.getPermissionLevel(function (level) {
        if (level === "granted") {
            console.log("granted");
            chrome.notifications.create(notifOption);
        } else if (level === "denied") {
            console.log("User has elected not to show notifications from the app or extension.")
        }
    })
}

function reloadExtenison() {
    console.log(`Gyaon Extension will be reload`);
    chrome.runtime.reload();
}

function pasteToClipBoard(text) {
    const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
    textArea.value = text;
    textArea.select();
    document.execCommand("copy");
}

function sendURLtoScrapbox(url, title) {
    const queryInfo = {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };

    chrome.tabs.query(queryInfo, function (result) {
        const currentTab = result.shift();
        const sendData = {cmd: "pasteToScrapbox", url: url, title: title};

        chrome.tabs.sendMessage(currentTab.id, sendData, function () {
        });
    })
}

function reNameSoundFile(id: String) {
    const url = `https://gyaon.com/comment/${id}`;
    const method = "POST";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({value: recognizedText});
    fetch(url, {method, headers, body})
        .then(response => {
            console.dir(response);
            if (response.status == 200) {
                notificate(`音声をアップロードしました。
                : ${recognizedText}`);
            }
        })
        .catch(console.error);
    }

let recorder: any;
let isRecording: boolean = false;
let isScrapbox: boolean = false;
let isRecognizing: boolean = false;
let recognizedText: String;


const recordedChunks = [];
navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        recorder = new MediaRecorder(stream);
        recorder.addEventListener('dataavailable', function (event) {
            recordedChunks.push(event.data);
            console.dir(recordedChunks);

            const downloadLink = document.getElementById('download') as HTMLAnchorElement;
            const downloadURL = URL.createObjectURL(new Blob(recordedChunks));
            console.log(downloadURL);
            //TODO async-await化
            // thenChrome.storage.local.get('gyaonID')
            //     .then(item => {
            //         if (item != undefined) {
            //             upload(item, new Blob(recordedChunks))
            //                 .then(response => {
            //                     console.dir(response)
            //                 })
            //                 .catch(error => {
            //                     console.log(error)
            //                 })
            //         } else {
            //             console.log("item is undefined")
            //         }
            //     })
            //     .catch(error => {
            //         console.log(error)
            //     })

            //通常のコールバック関数
            chrome.storage.local.get("gyaonID", function (items) {
                if (items != undefined) {
                    const gyaonID = items.gyaonID;
                    upload(gyaonID, new Blob(recordedChunks))
                        .then(response => {
                            console.dir(response);
                            recordedChunks.length = 0
                            if (response.status === 200) {
                                //アップロードに成功
                                const uploadedURL = `${response.data.endpoint}/sound/${response.data.object.key}`;
                                console.log(`uploadedURL : ${uploadedURL}`);
                                pasteToClipBoard(uploadedURL);
                                if (recognizedText != undefined) {
                                    console.log("renaming...");
                                    reNameSoundFile(response.data.object.key);
                                } else {
                                    console.log("something went wrong")
                                }
                                //Scrapboxの場合はオーディオ記法で貼り付ける
                                if (isScrapbox) {
                                    sendURLtoScrapbox(uploadedURL, recognizedText);
                                }

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

            // downloadLink.href = downloadURL;
            // downloadLink.download = 'acetest.wav';
            // chrome.downloads.download({
            //     url:downloadURL,
            //     filename:'GyaonExtension.wav'
            // }, error => {
            //     console.log(error)
            // });

        });
        // recorder.addEventListener('stop', function () {
        //     const downloadLink = document.getElementById('download') as HTMLAnchorElement;
        //     downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
        //     downloadLink.download = 'acetest.wav';
        // });
    })
    .catch(error => {
        console.dir(error)
    });

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

function startRecording() {
    if (recorder != null) {
        recorder.start();
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

function stopRecording() {
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

function onRecordingAudioIsReady(event) {
    // const audioDOM = document.getElementById("audio") as HTMLAudioElement;
    // audioDOM.src = URL.createObjectURL(event.data);
    // audioDOM.play();
}

chrome.browserAction.onClicked.addListener(tab => {
    console.log("browserAction is clicked");
    console.dir(tab);

    if (chrome.runtime.lastError && chrome.runtime.lastError.message.match(/cannot be scripted/)) {
        window.alert('It is not allowed to use Gyaon extension in this page.');
        chrome.browserAction.disable();
        reloadExtenison();
    }

    //ES2017だとuncludesが使えるらしいぞ
    if (tab.url.indexOf("https://scrapbox.io/") !== -1) {
        console.log("this site is scrapbox!");
        isScrapbox = true;
    }

    if (isRecording != true) {
        startRecording();
    } else {
        stopRecording();
    }
    isRecording = !isRecording;
});