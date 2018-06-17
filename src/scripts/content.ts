

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