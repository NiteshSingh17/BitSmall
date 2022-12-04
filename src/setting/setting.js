(function(){

  this.postAllPanelRef = null;
  this.settings={};

  chrome.runtime.onMessage.addListener(handleIncomingChromeRequest.bind(this));

  function handleIncomingChromeRequest(request, sender, sendResponse) {
    if(!request.page || request.page === 'setting' )
    switch (request.message){
        case 'setSettings':
            this.settings = request.settings;
            handleNewSettings();
            return;
        case "setPostAllPanelReference":
            this.postAllPanelRef = document.querySelector(".postAllPanelReff").shadowRoot;
            return;
        case "addEvenListner":
            addAllEvenListner();
            return;
        
    }
  }

  function addAllEvenListner(){
    handleNewSettings();
    this.postAllPanelRef.querySelector('#autoCheckPage').checked =  this.settings.autoCheck
    this.postAllPanelRef.querySelector('#autoCheckPage').addEventListener('change', (e) => changeAutoCheck(e.target.checked) )
    this.postAllPanelRef.querySelector(`#panelSize`).value = this.settings.panelSize;
    this.postAllPanelRef.querySelectorAll('.settingColorItem').forEach( item => item.addEventListener('click', () => changeColorScheme(item.getAttribute('value'))) )
    this.postAllPanelRef.querySelector(`#panelSize`)?.addEventListener('input', (e) => handlePanelSizeChange(parseFloat(e.target.value)) )
  }

  function handleNewSettings(){
    if(!this.postAllPanelRef) return;
    this.postAllPanelRef.querySelector(`.activeColorPanel`)?.classList?.remove('activeColorPanel')
    this.postAllPanelRef.querySelector(`.settingColorItem[value=${this.settings.primaryColor}]`)?.classList?.add('activeColorPanel')
  }

  function handlePanelSizeChange(size){
    if(size >= 0.5 && size <= 2){
      chrome.runtime.sendMessage({ type: "setSettings", newSettings: { panelSize: size } });
    }
  }

  function changeAutoCheck(value) {
    chrome.runtime.sendMessage({ type: "setSettings", newSettings: { autoCheck: value } });
  }

  function changeColorScheme(color){
    chrome.runtime.sendMessage({ type: "setSettings", newSettings: { primaryColor: color } });
  }

}())
