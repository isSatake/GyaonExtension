import chromep from "chrome-promise";
import getActiveTab from "./getActiveTab";

async function sendURLtoScrapbox(url, title): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve, reject) => {
        const activeTab = await getActiveTab();
        if (activeTab.url.includes("https://scrapbox.io")) {
            const pasteText = `[${title} ${url}]`;
            await chromep.tabs.executeScript(activeTab.id, {code: `document.execCommand("insertText",false, "${pasteText}");`});
            resolve(true);
        } else {
            reject(new Error("this is not Scrapbox"))
        }
    });
}

export default sendURLtoScrapbox