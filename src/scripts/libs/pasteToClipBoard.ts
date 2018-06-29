//渡されたテキスト(URL等)をクリップボードに貼り付けるスクリプト
async function pasteToClipBoard(text): Promise<Boolean> {
    return new Promise<Boolean>( async (resolve, reject) => {
        try {
            const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
            textArea.value = text;
            textArea.select();
            document.execCommand("copy");
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

export default pasteToClipBoard