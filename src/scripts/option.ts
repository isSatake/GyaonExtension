
window.onload = function () {
    console.log("this is option page");
    const idForm = document.getElementById("idForm") as HTMLTextAreaElement;
    const idButton = document.getElementById("idButton");
    const deactiveIcon = chrome.runtime.getURL("/icons/deactive.png");

    //以前にGyaonIDが設定されていた場合、中身を当該IDにする
    chrome.storage.local.get("gyaonID", item =>{
        if (item != undefined) {
            console.log(item.gyaonID);
            idForm.value = item.gyaonID;
        }
    });

    //登録ボタンを押すと入力された値をGyaonIDとして登録する
    idButton.addEventListener('click', function (event) {
        console.log(`gyaonID is now set : ${idForm.value}`);
        initExtension(idForm.value);
    });

    function initExtension (gyaonID : String) {
        chrome.storage.local.set({gyaonID: `${gyaonID}`});

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                console.log("MIC access granted");
                chrome.runtime.sendMessage({message: "notification", text: "マイクアクセスが許可されました。ご利用いただけます。"});
                chrome.browserAction.enable();
                chrome.browserAction.setIcon({path: deactiveIcon});
            })
            .catch(error => {
                console.log(error);
                if (error.name === "NotAllowedError") {
                    chrome.runtime.sendMessage({message: "notification", text: "マイクアクセスの許可が得られませんでした。"});
                }
            })
    }
};
