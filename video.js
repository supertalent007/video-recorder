console.log("video.js loaded");

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

            mediaRecorder.onstop = function () {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'recording.webm';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
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
