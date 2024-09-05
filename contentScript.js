function injectCSS(css) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

const modalCSS = `
    #screenRecorderModal {
        background-color: rgba(0, 0, 0, 0.5);
    }

    #screenRecorderModalContent {
        font-family: 'Arial', sans-serif;
        color: #fff;
        background-color: #333;
        padding: 10px;
        border-radius: 8px;
    }

    #btnRecordStart, #btnRecordStop {
        border: none;
        color: white;
        font-size: 16px;
        border-radius: 50%;
        cursor: pointer;
        background-color: transparent;
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
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        justify-content: left;
        align-items: end;
        pointer-events: none;
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
    }

    #timer {
        color: #3a3a3a;
    }
`;

injectCSS(modalCSS);

const modal = document.createElement('div');
modal.id = 'screenRecorderModal';
modal.style.fontFamily = 'Arial, sans-serif';

const modalContent = document.createElement('div');
modalContent.id = "modalContent";

modalContent.innerHTML = `
<button id="btnRecordStart" class="disabled">
<svg fill="#3A3A3A" width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
<title>pause</title>
<path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"></path>
</svg>
</button>
<button id="btnRecordStop" class="disabled">
<svg width="20px" height="20px" viewBox="0 0 24 24" fill="#3A3A3A" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12z" fill="#3A3A3A"/></svg>
</button>
<span id="timer">00:00:00</span>
<button id="closeModal">
<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#3A3A3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</button>
`;

modal.appendChild(modalContent);
document.body.appendChild(modal);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startRecording') {
        // Remove 'disabled' class from the btnRecordStart button
        $('#btnRecordStart').remove('disabled');

        // Use the stream ID or pass the stream for future use in this script
        const streamId = message.streamId;
        console.log('Stream ID received:', streamId);

        // Optionally, you can set up further logic to use the stream if needed
    }
});


let timerInterval;
let seconds = 0;

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        let hrs = Math.floor(seconds / 3600);
        let mins = Math.floor((seconds % 3600) / 60);
        let secs = seconds % 60;
        document.getElementById('timer').textContent =
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

document.getElementById('btnRecordStart').addEventListener('click', () => {
    document.getElementById('btnRecordStart').disabled = true;
    document.getElementById('btnRecordStop').disabled = false;
    startTimer();
});

document.getElementById('btnRecordStop').addEventListener('click', () => {
    document.getElementById('btnRecordStart').disabled = false;
    document.getElementById('btnRecordStop').disabled = true;
    clearInterval(timerInterval);
});

document.getElementById('closeModal').addEventListener('click', () => {
    modal.remove();
});