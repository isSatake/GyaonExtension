import chromep from 'chrome-promise';

//localstorageにGyaonIDが無いか確認するスクリプト
//設定されてない場合や"undefined"な場合はerrorを返す

function getGyaonID(): Promise<String> {
    return new Promise<String>((resolve, reject) => {
        chromep.storage.local.get("gyaonID")
            .then(item => {
                const gyaonID: String = item.gyaonID;
                if (gyaonID === "undefined" || gyaonID == undefined ) {
                    reject(new Error("GyaonID is undefined"));
                } else {
                    resolve(gyaonID);
                }
            })
            .catch(error => {
                reject(error);
            })
    })
}

export default getGyaonID