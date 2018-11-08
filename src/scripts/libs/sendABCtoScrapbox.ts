import chromep from "chrome-promise";
import getActiveTab from "./getActiveTab";
declare function require(x: string): any;
const translator = require('custom-translate');


async function sendABCtoScrapbox(recogText : string): Promise<Boolean> {
    return new Promise<Boolean>(async (resolve, reject) => {
        const activeTab = await getActiveTab();
        if (activeTab.url.includes("https://scrapbox.io")) {

            const STTN_table = {
                "ド|ど" : "C",
                "レ|れ" : "D",
                "ミ|み" : "E",
                "ファ|ふぁ" : "F",
                "ソ|そ" : "G",
                "ラ|ら" : "A",
                "シ|し" : "B"
            };

            const converted = translator.regexTrans(recogText, STTN_table);

            const pasteText = `${converted}|`;
            await chromep.tabs.executeScript(activeTab.id, {code: `document.execCommand("insertText",false, "${pasteText}");`});
            resolve(true);
        } else {
            reject(new Error("this is not Scrapbox"))
        }
    });
}

export default sendABCtoScrapbox