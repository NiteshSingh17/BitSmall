
(
  function () {
    this.GLOBAL_KEYS = {
      userLocalStorage: '@User_Info_Localstorage',
      userSettingStorage: '@User_Settings_LocalStorage'
    }
    this.typingTimer = {};
    this.settings = { primaryColor: 'orange', primaryColorCode: 'ec740d', panelSize: 1.2, lastActiveTab: 'search', autoCheck: false }
    this.userInfo;
    this.apiBaseUrl = "https://bitsmallapi.onrender.com/";
    this.COLORS = {
      orange: 'ec740d',
      successPostAll: '48BB78',
      bluePostAll: '4299E1',
      purple: '5243aa',
      teal: '00a3bf',
      cornflowerBlue: '253858',
      redPostAll: 'ea5e5e'
    }

    async function getSystemHeight() {
      const systemInfo = await chrome.system.display.getInfo();
      if (systemInfo.length === 0) return;
      const height = systemInfo[0].bounds.height;
      const relativeHeight = height > 1600 ? 2 : height < 500 ? .5 : parseFloat(height / 750);
      const newPanelHeight = parseFloat(relativeHeight).toFixed(1);
      this.settings = { ...this.settings, panelSize: newPanelHeight };
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      // sendMessageToAllTabs({ message: "toggleLoader", position: 'page', show: true });

      switch (message.type) {
        case 'getSettings':
          if (message.page === 'popup') {
            chrome.runtime.sendMessage({
              message: "setSettings",
              settings: this.settings
            });
          } else {
            chrome.tabs.sendMessage(sender.tab.id, { message: "setSettings", settings: this.settings });
          }
          break;
        case 'setSettings':
          this.settings = { ...this.settings, ...message.newSettings };
          this.settings = { ...this.settings, primaryColorCode: this.COLORS[this.settings.primaryColor] }
          updateUserLocalSettings(this.settings)
          if (message.page === 'popup')
            chrome.runtime.sendMessage({ message: "setSettings", settings: this.settings });
          else
            chrome.tabs.sendMessage(sender.tab.id, { message: "setSettings", settings: this.settings });
          break;
        case "changeScreen":
          handleChangeScreen(sender, message)
          break;
        case 'httpApiCall':
          handelApiRequest({ sender: Object.assign({}, sender), ...message });
          break
        case 'getPostAllPanel':
          chrome.tabs.sendMessage(sender.tab.id, { message: "setPostAllPanelReference" });
          break;
        case 'runScript':
          chrome.tabs.sendMessage(sender.tab.id, { message: "addEvenListner", page: message.page });
          break;
        case "toggleLoader":
          chrome.tabs.sendMessage(sender.tab.id, { message: "toggleLoader", position: message.position, show: message.show });
          break;
        case "getBaseUrl":
          chrome.tabs.sendMessage(sender.tab.id, { message: message.action, url: this.apiBaseUrl, page: message.page });
          break;
        case "uploadFile":
          handelUploadFile({ sender, ...message });
        case "getTorrentDownloadUrl":
          if (!sender.frameId) return;
          chrome.tabs.sendMessage(sender.tab.id, { message: "getTorrentDownloadUrl", page: 'downloadTorrent' });
          break;
        case "openTorrentDownloadUrl":
          if (!sender.frameId) return;
          chrome.tabs.sendMessage(sender.tab.id, { message: "openTorrentDownloadUrl", page: 'downloadTorrent', ...message })
          break;
        case "getUserInfo":
          return chrome.tabs.sendMessage(sender.tab.id, { message: "getUserInfo", page: message.page, userInfo: this.userInfo })
        case "toggleActivePageGifPanel":
          return chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tab = tabs.length > 0 ? tabs[0] : null;
            if(!tab) return;
            chrome.tabs.sendMessage(tab.id, { message: 'togglePostAllGifPanel' });
          })
        case "checkTokensActivePage":
          return chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tab = tabs.length > 0 ? tabs[0] : null;
            if(!tab) return;
            chrome.tabs.sendMessage(tab.id, { message : "runchange" });
          })
        case "openNewTab":
          if (message.api)
            chrome.tabs.create({ url: this.apiBaseUrl + message.url + "&colorScheme=" + this.COLORS[this.settings.primaryColor] });
          else
            chrome.tabs.create({ url: message.url });
          break;
      }
    });

    const removeAllLoader = (sender) => {
      chrome.tabs.sendMessage(sender.tab.id, { message: "toggleLoader", position: 'page', show: false });
      chrome.tabs.sendMessage(sender.tab.id, { message: "toggleLoader", position: 'bottom', show: false });
    }
    const handleChangeScreen = (sender, message) => {
      const newPage = message.newPage;
      this.settings = { ...this.settings, ...message.newSettings };
      updateUserLocalSettings(this.settings)
      if (!this.userInfo && (newPage === 'createToken' || newPage === 'myList')) {
        this.settings = { ...this.settings, lastActiveTab: 'signup' };
        updateUserLocalSettings(this.settings)
        chrome.tabs.sendMessage(sender.tab.id, { message: "setSettings", settings: this.settings });
      } else
        if (newPage === 'signOut')
          logoutUser(sender);
        else
          chrome.tabs.sendMessage(sender.tab.id, { message: "setSettings", settings: this.settings });
    }

    const logoutUser = (sender) => {
      chrome.tabs.sendMessage(sender.tab.id, { message: "toggleLoader", position: 'page', show: true });
      const onSuccess = (data) => {
        removeUserData();
        chrome.tabs.sendMessage(sender.tab.id, { message: "toggleLoader", position: 'page', show: false });
        this.settings = { ...this.settings, lastActiveTab: 'search' };
        updateUserLocalSettings(this.settings)
        sendMessageToAllTabs({ message: "getUserInfo", page: 'nav', userInfo: '' })
        chrome.tabs.sendMessage(sender.tab.id, { message: "setSettings", settings: this.settings });
      }
      handelApiRequest({ sender: null, url: 'logout', method: "POST", headers: {}, body: null, onSuccessEvent: onSuccess })
    }
    async function handelUploadFile({ sender, url, method = 'POST', body = {}, onSuccessEvent = '' }) {
      var formData = new FormData();
      for (var key in body) {
        formData.append(key, body[key]);
      }
      if (formData.get('file')) {
        const fileData = await getFileData(JSON.parse(formData.get('file')));
        formData.delete('file')
        formData.append('file', fileData);
      }
      handelApiRequest({ sender, url, method, body: formData, onSuccessEvent })
    }

    function sendMessageToAllTabs(message) {
      chrome.tabs.query({},
        function (tabs) {
          for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, message);
          }
        }
      );
    }

    const getFileData = (src) => {
      const { type, name, lastModified } = src;
      const binStr = atob(src.value);
      const arr = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i);
      const data = [arr.buffer];
      return new File(data, name, { type, lastModified });
    }

    async function handelApiRequest({ sender, url, method = "GET", headers = {}, body = null, onSuccessEvent }) {
      var apiurl = this.apiBaseUrl + url;
      const data = {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors',
        body: body,
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      }
      requestHandler(apiurl, data).then(data => {
        if (data.message === 'unautherized') {
          removeUserData();
          this.settings = { ...this.settings, lastActiveTab: 'signup' };
          updateUserLocalSettings(this.settings)
          if (sender) removeAllLoader(sender);
          chrome.tabs.sendMessage(sender.tab.id, { message: "setSettings", settings: this.settings });
          chrome.tabs.sendMessage(sender.tab.id, { message: 'showError', error: data.error })
          return;
        } else if (data.type === 'error') {
          removeAllLoader();
          chrome.tabs.sendMessage(sender.tab.id, { message: 'showError', error: data.error })
        }
        else if (typeof onSuccessEvent === 'function')
          onSuccessEvent(data)
        else if (sender)
          chrome.tabs.sendMessage(sender.tab.id, { message: onSuccessEvent, data: data })
      }).catch(err => {
        removeAllLoader(sender);
        chrome.tabs.sendMessage(sender.tab.id, { message: 'showError', error: err.message })
      })
    }

    async function requestHandler(url, data) {
      const response = await fetch(url, data);
      return response.json()
    }

    function handleUpcomingRequest(data) {
      if (data.type === "xmlhttprequest" && this.settings.autoCheck) {
        chrome.alarms.clear(`runContent@${data.tabId}`);
        this.typingTimer[data.tabId] = true;
        chrome.alarms.create(`runContent@${data.tabId}`, { delayInMinutes: 0.012 });
      }
    }

    chrome.runtime.onMessageExternal.addListener(
      function (request, sender, sendResponse) {
        const senderUrl = new URL(sender.url);
        const apiUrl = new URL(this.apiBaseUrl);
        if (senderUrl.origin === apiUrl.origin) {
          if (request.type === "successAuth") {
            const onSuccess = (data) => {
              this.userInfo = data;
              this.settings = { ...this.settings, lastActiveTab: 'search' };
              updateUserLocalSettings(this.settings)
              sendResponse(true);
              sendMessageToAllTabs({ message: "setSettings", settings: this.settings });
              sendMessageToAllTabs({ message: "getUserInfo", page: 'nav', userInfo: data });
              chrome.storage.local.set({ [this.GLOBAL_KEYS.userLocalStorage] : data}, () => {
                console.log('Stored name: ' + data);
              });
            }
            handelApiRequest({ sender: null, url: 'me/info', method: "POST", headers: {}, body: null, onSuccessEvent: onSuccess })
          }
        }
      });

    const removeUserData = () => {
      chrome.storage.local.set({ [this.GLOBAL_KEYS.userLocalStorage] : null }, () => {
        this.userInfo = null;
      });
    }

    const updateUserLocalSettings = (newSetting) => {
      chrome.storage.local.set({ [this.GLOBAL_KEYS.userSettingStorage] : newSetting});
    }

    const setUserDefaultData = () => {
      chrome.storage.local.get([this.GLOBAL_KEYS.userLocalStorage], (result) => {
        if(result[this.GLOBAL_KEYS.userLocalStorage])
          this.userInfo = result[this.GLOBAL_KEYS.userLocalStorage];
        else 
          this.userInfo = null;
      })
      chrome.storage.local.get([this.GLOBAL_KEYS.userSettingStorage], (result) => {
        if(result[this.GLOBAL_KEYS.userSettingStorage])
          this.settings = result[this.GLOBAL_KEYS.userSettingStorage];
      })
    }

    chrome.runtime.onInstalled.addListener((object) => { 
      if(object.reason === chrome.runtime.OnInstalledReason.INSTALL)
      {
        const websiteUrl = 'https://bit-small.vercel.app/';
        chrome.tabs.create({ url: websiteUrl });
      }
    })

    chrome.alarms.onAlarm.addListener(function (a) {
      const prefix = a.name.split('@');
      if (prefix[0] === 'runContent') {
        chrome.tabs.sendMessage(parseInt(prefix[1]), { "message": "runchange" });
      }
    });
    getSystemHeight();
    setUserDefaultData();
    chrome.webRequest["onCompleted"].addListener(handleUpcomingRequest, { urls: ["http://*/*", "https://*/*"] });
  }()
)
