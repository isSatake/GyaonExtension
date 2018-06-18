const closeButton = chrome.runtime.getURL("/icons/close.png");

function appendPrompt (text: String) {
    let gyaonPrompt = document.querySelector(".gyaonDOM")  as HTMLDivElement;

    if (gyaonPrompt != null) {

    } else {
        gyaonPrompt = document.createElement('div');
        gyaonPrompt.id = "gyaonFlame";
        gyaonPrompt.className = "gyaonDOM";
        document.body.appendChild(gyaonPrompt);

        const TopMessage = document.createElement('h3');
        TopMessage.id = "topMessage";
        TopMessage.innerText = "Saved!";
        gyaonPrompt.appendChild(TopMessage);

        const savedMessage = document.createElement('p');
        savedMessage.id = "savedMessage";
        savedMessage.innerText = "Gyaonのリンクがコピーされました";
        gyaonPrompt.appendChild(savedMessage);

        const editContainer = document.createElement('div');
        editContainer.id = "editContainer";
        gyaonPrompt.appendChild(editContainer);

        const fileNameTextArea = document.createElement('span');
        fileNameTextArea.id = "fileNameTextArea";
        fileNameTextArea.contentEditable = "true";
        if (text != undefined) {
            fileNameTextArea.innerText = text.toString();
        }
        editContainer.appendChild(fileNameTextArea);

        const reNameButton = document.createElement('button');
        reNameButton.id = "reNameButton";
        reNameButton.innerText = "保存する";
        reNameButton.addEventListener('click',function () {
            renameFileName(fileNameTextArea.innerText);
        });
        editContainer.appendChild(reNameButton);

        const closeButton = document.createElement('div');
        closeButton.id = "closePromptButton";
        closeButton.style.backgroundImage = `url(${closeButton})`;
        closeButton.addEventListener('click', function () {
            removePrompt();
        });
        editContainer.appendChild(closeButton);

    }
}

function renameFileName (text: String) {

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
    } else if (message.cmd === "openPrompt") {
        console.log("openPrompt");
        appendPrompt(message.text)
    } else if (message.cmd === "closePrompt") {
        console.log("closePrompt");
    }
});
