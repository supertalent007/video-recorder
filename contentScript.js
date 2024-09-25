function injectCSS(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

const modalCSS = `
    #screenRecorderModalContent {
        font-family: 'Arial', sans-serif;
        color: #fff;
        background-color: #333;
        padding: 10px;
        border-radius: 8px;
    }

    #btnRecordStart, #btnRecordStop, #btnRecordPause, #btnRecordResume, #btnDownload, #btnUpload, #closeModal {
        border: none;
        color: white;
        font-size: 16px;
        border-radius: 50%;
        cursor: pointer;
        background-color: transparent;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
    }

    #btnRecordResume {
        background: green;
    }

    .bg-red {
        background: red !important;
    }

    #closeModal {
        background-color: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
    }

    #timer {
        font-size: 18px;
        margin-left: 15px;
    }

    .disabled {
        opacity: 0.5;
        pointer-events: none;
    }
    #screenRecorderModal {
        position: fixed;
        top: -5px;
        left: 5px;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        justify-content: left;
        align-items: end;
        pointer-events: none;
        background: none;
    }

    #modalContent {
        background: #000;
        color: #fff;
        padding: 10px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        display: flex;
        align-items: center;
        spacing: 1;
    }

    #timer {
        color: #3a3a3a;
    }

    .none {
        display: none !important;
    }

`;

injectCSS(modalCSS);

// Check if the modal already exists before creating it
if (!document.getElementById('screenRecorderModal')) {
    const modal = document.createElement('div');
    modal.id = 'screenRecorderModal';
    modal.style.fontFamily = 'Arial, sans-serif';

    const modalContent = document.createElement('div');
    modalContent.id = "modalContent";

    modalContent.innerHTML = `
        <button id="btnRecordStart">
        <svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <title>start</title>
            <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="#FFFFFF" overflow="visible" style="marker:none" color="#000000"/>
        </svg>
        </button>
        <button id="btnRecordStop" class="disabled none bg-red">
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12z" fill="#FFFFFF"/></svg>
        </button>
        <button id="btnRecordPause" class="disabled">
        <svg fill="#FFFFFF" width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>pause</title>
        <path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"></path>
        </svg>
        </button>
        <button id="btnRecordResume" class="none">
        <svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <title>resume</title>
            <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="#FFFFFF" overflow="visible" style="marker:none" color="#000000"/>
        </svg>
        </button>
        <button id="btnDownload" class="disabled">
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z" fill="#FFFFFF"/>
        </svg>
        </button>
        <button id="btnUpload" class="disabled">
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16C15.4477 18 15 18.4477 15 19C15 19.5523 15.4477 20 16 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H8C8.55228 20 9 19.5523 9 19C9 18.4477 8.55228 18 8 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM15.7071 13.2929L12.7071 10.2929C12.3166 9.90237 11.6834 9.90237 11.2929 10.2929L8.29289 13.2929C7.90237 13.6834 7.90237 14.3166 8.29289 14.7071C8.68342 15.0976 9.31658 15.0976 9.70711 14.7071L11 13.4142V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13.4142L14.2929 14.7071C14.6834 15.0976 15.3166 15.0976 15.7071 14.7071C16.0976 14.3166 16.0976 13.6834 15.7071 13.2929Z" fill="#FFFFFF"/>
        </svg>
        </button>
        <span id="timer">00:00:00</span>
        <button id="closeModal">
        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

var isFullWidth = true;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'enableStartRecordingBtn') {
        console.log('Received message to enableStartRecordingBtn');

        const startRecordingBtn = document.getElementById('btnRecordStart');
        if (startRecordingBtn) {
            startRecordingBtn.classList.remove('disabled');
            sendResponse({ status: 'success' });
        } else {
            sendResponse({ status: 'failure', message: 'Button not found' });
        }
    } else if (message.action === 'enableStartSectionRecordingBtn') {
        isFullWidth = false;
        const startRecordingBtn = document.getElementById('btnRecordStart');
        if (startRecordingBtn) {
            startRecordingBtn.classList.remove('disabled');
            sendResponse({ status: 'success' });
        } else {
            sendResponse({ status: 'failure', message: 'Button not found' });
        }
    } else if (message.action === 'FINISHED_UPLOADING') {
        window.alert('Uploading video is finished.')
    }

    return true;
});

let timerInterval;
let seconds = 0;
let isPaused = false;

function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused) {
            seconds++;
            let hrs = Math.floor(seconds / 3600);
            let mins = Math.floor((seconds % 3600) / 60);
            let secs = seconds % 60;
            document.getElementById('timer').textContent =
                `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

document.getElementById('btnRecordStart').addEventListener('click', () => {
    document.getElementById('btnRecordStart').classList.add('none');
    document.getElementById('btnRecordStop').classList.remove('none');
    document.getElementById('btnRecordStop').classList.remove('disabled');
    document.getElementById('btnRecordPause').classList.remove('disabled');
    startTimer();

    if (isFullWidth) chrome.runtime.sendMessage({ type: 'START_VIDEO_RECORDING' });
    else chrome.runtime.sendMessage({ type: 'START_SECTION_VIDEO_RECORDING' });
});

document.getElementById('btnRecordPause').addEventListener('click', () => {
    document.getElementById('btnRecordPause').classList.add('none');
    document.getElementById('btnRecordResume').classList.remove('none');
    document.getElementById('btnRecordStop').classList.remove('bg-red');

    clearInterval(timerInterval);

    if (isFullWidth) chrome.runtime.sendMessage({ type: 'PAUSE_VIDEO_RECORDING' });
    else chrome.runtime.sendMessage({ type: 'PAUSE_SECTION_VIDEO_RECORDING' });

});

document.getElementById('btnRecordResume').addEventListener('click', () => {
    document.getElementById('btnRecordResume').classList.add('none');
    document.getElementById('btnRecordPause').classList.remove('none');
    document.getElementById('btnRecordStop').classList.add('bg-red');

    startTimer();

    if (isFullWidth) chrome.runtime.sendMessage({ type: 'RESUME_VIDEO_RECORDING' });
    else chrome.runtime.sendMessage({ type: 'RESUME_SECTION_VIDEO_RECORDING' });

});

document.getElementById('btnRecordStop').addEventListener('click', () => {
    document.getElementById('btnRecordStop').classList.add('disabled');
    document.getElementById('btnRecordPause').classList.add('disabled');
    document.getElementById('btnDownload').classList.remove('disabled');
    document.getElementById('btnUpload').classList.remove('disabled');

    clearInterval(timerInterval);

    if (isFullWidth) chrome.runtime.sendMessage({ type: 'STOP_VIDEO_RECORDING' });
    else chrome.runtime.sendMessage({ type: 'STOP_SECTION_VIDEO_RECORDING' });
});

document.getElementById('btnDownload').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'DOWNLOAD_VIDEO_RECORDING' });
});

document.getElementById('btnUpload').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'UPLOAD_VIDEO_RECORDING' });
});

document.getElementById('closeModal').addEventListener('click', async () => {
    clearInterval(timerInterval);
    await chrome.runtime.sendMessage({ type: 'RELOAD' });
    const existingModal = document.getElementById('screenRecorderModal');
    if (existingModal) existingModal.remove();
    chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
});
