import {upload} from "gyaonup";
import thenChrome from "then-chrome";

declare var MediaRecorder: any;

const disabelIcon = chrome.runtime.getURL("/icons/disable.png");
const activeIcon = chrome.runtime.getURL("/icons/active.png");
const deactiveIcon = chrome.runtime.getURL("/icons/deactive.png");

//通知用関数
function notify(message) {
    const notifOption = {
        type: "basic",
        title: "GyaonExtension",
        message: `${message}`
    };

    chrome.notifications.getPermissionLevel(function (level) {
        if (level === "granted") {
            chrome.notifications.create(notifOption);
        } else if (level === "denied") {
            console.log("User has elected not to show notifications from the app or extension.")
        }
    })
}

//インストール時に実行する
chrome.runtime.onInstalled.addListener(details => {
    chrome.browserAction.disable();
    chrome.browserAction.setIcon({path : disabelIcon});
    console.log(`Install reason : ${details.reason}, previous version : ${details.previousVersion}`);
    //インストールしたらまずGyaonIDを設定してもらう
    chrome.runtime.openOptionsPage();
    initialize();
});

const backGroundTextArea = document.createElement("textArea");
backGroundTextArea.id = "textArea";
document.body.appendChild(backGroundTextArea);

function pasteToClipBoard(text) {
    const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
    textArea.value = text;
    textArea.select();
    document.execCommand("copy");

}

let recorder: any;
let isRecording: boolean = false;

function initialize() {
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

                //TODO Promise & async-await化
                chrome.storage.local.get("gyaonID", function (items) {
                    if (items != undefined) {
                        const gyaonID = items.gyaonID;
                        upload(gyaonID, new Blob(recordedChunks))
                            .then(response => {
                                console.dir(response);
                                recordedChunks.length = 0
                            })
                            .catch(error => {
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
        })
}

async function getGyaonID() {
    const gyaonID = await thenChrome.storage.local.get('gyaonID');
    return gyaonID
}

function startRecording() {
    if (recorder != null) {
        recorder.start();
        chrome.browserAction.setIcon({path : deactiveIcon});
    } else {
        console.log("recorder is null")
    }
}

function stopRecording() {
    if (recorder != null) {
        recorder.stop();
        chrome.browserAction.setIcon({path : deactiveIcon});
    } else {
        console.log("recorder is null")
    }
}

function onRecordingAudioIsReady(event) {
    // const audioDOM = document.getElementById("audio") as HTMLAudioElement;
    // audioDOM.src = URL.createObjectURL(event.data);
    // audioDOM.play();
}

chrome.browserAction.onClicked.addListener(tab => {
    console.log("browserAction is clicked");
    if (isRecording != true) {
        startRecording();
        chrome.browserAction.setIcon({path : activeIcon});
        chrome.browserAction.setBadgeText({text : "REC"});
        chrome.browserAction.setBadgeBackgroundColor({color : "#c0392b"});
        console.log("startRecording")
    } else {
        stopRecording();
        chrome.browserAction.setIcon({path : deactiveIcon});
        chrome.browserAction.setBadgeText({text : ""});
        console.log("stopRecording")
    }
    pasteToClipBoard(`isRecording + ${isRecording}`);
    isRecording = !isRecording;
});