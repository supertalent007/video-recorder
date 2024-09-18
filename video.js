const API_URL = "https://yourarchiv.com/api";

var mediaRecorder;

chrome.runtime.onMessage.addListener(async (message) => {
    console.log("video.js received message:", message);

    if (message.type === "START_RECORDING") {
        console.log('START VIDEO RECORDING');
        chrome.tabCapture.capture({ audio: false, video: true }, function (stream) {
            if (!stream) {
                console.error('Error capturing tab:', chrome.runtime.lastError.message);
                return;
            }

            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

            const chunks = [];

            mediaRecorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async function () {
                const blob = new Blob(chunks, { type: 'video/webm' });

                await uploadVideo(blob);
            };

            mediaRecorder.start();
            console.log('Recording started 🎥');
        });
    } else if (message.type === 'STOP_RECORDING') {
        console.log('STOP VIDEO RECORDING');
        if (mediaRecorder) {
            mediaRecorder.stop();
            console.log('Recording stopped 🛑');
        }
    }
});

async function uploadVideo(blob) {
    const url = `${API_URL}/ext/video`;
    const formData = new FormData();
    formData.append('title', 'Full Screen Video');
    formData.append('description', 'This is a full screen video');
    formData.append('date', new Date().toISOString().slice(0, 16));
    const filename = `video_${Math.floor(Math.random() * 100000000)}.webm`; // Using .webm extension
    formData.append('video', blob, filename);
    const token = await GetStorageToken("token");

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', 'bearer ' + token);

    xhr.onload = () => {
        if (xhr.status === 200) {
            alert('Video uploaded successfully');
            chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
        } else {
            const x = JSON.parse(xhr.response);
            alert(x.error.message[0]);
        }
    };

    xhr.onerror = () => {
        alert('An error occurred during the upload.');
    };

    xhr.send(formData);
}

async function GetStorageToken(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    });
}
