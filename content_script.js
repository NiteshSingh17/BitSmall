(function(){
  this.tokenPrefixes = { postall : "@bs_" }
  this.allgifurl = new Map();
  this.postAllPanelRef = null;
  this.defaultSettings = {};
  this.typekey = ['', ''];
  this.isCheckingPageTokens = false;
  this.apiHostUrl = 'https://bitsmallapi.onrender.com/'
  setPostAllPanelReference = (ref) => {
    this.postAllPanelRef = ref;
  }
  function addKeyTypeListener() {
    this.removeGifPanelTimeout = null;
    this.gifPanel = null;
    document.addEventListener('keydown', onkdown.bind(this));
    async function onkdown(e) {
      if (e.key.length === 1) {
        this.typekey[0] = this.typekey[1];
        this.typekey[1] = e.key;
        if (this.typekey[0] === ';' && this.typekey[1] === ';') {
          togglePostAllGifPanel()
        }if(this.typekey[0] === 'q' && this.typekey[1] === 'q' && !this.isCheckingPageTokens){
          resetTypeKey();
          checkPageTokens({forceCheck : true})
        }
      }
    };
  }
  function resetTypeKey(){
    this.typekey = ['',''];
  }

  function togglePostAllGifPanel(){
    if (this.gifPanel && this.removeGifPanelTimeout) {
      clearTimeout(this.removeGifPanelTimeout);
    }
    else if (this.gifPanel) {
      window.setTimeout(() => {
        if (this.gifPanel)
        document.body.removeChild(this.gifPanel);
          this.gifPanel = null;
      }, 800);
    }
    else if (!this.gifPanel) {
      // this.gifPanel = createPostAllPanel();
      this.gifPanel = createPanel();
    }

    if (this.postAllPanelRef.querySelector('.mcontainer').classList.contains('hidePostAllPanel')) {
      window.setTimeout(() => {
        this.postAllPanelRef.querySelector('.mcontainer').classList.add('showPostAllPanel');
        this.postAllPanelRef.querySelector('.mcontainer').classList.remove('hidePostAllPanel');
      }, 50);
    } else {
      this.postAllPanelRef.querySelector('.mcontainer').classList.add('hidePostAllPanel');
      this.postAllPanelRef.querySelector('.mcontainer').classList.remove('showPostAllPanel');
    }
    resetTypeKey()
  }

  addKeyTypeListener();
  
  //chrome.runtime.sendMessage({ for: "cheval", type: "content" }, chanpage);

  function isValid(node){
    this.notValidItems = ['SCRIPT', 'STYLE', 'INPUT']
    this.valid = this.notValidItems.indexOf(node.nodeName) === -1;
    if (this.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  function checkElement(chone) {
    this.totalstr = "";
    if (chone?.children?.length !== 0 || !isValid(chone) || (chone?.parentNode?.contenteditable === 'true' || chone?.contenteditable === 'true')) {
      return;
    }
    if (chone.dataset.precheck !== undefined) return;
    chone.dataset.precheck = "false";
    this.intex = chone.childNodes[0];
    if (!this.intex?.data?.includes(this.tokenPrefixes.postall)) return;
    this.onintext = this.intex.data.split(" ");
    this.onintext.forEach(one => {
      if (one.substring(0, this.tokenPrefixes.postall.length) == this.tokenPrefixes.postall) {
        this.id = one.substring(this.tokenPrefixes.postall.length);
        this.p = document.createElement('p');
        this.p.dataset['postallelement'] = true;
        this.p.dataset['postallkey'] = this.id;
        this.p.dataset['fullpostalltoken'] = one;
        this.p.dataset['precheck'] = "false";
        this.p.innerText = this.id + one.substring(4 + this.id);
        this.addtex = document.createTextNode(this.totalstr.substring(1));
        chone.insertBefore(this.addtex, this.intex);
        this.totalstr = "";
        chone.insertBefore(this.p, this.intex);
      }
      else { this.totalstr += " " + one; }
    });
    if (this.totalstr.length > 0) {
      this.addtex2 = document.createTextNode(this.totalstr.substring(1));
      chone.insertBefore(this.addtex2, this.intex);

    }
    chone.removeChild(this.intex);
  }

async function chanpage(chev, changedNodes) {
    if (chev) {
      this.allNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, null) 
      //|| document.querySelectorAll(':not([data-precheck])');
      this.chone;
      while (this.chone = this.allNodes.nextNode()) {
        await checkElement(this.chone)
      }

      document.querySelectorAll("[data-postallelement]").forEach(one => {
        if (one.dataset.precheck === "false") {
          one.dataset.precheck = "true";
          this.allgifurl.set(one.dataset.postallkey, true);
          one.innerText = "[GIF]";
        }
      })
      this.allid = "";
      this.i = this.allgifurl.keys();
      this.cur = this.i.next();
      for (; this.cur.value != undefined;) {
        this.allgifurl.delete(cur.value);
        this.allid += `,${this.cur.value}`; 
        this.cur = this.i.next();
      }
      this.allid = this.allid.substring(1);
      getimgsrc(this.allid);
      this.isCheckingPageTokens = false;
    }
  }

  const checkPageTokens = ({ forceCheck = false }) => {
    if((!this.isCheckingPageTokens && this.defaultSettings.autoCheck) || forceCheck ){
      chanpage(1)
      this.isCheckingPageTokens = true;
    }
  }

  window.setTimeout( () => checkPageTokens({}), 1000 );

  const gotoNewPage = (page) => {
    if(!this.postAllPanelRef) return;
    cleanupPostallPanel();
    switch (page) {
      case 'search':
        addSearchScreen();
        break;
      case 'myList':
        addMyListScreen();
        break;
      case 'login':
        return addLoginScreen();
      case 'signup':
        return addSignupScreen()
      case 'createToken':
        return createTokenScreen()
      case 'setting':
        createSettingScreen()
        return 
    }
  }

  function cleanupPostallPanel(){
    let postAllGifOverview = postAllPanelRef.querySelector('.postAllGifOverview');
    var newGifOverview = postAllGifOverview.cloneNode(true);
    postAllGifOverview.parentNode.replaceChild(newGifOverview, postAllGifOverview);
    newGifOverview.style.display = 'none';
    newGifOverview.style.left = "0px";
  }

  function createSettingScreen(){
    const createSetting = (html) => {
      const callback = () => chrome.runtime.sendMessage({ type: "runScript", page: 'setting' });
      addToDomSafely(this.postAllPanelRef.querySelector('#postAllExtMainContent'), html, 1, callback)
    }
    ReadFileAsText(getSourceRelativeUrl('/src/setting/setting.html'), createSetting);
  }

  function createTokenScreen() {
    const createToken = (html) => {
      const callback = () => chrome.runtime.sendMessage({ type: "runScript", page: 'createToken' });
      addToDomSafely(this.postAllPanelRef.querySelector('#postAllExtMainContent'), html, 1, callback)
    }
    ReadFileAsText(getSourceRelativeUrl('/src/createToken/createToken.html'), createToken);
  }

  function addSignupScreen() {
    const addSignUp = (html) => {
      const callback = () => chrome.runtime.sendMessage({ type: "runScript", page: 'signup' });
      addToDomSafely(this.postAllPanelRef.querySelector('#postAllExtMainContent'), html, 1, callback)
    }
    ReadFileAsText(getSourceRelativeUrl('/src/signup/signup.html'), addSignUp);
  }

  function addLoginScreen() {
    const addLogin = (html) => {
      const callback = () => chrome.runtime.sendMessage({ type: "runScript", page: 'login' });
      addToDomSafely(this.postAllPanelRef.querySelector('#postAllExtMainContent'), html, 1, callback)
    }
    ReadFileAsText(getSourceRelativeUrl('/src/login/login.html'), addLogin);
  }

  function addSearchScreen() {
    const addSearch = (searchHtml) => {
      const callback = () => chrome.runtime.sendMessage({ type: "runScript", page: 'search' });
      addToDomSafely(this.postAllPanelRef?.querySelector('#postAllExtMainContent'), searchHtml, 1, callback)
    }
    ReadFileAsText(getSourceRelativeUrl('/src/search/search.html'), addSearch);
  }

  function addMyListScreen() {
    const addMyList = (addMyListHtml) => {
      const callback = () => chrome.runtime.sendMessage({ type: "runScript", page: 'myList' });
      addToDomSafely(this.postAllPanelRef.querySelector('#postAllExtMainContent'), addMyListHtml, 1, callback)
    }
    ReadFileAsText(getSourceRelativeUrl('/src/myList/myList.html'), addMyList);
  }

  async function getimgsrc(data) {
    if (data.length < 1) return;
    this.url = `getTokenById?ids=${data}`;
    chrome.runtime.sendMessage({ type: "httpApiCall", url: this.url, onSuccessEvent: "contentPageFindResponse" });
  };


  function gethttp() {
    var requ;
    if (window.XMLHttpRequest) {
      requ = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      requ = new ActiveXObject("Microsoft.XMLHttp");
    }
    return requ;
  }

  function getSourceRelativeUrl(path) {
    return chrome.runtime.getURL(path);
  }

  async function ReadFileAsText(path, callback) {
    var fileRead = gethttp();
    fileRead.onreadystatechange = function () {
      if (fileRead.readyState === 4) {
        callback(fileRead.response)
      }
    }
    await fileRead.open("GET", path);
    await fileRead.send(null);
  }

  function addToDomSafely(parentNode, value, repeatCount, callback) {
    if (repeatCount === 5) return;
    if (parentNode) {
      parentNode.innerHTML = value;
      callback();
    }
    else {
      addToDomSafely(parentNode, value, repeatCount + 1);
    }
  }

  function addNavBar(navBarString) {
    const callback = () => window.setTimeout(() => chrome.runtime.sendMessage({ type: "runScript", page: 'nav' }), 100);
    addToDomSafely(this.postAllPanelRef.querySelector('#postAllExtSideBar'), navBarString, 1, callback)
    gotoNewPage(this.defaultSettings.lastActiveTab)
  }

  function createPostAllPanel(shadow) {
    // const upperContainer = document.createElement('div')
    // const shadow = upperContainer.attachShadow({ mode: 'open' });
    var di = document.createElement('div');
    const route = getSourceRelativeUrl('');
    const globalCss = getSourceRelativeUrl('/css.css');
    const navBarSource = getSourceRelativeUrl('/src/nav/navbar.html');
    ReadFileAsText(navBarSource, addNavBar);
    di.innerHTML = `
    <link href=${globalCss} rel="stylesheet" type="text/css"> 
    <div id="postAllInnerContent">
      <div id='errorConatianer'>
      </div>
      <div id="postAllLoaderContainter">
        <div class='centerPostAll'>
        <div class='postAllLoader'>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve">
            <rect x="0" y="10" width="4" height="10" fill="#333" opacity="0.2">
              <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="8" y="10" width="4" height="10" fill="#333"  opacity="0.2">
              <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
            </rect>
            <rect x="16" y="10" width="4" height="10" fill="#333"  opacity="0.2">
              <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
        </div>
      </div>
      <div id='postAllExtSideBar'></div>
      <div id='postAllExtMainContent'>
      </div> 
    <div>`;
    di.classList.add('mcontainer', 'hidePostAllPanel');
    shadow.appendChild(di);

    // document.body.appendChild(upperContainer)

    var gifOverview = document.createElement('div');
    gifOverview.classList.add('postAllGifOverview');
    di.appendChild(gifOverview)
    di.addEventListener('keydown', e => e.stopPropagation())
    di.addEventListener('keyup', e => e.stopPropagation())
    return di;
  }

  const handleTokenRequestResponse = (data) => {
    data.forEach(oneres => {
      var tokenId = oneres.id;
      document.querySelectorAll(`[data-fullpostalltoken='${tokenId}']`).forEach(one => {
        one.innerText = '';
        const shadowDiv = one.attachShadow({mode: 'open'});
        const cssLink = document.createElement('link');
        cssLink.href = getSourceRelativeUrl(('/src/css/'+ oneres.type + 'Content.css' ))
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        shadowDiv.appendChild(cssLink);
        var varibleStyle = document.createElement('style');
        varibleStyle.type = 'text/css';
        varibleStyle.innerText = `:host { --primaryPostAll: ${ this.defaultSettings.primaryColorCode } }`;
        shadowDiv.appendChild(varibleStyle);
        // styleSheet.setProperty('--primaryPostAll', this.defaultSettings.primaryColorCode );
        
        if(oneres.type === 'image'){
          const img = document.createElement('img');
          img.src = oneres.data.value;
          shadowDiv.appendChild(img);
        }
        else if(oneres.type === 'video' || oneres.type === 'file'){
          handleTorrentRes(oneres, shadowDiv)
        }else if(oneres.type === 'text'){
          const div = document.createElement('div');
          div.innerText = oneres.data.value;
          shadowDiv.appendChild(div);
        }
        one.dataset.fullpostalltoken = "";
      });
    });
  }
  function createError(msg){
    
    this.errorContainer = this.postAllPanelRef.querySelector('#errorConatianer');
    const error = createElement('div', '', ['error','flexPostAll']);
    this.errorMsgContainer = createElement('div', '', ['flexPostAll']);
    this.icon = createElement('div','', ['iconError','searchFileIcon']);
    this.msg = createElement('div', msg, ['errormsg']);
    this.close = createElement('div', '', ['closeIcon','searchFileIcon']);
    this.handleClose = (node) => {
      const errorContainer = this.postAllPanelRef.querySelector('#errorConatianer');
      errorContainer.removeChild(node)
    }
    const closeTimeout = window.setTimeout( () => this.handleClose(error) , 5000 );
    this.handleClickClose = () => {  
      if(closeTimeout) clearTimeout(closeTimeout);
      this.handleClose(error); 
    }
    this.close.addEventListener('click',this.handleClickClose)
    appendChilds(this.errorMsgContainer, [this.icon, this.msg]);
    appendChilds(error, [this.errorMsgContainer, this.close]);
    appendChilds(this.errorContainer, [error])
  }

  const handleTorrentRes = (res, par) => {
    const mainContainer = createElement('div');
    if(res.type === 'video'){
      const playAvatar = createElement('div', '', ['avatar-sm']);
      playAvatar.addEventListener('click', () => addIframeVideo(mainContainer,res) )
      const playIcon = createElement('div', '', ['playIconBt']);
      playIcon.style.content = "url("+ getSourceRelativeUrl('images/files/videoIcon.png') + ")";
      appendChilds(playAvatar, [playIcon])
      appendChilds(mainContainer, [playAvatar])
    }else{
      const downloadAvatar = createElement('div', '', ['avatar-sm']);
      downloadAvatar.addEventListener('click', () => addIframeDownload(mainContainer,res) )
      const downloadIcon = createElement('div', '', ['downloadIconBt']);
      downloadIcon.style.content = "url("+ getSourceRelativeUrl('images/files/download.png') + ")";
      appendChilds(downloadAvatar, [downloadIcon])
      appendChilds(mainContainer, [downloadAvatar])
    }
    appendChilds(par, [mainContainer])
  }
  
  const addIframeDownload = (parent, file) => {
    let src = '';
    const isTorrentToken = file.tokenType === 'pirate-bay';
    if(isTorrentToken){
      parent.innerText = '';
      src = this.apiHostUrl + 's/d/s?magnet=' + file.data.value;
    }else{
      src = file.data.value;
    }
    const vIframe = createElement('iframe', '', [(isTorrentToken ? 'videoIframelg' : 'hide')], '', { src: src })
    
    appendChilds(parent, [vIframe])
  }
  const addIframeVideo = (parent, file) => {
    let src = '';
    const isTorrentToken = file.tokenType === 'pirate-bay';
    if(isTorrentToken){
      src = this.apiHostUrl + 'streamTorrent?magnet=' + file.data.value;
    }else{
      src = file.data.value;
    }
    parent.innerText = '';
    const vIframe = createElement('iframe', '', ['videoIframelg'], '', { src: src, allowFullscreen: true })
    
    appendChilds(parent, [vIframe])
  }

  function createPanel () {
      const div = document.createElement('span');
      div.classList.add("postAllPanelReff")
      const shadow = div.attachShadow({mode: 'open'});
      createPostAllPanel(shadow)
      setPostAllPanelReference(shadow)
      document.body.appendChild(div)
      chrome.runtime.sendMessage({ type: "getPostAllPanel" });
      return div;
  }
  
  function createElement(type, innerText, classes, id, attr) {
    const ele = document.createElement(type);
    if (classes) ele.classList.add(...classes)
    if (innerText) {
      if (type === 'input' || type === 'textarea')
        ele.value = innerText;
      else
        ele.innerText = innerText;
    }
    if (id) ele.id = id;
    if (attr) {
      Object.keys(attr).forEach(k => { ele[k] = attr[k] })
    }
    return ele;
  }

  function appendChilds(node, childs) {
    childs.forEach(c => node.appendChild(c))
  }

  chrome.runtime.sendMessage({ type: "getSettings" })
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      
      if (request.message === "reload") {
        window.location.href = document.URL;
      }
      else if (request.message === "runchange") {
        if(!this.isCheckingPageTokens){
          checkPageTokens({ forceCheck: true })
        }
      }
      else if (request.message === 'toggleLoader') {
        const loader = postAllPanelRef.querySelector('#postAllLoaderContainter');
        loader.style.classList = [];
        loader.style.display = request.show ? 'block' : 'none';
        switch (request.position) {
          case "bottom":
            loader.classList.add('postAllLoaderBottom');
            return
          case 'page':
            loader.classList.add('postAllLoaderPage');
            return
        }
      }
      else if (request.message === 'contentPageFindResponse') {
        handleTokenRequestResponse(request.data)
      }
      else if(request.message === 'setPostAllPanelReference'){
        setPostAllPanelReference(document.querySelector(".postAllPanelReff").shadowRoot)
      }else if(request.message === 'showError'){
        createError(request.error)
      }
      else if (request.message === "setSettings") {
        if(request.settings.lastActiveTab !== this.defaultSettings.lastActiveTab){
          gotoNewPage(request.settings.lastActiveTab)
        }
        this.defaultSettings = request.settings;
      }else if (request.message === 'togglePostAllGifPanel'){
        togglePostAllGifPanel();
      }
    }
  )
;}())
