
function appendPrompt () {
    let gyaonPrompt = document.querySelector(".gyaonDOM")  as HTMLDivElement;

    if (gyaonPrompt != null) {

    } else {
        gyaonPrompt = document.createElement('div');
        gyaonPrompt.className = "gyaonDOM";
        gyaonPrompt.style.zIndex = "2147483647";
        gyaonPrompt.style.position = "relative";
        gyaonPrompt.style.paddingLeft = "10px";
        gyaonPrompt.style.paddingTop = "10px";
        gyaonPrompt.style.fontSize = ".7em";
        document.body.appendChild(gyaonPrompt);
    }
}

function removePrompt () {
    const gyaonPrompt = document.querySelector(".gyaonDOM");

    if (gyaonPrompt != null) {
        gyaonPrompt.remove();
        // notificate("removeNewType")
    } else {
        console.log("gyaonPrompt is null")
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.cmd === "pasteToScrapbox") {
        //音声認識が成功していた場合貼り付け文に認識結果を含める
        let pasteText = `[  ${message.url}]`;
        const title = message.title;
        if (title != undefined && title !== "undefined") {
            pasteText = `[${title} ${message.url}]`;
        } else {
            console.log("title is null")
        }
        console.log(pasteText);
        document.execCommand("insertText",false, pasteText);
    }
});
