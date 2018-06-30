import notifiCate from "./notifiCate";

//音声リネーム用のスクリプト
//音声認識ができた場合 => 認識結果を入れる
//tab録音の場合 => 録音したtabのページタイトルを入れる
//その他ダイアログで入力しても良い事とする

async function reNameSoundFile(id: String, fileName: String) {
    const url = `https://gyaon.com/comment/${id}`;
    const method = "POST";
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({value: fileName});

    try {
        const request = await fetch(url, {method, headers, body});
        console.log(request);
        if (request.status == 200) {
            const message = `音声をアップロードしました。: ${fileName}`;
            await notifiCate(message).catch(() => {console.log(message);})
        }
    } catch (error) {
        console.log(error);
    }
}

export default reNameSoundFile