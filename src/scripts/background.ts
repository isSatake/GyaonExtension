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
    console.log(`Install reason : ${details.reason}, previous version : ${details.previousVersion}`);
    //インストールしたらまずGyaonIDを設定してもらう
    // chrome.runtime.openOptionsPage();
    //
});

const backGroundTextArea = document.createElement("textArea");
backGroundTextArea.id = "textArea";
document.body.appendChild(backGroundTextArea);

function pasteToClipBoard(text) {
    const textArea = document.getElementById("textArea");
    textArea.value = text;
    textArea.select();
    document.execCommand("copy");

}

let recorder;
let isRecording : boolean = false;
let clickCount : Number = 0;

async function initiallize() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            recorder = new MediaRecorder(stream);
            recorder.addEventListener('dataavailable', onRecordingAudioIsReady(event));
        })
        .catch(error => {
            console.dir(error)
        })
}

function startRecording () {
    if (recorder != null) {
        recorder.start();
    } else {
        console.log("recorder is null")
    }
}

function stopRecording () {
    if (recorder != null) {
        recorder.stop();
    } else {
        console.log("recorder is null")
    }
}

function onRecordingAudioIsReady (event) {
    const audioDOM = document.getElementById("audio");
    audioDOM.src = URL.createObjectURL(event.data);
    audioDOM.play();
}

chrome.browserAction.onClicked.addListener(tab => {
    console.log("browserAction is clicked");
    if (isRecording != true) {
        startRecording()
        console.log("startRecording")
    } else {
        stopRecording()
        console.log("stopRecording")
    }
    pasteToClipBoard(`isRecording + ${isRecording}`);
    isRecording = !isRecording;
});