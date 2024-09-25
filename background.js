let getTimerTab = null;
let recordStatus = 'INIT';
let videoRecordStatus = 'INIT';
let windowId;

chrome.runtime.onStartup.addListener(async () => {
  await chrome.storage.session.remove("optionTabId");
});

chrome.runtime.onMessage.addListener(async (e) => {
  const optionTabId = await getStorage("optionTabId");

  if (recordStatus === 'INIT' && e.type === "AUDIO_RECORD") {
    recordStatus = 'RECORDING';
    const s = await E();
    if (!s.id) return console.log("Error opening new tab"), !1;
    await setStorage("optionTabId", s.id);
  } else if (recordStatus === 'PAUSED' && e.type === 'AUDIO_RECORD') {
    recordStatus = 'RECORDING';
  } else if (recordStatus === 'RECORDING' && e.type === 'AUDIO_PAUSE') {
    recordStatus = 'PAUSED';
  } else if (e.type === 'AUDIO_STOP') {
    recordStatus = 'PAUSED';
    chrome.runtime.sendMessage({ type: 'STOP_RECORD' });
  }

  return (e.type === "OPTIONS_OPENED" && chrome.runtime.sendMessage({ type: "START_RECORD" }),
    e.type === "RECORD_STARTED" &&
    (getTimerTab = setInterval(I, 1e3), d()),
    (e.type === "RECORD_STOPPED" || e.type === "DELETE_RECORD") &&
    (await removeOptionTab(optionTabId)),
    !0
  );
});

chrome.runtime.onMessage.addListener(async message => {
  const optionTabId = await getStorage("optionTabId");

  if (videoRecordStatus === 'INIT' && message.type === "VIDEO_RECORD") {
    videoRecordStatus = 'RECORDING';
    const s = await VE();
    await setStorage("optionTabId", s.id);
  }
  if (message.type === 'START_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: "START_RECORDING" });
  } else if (message.type === 'PAUSE_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: "PAUSE_RECORDING" });
  } else if (message.type === 'RESUME_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: "RESUME_RECORDING" });
  } else if (message.type === 'STOP_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: "STOP_RECORDING" });
  } else if (message.type === 'CLOSE_TAB') {
    await removeOptionTab(optionTabId);

    chrome.windows.remove(windowId, function () {
      console.log(`Window with ID ${windowId} has been closed.`);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['contentScript.js']
      });

      chrome.tabs.sendMessage(tabs[0].id, { action: 'FINISHED_UPLOADING' });
    });
  } else if (message.type === 'PREPARE_SECTION_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({
      type: "PREPARE_SECTION_RECORDING",
      sx: message.sx,
      sy: message.sy,
      sWidth: message.sWidth,
      sHeight: message.sHeight,
      dx: message.dx,
      dy: message.dy,
      dWidth: message.dWidth,
      dHeight: message.dHeight
    });
  } else if (message.type === 'START_SECTION_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: 'START_SECTION_RECORDING' });
  } else if (message.type === 'STOP_SECTION_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: 'STOP_SECTION_RECORDING' });
  } else if (message.type === 'PAUSE_SECTION_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: 'PAUSE_SECTION_RECORDING' });
  } else if (message.type === 'RESUME_SECTION_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: 'RESUME_SECTION_RECORDING' });
  } else if (message.type === 'RELOAD') {
    chrome.runtime.reload();
  } else if (message.type === 'UPLOAD_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: 'UPLOAD_VIDEO' });
  } else if (message.type === 'DOWNLOAD_VIDEO_RECORDING') {
    chrome.runtime.sendMessage({ type: 'DOWNLOAD_VIDEO' });
  }
});

function E() {
  return chrome.tabs.create({
    pinned: true,
    active: false,
    url: `chrome-extension://${chrome.runtime.id}/content.html`
  });
}
// function VE() {
//   return new Promise((resolve, reject) => {
//     chrome.windows.create({
//       type: 'normal',
//       focused: false,
//       url: `chrome-extension://${chrome.runtime.id}/video.html` // Open the URL during window creation
//     }, function (window) {
//       if (chrome.runtime.lastError) {
//         return reject(chrome.runtime.lastError);
//       }

//       console.log('New window created with ID:', window.id);
//       windowId = window.id;

//       chrome.windows.update(window.id, { state: 'minimized' }, function (updatedWindow) {
//         if (chrome.runtime.lastError) {
//           return reject(chrome.runtime.lastError);
//         }

//         console.log('Window minimized with ID:', updatedWindow.id);

//         // Find the newly created tab (this will be the only tab)
//         const tabId = updatedWindow.tabs[0].id;
//         resolve(tabId);
//       });
//     });
//   });
// }

function VE() {
  return new Promise((resolve, reject) => {
    chrome.windows.create({
      type: 'normal',
      focused: false
    }, function (window) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      console.log('New window created with ID:', window.id);
      windowId = window.id;

      chrome.windows.update(window.id, { state: 'minimized' }, function (updatedWindow) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        console.log('Window minimized with ID:', updatedWindow.id);

        chrome.tabs.create({
          windowId: updatedWindow.id,
          url: `chrome-extension://${chrome.runtime.id}/video.html`,
          active: true
        }, function (tab) {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }

          console.log('New tab created with ID:', tab.id);
          resolve(tab.id);
        });

        chrome.tabs.query({ windowId: window.id }, function (tabs) {
          chrome.tabs.remove(tabs[0].id, function () { })
        });
      });
    });
  });
}

async function removeOptionTab(e) {
  recordStatus = 'INIT';
  videoRecordStatus = 'INIT';
  clearInterval(getTimerTab);
  chrome.action.setBadgeText({
    text: ""
  }),
    typeof e == "number" &&
    (await removeTabs(e), chrome.storage.session.remove("optionTabId")),
    !0
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.session.set({ [key]: value }, () => {
      resolve(value);
    });
  });
}

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.session.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

function removeTabs(e) {
  return new Promise((resolve, reject) => {
    chrome.tabs.remove(e).then(resolve).catch(reject);
  });
};

async function I() {
  const e = await getStorage("optionTabId");

  chrome.runtime.sendMessage({ type: 'record_status', payload: recordStatus });
  typeof e == "number" &&
    chrome.tabs.get(e).catch(async () => {
      (await removeTabs(e), chrome.storage.session.remove('optionTabId'))
    });
}

const d = () => {
  chrome.action.setBadgeText({
    text: "REC"
  }),
    chrome.action.setBadgeBackgroundColor({
      color: "#DD0000"
    });
}