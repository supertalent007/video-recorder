const API_URL = "https://yourarchiv.com/api";
var recordedChunks = [];
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
var title = '';
var description = '';

const options = {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: 2500000,
    bitsPerSecond: 2500000
};


chrome.runtime.onMessage.addListener(async (message) => {
    console.log("video.js received message:", message);

    if (message.type === "START_RECORDING") {
        console.log('START VIDEO RECORDING');
        // chrome.tabCapture.capture({ audio: true, video: true }, function (stream) {
        //     if (!stream) {
        //         console.error('Error capturing tab:', chrome.runtime.lastError.message);
        //         return;
        //     }

        //     mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

        //     recordedChunks = [];

        //     mediaRecorder.ondataavailable = function (event) {
        //         if (event.data.size > 0) {
        //             recordedChunks.push(event.data);
        //         }
        //     };

        //     mediaRecorder.start();
        // });

        chrome.tabCapture.capture({ audio: true, video: true }, function (stream) {
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
                cropCanvas.width = video.videoWidth;
                cropCanvas.height = video.videoHeight;
                videoContainer.appendChild(cropCanvas);

                const ctx = cropCanvas.getContext('2d');

                const drawFrame = () => {
                    ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
                    ctx.drawImage(video, 0, 0, cropCanvas.width, cropCanvas.height);
                    requestAnimationFrame(drawFrame);
                };

                drawFrame();
                startRecording(cropCanvas, stream);
            }

            async function startRecording(canvas, originalStream) {
                const croppedVideoStream = canvas.captureStream(30);

                const audioTrack = originalStream.getAudioTracks()[0];
                const combinedStream = new MediaStream([audioTrack]);

                croppedVideoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

                mediaRecorder = new MediaRecorder(combinedStream, options);

                mediaRecorder.ondataavailable = function (event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                        console.log('Data available:', event.data.size);
                    }
                };

                mediaRecorder.start();
                console.log('MediaRecorder instance:', mediaRecorder);
            }
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
        title = message.title;
        description = message.description;

    } else if (message.type === 'START_SECTION_RECORDING') {
        chrome.tabCapture.capture({ audio: true, video: true }, function (stream) {
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
                startRecording(cropCanvas, stream);
            }

            async function startRecording(canvas, originalStream) {
                const croppedVideoStream = canvas.captureStream(30);

                const audioTrack = originalStream.getAudioTracks()[0];
                const combinedStream = new MediaStream([audioTrack]);

                croppedVideoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

                mediaRecorder = new MediaRecorder(combinedStream, options);

                mediaRecorder.ondataavailable = function (event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                        console.log('Data available:', event.data.size);
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
    } else if (message.type === 'UPLOAD_VIDEO') {
        if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            uploadVideo(blob);
        }
    } else if (message.type === 'DOWNLOAD_VIDEO') {
        if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'section_recording.webm';

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            console.log("error!!!!!!!!!!!")
        }
    }
});

async function uploadVideo(blob) {
    const url = `${API_URL}/ext/video`;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', new Date().toISOString().slice(0, 16));
    const filename = `video_${Math.floor(Math.random() * 100000000)}.webm`;
    formData.append('video', blob, filename);
    const token = await GetStorageToken("token");

    const xhr = new XMLHttpRequest();

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', 'bearer ' + token);

    // Add event listener for progress
    xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log(progress)
            chrome.runtime.sendMessage({ type: 'UPLOAD_PROGRESS_BAR', progress: progress });
        }
    });

    xhr.onload = () => {
        if (xhr.status === 200) {
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
