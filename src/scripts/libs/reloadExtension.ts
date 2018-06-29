//拡張機能自体をリロードするスクリプト
async function reloadExtenison() {
    console.log(`Gyaon Extension will be reload`);
    chrome.runtime.reload();
}

export default reloadExtenison