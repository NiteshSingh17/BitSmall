(function(){

    this.popupDocRef = document.body;
    this.settings={};
  
    chrome.runtime.onMessage.addListener(handleIncomingChromeRequest.bind(this));
  
    function handleIncomingChromeRequest(request, sender, sendResponse) {
      if(!request.page || request.page === 'setting' )
      switch (request.message){
          case 'setSettings':
              this.settings = request.settings;
              handleNewSettings();
              return;
      }
    }
    
    function openWebsite(){
      window.open('https://bit-small.vercel.app/')
    }

    function tooglePanel() {
      chrome.runtime.sendMessage({ type: "toggleActivePageGifPanel" });
   }

   function checkTokens() {
     chrome.runtime.sendMessage({ type: "checkTokensActivePage" });
  }

    function addAllEvenListner(){
      handleNewSettings();
      chrome.runtime.sendMessage({ type: "getSettings", page: 'popup' });
      this.popupDocRef.querySelector("#websiteText").addEventListener('click', openWebsite)
      this.popupDocRef.querySelector("#showPanelbt").addEventListener('click', tooglePanel)
      this.popupDocRef.querySelector("#convertTokenBt").addEventListener('click', checkTokens)
      this.popupDocRef.querySelector('#autoCheckPage').addEventListener('change', (e) => changeAutoCheck(e.target.checked) )
      this.popupDocRef.querySelectorAll('.settingColorItem').forEach( item => item.addEventListener('click', () => changeColorScheme(item.getAttribute('value'))) )
      this.popupDocRef.querySelector(`#panelSize`)?.addEventListener('input', (e) => handlePanelSizeChange(parseFloat(e.target.value)) )
    }
    addAllEvenListner();

    function handleNewSettings(){
      if(!this.popupDocRef) return;
      this.popupDocRef.querySelector(`.activeColorPanel`)?.classList?.remove('activeColorPanel')
      this.popupDocRef.querySelector(`.settingColorItem[value=${this.settings.primaryColor}]`)?.classList?.add('activeColorPanel')
      this.popupDocRef.querySelector('#autoCheckPage').checked =  this.settings.autoCheck
      this.popupDocRef.querySelector(`#panelSize`).value = this.settings.panelSize;
      this.r = document.querySelector(':root');
      this.r.style.setProperty('--primaryPostAll', `var(--${this.settings.primaryColor})`);
    }
  
    function handlePanelSizeChange(size){
      if(size >= 0.5 && size <= 2){
        chrome.runtime.sendMessage({ type: "setSettings", newSettings: { panelSize: size }, page: 'popup' });
      }
    }
  
    function changeAutoCheck(value) {
      chrome.runtime.sendMessage({ type: "setSettings", newSettings: { autoCheck: value }, page: 'popup' });
    }
  
    function changeColorScheme(color){
      chrome.runtime.sendMessage({ type: "setSettings", newSettings: { primaryColor: color }, page: 'popup' });
    }
  
  }())
  