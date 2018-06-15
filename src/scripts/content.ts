chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.cmd === "pasteToScrapbox") {
        const pasteText = `[  ${message.url}]`;
        console.log(pasteText);
        document.execCommand("insertText",false, pasteText);
    }
});
