const API_URL = "https://yourarchiv.com/api";
let recordedChunks = [];
var mediaRecorder;
var cropArea = {
    sx: 0,
    sy: 0,
    sWidth: 0,
    sHeight: 0,
    dx: 0,
    dy: 0,
    dWidth: 0,
    dHeight: 0
};

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
        });
    } else if (message.type === 'PAUSE_RECORDING') {
        mediaRecorder.pause();
    } else if (message.type === 'RESUME_RECORDING') {
        mediaRecorder.resume();
    } else if (message.type === 'STOP_RECORDING') {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    } else if (message.type === 'PREPARE_SECTION_RECORDING') {
        cropArea.sx = message.sx;
        cropArea.sy = message.sy;
        cropArea.sWidth = message.sWidth;
        cropArea.sHeight = message.sHeight;
        cropArea.dx = message.dx;
        cropArea.dy = message.dy;
        cropArea.dWidth = message.dWidth;
        cropArea.dHeight = message.dHeight;

    } else if (message.type === 'START_SECTION_RECORDING') {
        chrome.tabCapture.capture({ audio: false, video: true }, function (stream) {
            if (!stream) {
                console.error('Error capturing tab:', chrome.runtime.lastError.message);
                return;
            }

            const videoContainer = document.getElementById('videoContainer');
            const video = document.createElement('video');
            video.srcObject = stream;
            video.controls = true;
            videoContainer.appendChild(video);
            recordedChunks = [];

            video.onloadedmetadata = () => {
                video.play();

                setupCroppedViewAndStartRecording(video, cropArea);
            };

            function setupCroppedViewAndStartRecording(video, cropArea) {
                const cropCanvas = document.createElement('canvas');
                cropCanvas.id = 'cropCanvas';
                cropCanvas.width = cropArea.dWidth;
                cropCanvas.height = cropArea.dHeight;
                videoContainer.appendChild(cropCanvas);

                const ctx = cropCanvas.getContext('2d');

                const drawFrame = () => {
                    ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
                    ctx.drawImage(video, cropArea.sx, cropArea.sy, cropArea.sWidth, cropArea.sHeight, cropArea.dx, cropArea.dy, cropCanvas.width, cropCanvas.height);
                    requestAnimationFrame(drawFrame);
                };

                drawFrame();
                startRecording(cropCanvas);
            }

            async function startRecording(canvas) {
                const croppedStream = canvas.captureStream();

                mediaRecorder = new MediaRecorder(croppedStream, {
                    mimeType: 'video/webm'
                });

                mediaRecorder.ondataavailable = function (event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                        console.log('Data available:', event.data.size);
                    }
                };

                mediaRecorder.onstop = function () {
                    if (recordedChunks.length > 0) {
                        console.log(`Collected ${recordedChunks.length} recordedChunks`);
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });

                        uploadVideo(blob);

                        // const url = URL.createObjectURL(blob);
                        // const a = document.createElement('a');
                        // a.style.display = 'none';
                        // a.href = url;
                        // a.download = 'section_recording.webm';

                        // document.body.appendChild(a);
                        // a.click();
                        // window.URL.revokeObjectURL(url);
                        // document.body.removeChild(a);
                    } else {
                        console.error('No data chunks were collected.');
                    }
                };

                mediaRecorder.start();
                console.log('MediaRecorder instance:', mediaRecorder);
            }
        });

    } else if (message.type === 'PAUSE_SECTION_RECORDING') {
        if (mediaRecorder) {
            mediaRecorder.pause();
        }
    } else if (message.type === 'RESUME_SECTION_RECORDING') {
        if (mediaRecorder) {
            mediaRecorder.resume();
        }
    } else if (message.type === 'STOP_SECTION_RECORDING') {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    }
});

async function uploadVideo(blob) {
    const url = `${API_URL}/ext/video`;
    const formData = new FormData();
    formData.append('title', 'Real Test Sectional Screen Video');
    formData.append('description', 'This is a test sectional screen video');
    formData.append('date', new Date().toISOString().slice(0, 16));
    const filename = `video_${Math.floor(Math.random() * 100000000)}.webm`;
    formData.append('video', blob, filename);
    const token = await GetStorageToken("token");

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', 'bearer ' + token);

    xhr.onload = () => {
        if (xhr.status === 200) {
            // alert('Video uploaded successfully');
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
