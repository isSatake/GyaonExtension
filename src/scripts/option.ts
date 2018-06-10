window.onload = function() {
    console.log("this is option page");

    const idForm = document.getElementById("idForm") as HTMLTextAreaElement ;
    const idButton = document.getElementById("idButton");

    idButton.addEventListener('click', function (event) {
        //idFormに入力された文字列をIDとして取得する
        initExtension(idForm.value)
    });

    function initExtension (gyaonID : String) {
        //gyaonIDを保存しておく
        chrome.storage.local.set({gyaonID : `${gyaonID}` });
        // navigator.getUserMedia({audio: {
        //         googEchoCancellation: "false",
        //         googAutoGainControl: "false",
        //         googNoiseSuppression: "false",
        //         googHighpassFilter: "false"
        //     }
        // }, function () {
        //
        // }, function (error) {
        //
        // }) as NavigatorUserMedia
        navigator.mediaDevices.getUserMedia({audio : true})
            .then(function (stream: MediaStream){

            })
            .catch() as Promise<MediaStream>

    }
};
