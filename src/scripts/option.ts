import chromep from 'chrome-promise';
import getGyaonID from './libs/getGyaonID'

window.onload = async function () {
    console.log("this is option page");
    const idForm = document.getElementById("idForm") as HTMLTextAreaElement;
    const idButton = document.getElementById("idButton");
    const deactiveIcon = chrome.runtime.getURL("/icons/deactive.png");

    //以前にGyaonIDが設定されていた場合、中身を当該IDにする
    // const localGyaonID = await chromep.storage.local.get("gyaonID");
    //
    // idForm.value = localGyaonID.gyaonID;
    // if (idForm.value === "undefined") {
    //     idForm.value = null
    // } else {
    //     console.dir(`GyaonID : ${localGyaonID.gyaonID}`);
    // }
    try {
        const localGyaonID = await getGyaonID();
        console.log(localGyaonID);
        idForm.value = localGyaonID.toString();
    } catch (e) {
        console.log(e)
    }


    //登録ボタンを押すと入力された値をGyaonIDとして登録する
    idButton.addEventListener('click', function (event) {
        console.log(`gyaonID is now set : ${idForm.value}`);
        initExtension(idForm.value);
    });

    async function initExtension (gyaonID : String) {
        await chromep.storage.local.set({gyaonID: `${gyaonID}`});
        try {
            await navigator.mediaDevices.getUserMedia({audio: true});
            console.log("MIC access granted");
            chrome.runtime.sendMessage({message: "notification", text: "マイクアクセスが許可されました。ご利用いただけます。"});
            chrome.browserAction.enable();
            chrome.browserAction.setIcon({path: deactiveIcon});
        } catch (error) {
            console.log(error);
            if (error.name === "NotAllowedError") {
                chrome.runtime.sendMessage({message: "notification", text: "マイクアクセスの許可が得られませんでした。"});
            }
        }
    }

};
