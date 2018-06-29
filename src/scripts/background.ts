import {upload} from "gyaonup";
import chromep from 'chrome-promise';
import getGyaonID from './libs/getGyaonID';
import notifiCate from './libs/notifiCate';
import reloadExtenison from './libs/reloadExtension';
import pasteToClipBoard from './libs/pasteToClipBoard';
import Tab = chrome.tabs.Tab;

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
        await notifiCate(text).catch(() => {console.log(text)});
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

async function sendURLtoScrapbox(url, title): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve, reject) => {
        const activeTab = await getActiveTab();
        if (activeTab.url.includes("https://scrapbox.io")) {
            const pasteText = `[${title} ${url}]`;
            await chromep.tabs.executeScript(activeTab.id, {code: `document.execCommand("insertText",false, "${pasteText}");`});
            resolve(true);
        } else {
            resolve(false)
        }
    });
}

async function reNameSoundFile(id: String, fileName: String) {
    const url = `https://gyaon.com/comment/${id}`;
    const method = "POST";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({value: fileName});

    try {
        const request = await fetch(url, {method, headers, body});
        console.log(request);
        if (request.status == 200) {
            const message = `音声をアップロードしました。: ${fileName}`;
            await notifiCate(message).catch(() => {console.log(message);})
        }
    } catch (error) {
        console.log(error);
    }
}

let recorder: any;
let tabRecorder: any;
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

            //GyaonIDが設定されているかチェックする
            try {
                const gyaonID = await getGyaonID();
                console.log(gyaonID);
                const request = await upload(gyaonID.toString(), new Blob(recordedChunks));
                console.dir(request);
                if (request.status === 200) {
                    recordedChunks.length = 0;
                    const uploadedURL = `${request.data.endpoint}/sound/${request.data.object.key}`;
                    console.log(`uploadedURL : ${uploadedURL}`);
                    await pasteToClipBoard(uploadedURL);

                    if (recognizedText != undefined) {
                        console.log("renaming...");
                        reNameSoundFile(request.data.object.key, recognizedText);
                        sendURLtoScrapbox(uploadedURL, recognizedText);
                    } else {
                        console.log("認識できませんでした。");
                        const activeTab = await getActiveTab();
                        reNameSoundFile(request.data.object.key, activeTab.title);
                        sendURLtoScrapbox(uploadedURL, activeTab.title);
                    }
                } else {
                    console.log("failed to upload");
                }

            } catch (error) {
                console.log(error);
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

async function tabRecord() {
    try {
        const tabStream = await chromep.tabCapture.capture({audio: true});
        const audioDOM = document.getElementById("audio") as HTMLAudioElement;
        audioDOM.src = URL.createObjectURL(tabStream);
        audioDOM.play();

        tabRecorder = new MediaRecorder(tabStream);
        tabRecorder.start();

        console.log("startTabRecording");
        chrome.browserAction.setIcon({path: activeIcon});
        chrome.browserAction.setBadgeText({text: "REC"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#3c4dc0"});

        tabRecorder.addEventListener('dataavailable', async (event) => {
            tabStream.getAudioTracks()[0].stop();
            audioDOM.pause();
            audioDOM.src = "";
            recordedChunks.push(event.data);
            console.dir(recordedChunks);
            try {
                const gyaonID = await getGyaonID();
                const request = await upload(gyaonID.toString(), new Blob(recordedChunks));
                if (request.status === 200) {
                    recordedChunks.length = 0;
                    const uploadedURL = `${request.data.endpoint}/sound/${request.data.object.key}`;
                    console.log(`uploadedURL : ${uploadedURL}`);
                    const capturedTab = await chromep.tabCapture.getCapturedTabs();
                    const capTab = capturedTab.shift().tabId;
                    const getTab = await chromep.tabs.get(capTab);
                    await reNameSoundFile(request.data.object.key, getTab.title);
                    await pasteToClipBoard(uploadedURL);
                    await sendURLtoScrapbox(uploadedURL, getTab.title);
                } else {
                    console.log("failed to upload");
                }
            } catch (error) {
                console.log(error);
            }
        })

    } catch (error) {
        console.log(error);
    }
}

//アクティブなタブを取ってくる関数
async function getActiveTab(): Promise<Tab> {
    return new Promise<Tab>(async (resolve, reject) => {
        try {
            const tabs = await chromep.tabs.query({active: true, currentWindow: true});
            resolve(tabs.shift() as Tab);
        } catch (error) {
            reject(error);
        }
    })
}

function startTabRecording() {
    try {
        tabRecord();
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