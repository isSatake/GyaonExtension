window.onload = function() {
    console.log("this is option page");
    const deactiveIcon = chrome.runtime.getURL("/icons/deactive.png");

    const idForm = document.getElementById("idForm") as HTMLTextAreaElement ;
    const idButton = document.getElementById("idButton");

    idButton.addEventListener('click', function (event) {
        //idFormに入力された文字列をIDとして取得する
        initExtension(idForm.value)
    });

    function initExtension (gyaonID : String) {
        //gyaonIDを保存しておく
        chrome.storage.local.set({gyaonID : `${gyaonID}` });

        chrome.storage.local.get("gyaonID",function (item) {
            console.log(item);
        })

        navigator.mediaDevices.getUserMedia({audio : true})
            .then(function (stream: MediaStream){
                console.log("granted")
                chrome.browserAction.enable()
                // chrome.browserAction.setIcon(deactiveIcon as any);
            })
            .catch() as Promise<MediaStream>

    }
};
