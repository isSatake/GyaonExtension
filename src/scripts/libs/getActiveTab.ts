//アクティブなタブを取ってくる関数
import chromep from "chrome-promise";
import Tab = chrome.tabs.Tab;

async function getActiveTab(): Promise<Tab> {
    return new Promise<Tab>(async (resolve, reject) => {
        try {
            const tabs = await chromep.tabs.query({active: true, currentWindow: true});
            resolve(tabs.shift() as Tab);
        } catch (error) {
            reject(error);
        }
    })
}

export default getActiveTab