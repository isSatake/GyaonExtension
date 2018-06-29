import chromep from 'chrome-promise';
const bigIcon = chrome.runtime.getURL("/icons/bigicon.png");
//ブラウザ通知用のスクリプト

async function notifiCate (message: String) :Promise<Boolean> {
    return new Promise<Boolean>(async (resolve, reject) => {
        const notifOption = {
            type: "basic",
            iconUrl: bigIcon,
            title: "GyaonExtension",
            message: `${message}`
        };
        try {
            await chromep.notifications.getPermissionLevel();
            chrome.notifications.create(notifOption);
            resolve(true);
        } catch (error) {
            reject(new Error("User has elected not to show notifications from the app or extension."));
        }
    });
}

export default notifiCate