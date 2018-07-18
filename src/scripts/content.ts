import {LinkHTMLAttributes} from "react";

async function appendPrompt () {
    let gyaonPrompt = document.querySelector(".gyaonDOM")  as HTMLDivElement;

    if (gyaonPrompt != null) {

    } else {
        gyaonPrompt = document.createElement('div');
        gyaonPrompt.className = "gyaonDOM";
        gyaonPrompt.style.zIndex = "2147483647";
        gyaonPrompt.style.position = "relative";
        gyaonPrompt.style.paddingLeft = "10px";
        gyaonPrompt.style.paddingTop = "10px";
        document.body.appendChild(gyaonPrompt);
    }
}

async function removePrompt () {
    const gyaonPrompt = document.querySelector(".gyaonDOM");

    if (gyaonPrompt != null) {
        gyaonPrompt.remove();
        // notificate("removeNewType")
        chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {

        } );
    } else {
        console.log("gyaonPrompt is null")
    }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

});

window.onload = async function() {

    function isAudioelm (object) : Boolean {
       try {
           object as HTMLAudioElement
           return true
       } catch (e) {
           return false
       }
    }

    async function gyaonify (){
        const gyaonLinks = Array.from(document.body.querySelectorAll('a'))
            .filter( item => {
                return item.innerText.includes("https://gyaon.com/sound/") && item.parentElement.classList.contains("c-message__body")
            });
        console.log(gyaonLinks);

        gyaonLinks.forEach(async item => {
            const gyaonURL = item.innerText;
            const audioElms = document.createElement('audio') as HTMLAudioElement;
            audioElms.classList.add("gyaonElm");
            item.parentElement.appendChild(audioElms);
            audioElms.src = gyaonURL;
            audioElms.innerText = "♫";
            item.addEventListener( 'mouseover', function(event){
                console.log("Mouse Over!");
                audioElms.play();
            });
            item.addEventListener('mouseout', function (event) {
                console.log("Mouse Out!");
                audioElms.pause();
                audioElms.currentTime = 0;
            })
        });

        const spanElm =  Array.from(document.body.querySelectorAll('span'))
            .filter( item => {
                return item.classList.contains("emoji") && item.classList.contains("emoji-sizer")
            });

        spanElm.forEach(item => {
            item.addEventListener('mouseover', function(event){
                console.log("Mouse Over!");
                const audioElm = document.createElement('audio') as HTMLAudioElement;
                audioElm.classList.add("gyaonElm");
                item.parentElement.appendChild(audioElm);
                if (item.innerText == ":soudane:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sounds/hykwtakumin/db6f222e6ae43f5b891ee830cc156e8f.wav";
                } else if (item.innerText ==":soukana:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sound/30daec59b25c285d48b58010609fa364.wav";
                } else if (item.innerText == ":soukamo:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sounds/hykwtakumin/4e777c3ab6667a90607d0c2b8a177b2e.wav";
                } else if (item.innerText == ":wakaru:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sound/da73ea5b4361d2be5a89ba4fdd7108c1.wav";
                } else if (item.innerText == ":wakaru-:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sound/639cf42494cdecf2821f5b7f044ff67a.wav";
                } else if (item.innerText == ":goodpoem:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sounds/hykwtakumin/6dab65613f44d86963d6dece2db08003.wav";
                } else if (item.innerText == ":tada:") {
                    audioElm.src = "https://gyaon.com/sound/2016-06-20%2020:31:00.wav";
                } else if (item.innerText == ":congratulations:") {
                    audioElm.src = "https://gyaon.com/sound/2016-06-20%2020:31:00.wav";
                } else if (item.innerText == ":sugoikakumei:") {
                    audioElm.src = "https://gyaon.com/sound/367c2dc19e285e4404f0df374c0a952b.wav";
                } else if (item.innerText == ":tashikani:") {
                    audioElm.src = "https://gyaon.herokuapp.com/sounds/hykwtakumin/86428cf1fc9676e1823c91c9e1008287.wav";
                }
                audioElm.play();
            });
            item.addEventListener('mouseout', function (event) {
                const audioElms = item.nextElementSibling as HTMLAudioElement;
                audioElms.pause();
                audioElms.currentTime = 0;
            })
        });
        console.log(spanElm);
    }
    const targetDOM = document.getElementById("messages_container") as HTMLDivElement;

    const observeOption = {
        childList:true,
        subtree: true
    };


    const observer = new MutationObserver(records => {
        gyaonify();
    });
    observer.observe(targetDOM, observeOption);
};
