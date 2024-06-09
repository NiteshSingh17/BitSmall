(function () {

  this.typingTimer;
  this.doneTypingInterval = 1000;
  this.curgifp = 0;
  let postAllPanelRef = null;
  let moreBt = null;
  this.curSearchType = 'gif';
  this.apiUrl = 'https://bitsmallapi.onrender.com/';
  this.hideOverviewPanelTimeout;

  const handleChromeRequest = (...props) => {
    handleIncomingChromeRequest(...props)
  }

  chrome.runtime.onMessage.addListener(handleChromeRequest);

  function handleIncomingChromeRequest(request, sender, sendResponse) {
    if (!request.page || request.page === 'search')
      switch (request.message) {
        case "addEvenListner":
          addAllEvenListner();
          return;
        case "setPostAllPanelReference":
          postAllPanelRef = document.querySelector(".postAllPanelReff").shadowRoot;
          return;
        case "searchQueryResponse":
          onchan(request.data)
          break;
      }
  }
  handleIncomingChromeRequest.bind(this)

  function addAllEvenListner() {
    this.gifin = postAllPanelRef.querySelector('.msear');
    this.moreBt = postAllPanelRef.querySelector('.loopt');
    this.gifin.addEventListener('keyup', (e) => { e.stopPropagation(); onSearchKeyup(this.gifin.value); });
    this.gifin.addEventListener('keydown',(e) => { e.stopPropagation(); onSearchKeyDown() });
    postAllPanelRef.querySelectorAll('.searchTypesOptions').forEach(option => option.addEventListener('click', (e) => handleSearchTypeChange(e)))
  }

  const handleSearchTypeChange = (e) => {
    const searchType = e.target.getAttribute('type');
    this.curSearchType = searchType;
    postAllPanelRef.querySelector('.activeSearchOption').classList.remove('activeSearchOption');
    e.target.classList.add('activeSearchOption');
    removeMoreBtListners(this.moreBt);
    this.moreBt.innerText = "Search " + searchType;
    if (postAllPanelRef.querySelector('.msear').value) {
      postAllPanelRef.querySelector('.moptio').innerText = '';
      getgif(postAllPanelRef.querySelector('.msear').value);
    }
  }

  function onSearchKeyup(value) {
    this.curgifp = 0;
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => { getgif(value); }, this.doneTypingInterval);
  }

  function onSearchKeyDown() {
    clearTimeout(this.typingTimer);
  }
  onSearchKeyup.bind(this);
  onSearchKeyDown.bind(this);
  addAllEvenListner.bind(this);

  function setcurgifpage(val) {
    curgifpage = val;
  }

  function getgif(searchKey) {
    if (searchKey && this.moreBt) {
      removeMoreBtListners(this.moreBt);
      chrome.runtime.sendMessage({ type: "toggleLoader", position: 'bottom', show: true });
      this.moreBt.style.display = "none";
      this.que = "q=" + encodeURIComponent(searchKey) + "&pos=" + this.curgifp + '&type=' + postAllPanelRef.querySelector('.activeSearchOption').getAttribute('type');
      reqgif(this.que);
    }
  }
  getgif.bind(this);

  async function reqgif(query) {
    this.url = `search?${query}`;
    chrome.runtime.sendMessage({ type: "httpApiCall", url: this.url, onSuccessEvent: "searchQueryResponse" });
  }

  function onchan(data) {
    var par = postAllPanelRef.querySelector('.moptio');
    chrome.runtime.sendMessage({ type: "toggleLoader", position: 'bottom', show: false });
    res = data;
    if (res.results.length === 0) {
      postAllPanelRef.querySelector('.loopt').style.display = "block";
      postAllPanelRef.querySelector('.loopt').classList.remove('moreSearchBt');
      postAllPanelRef.querySelector('.loopt').innerText = "Nothing found!";
    }

    if (res.next != '0') {
      postAllPanelRef.querySelector('.loopt').style.display = "block";
      postAllPanelRef.querySelector('.loopt').classList.add('moreSearchBt')
      postAllPanelRef.querySelector('.loopt').innerText = "More";
      postAllPanelRef.querySelector('.loopt').addEventListener('click', moregif);
    } else {
      postAllPanelRef.querySelector('.loopt').classList.add('moreSearchBt');
    }

    if (this.curgifp === 0) {
      par.innerText = "";
    }
    this.curgifp = res.next;
    res = res['results'];
    if(data.type !== this.curSearchType) return;
    if (data.type === 'gif') {
      handleGifResponse(res, par);
    }
    else if (data.type === 'file' || data.type === 'video' || data.type === 'image') {
      handleFileResponse(res, par);
    }else if (data.type === 'text'){
      handleFileResponse(res, par);
    }
  }

  onchan.bind(this);

  function moregif() {
    getgif(postAllPanelRef.querySelector('.msear').value);
  }

  const handleFileResponse = (data, par) => {
    data.forEach(one => {
      addFiletopanel(par, one);
    })
  }

  const handleGifResponse = (data, par) => {
    const gifContainer = createElement('div', null, ['gifSearchContainer'])
    data.forEach(one => {
      addgiftopanel(gifContainer, one.id, "GIF", one.data.value, one.meta['dims'])
    })
    appendChilds(par, [gifContainer])
  }

  function addFiletopanel(parent, file) {
    var copyBt = getCopyTokenBt(file.id)
    let postAllGifOverview = postAllPanelRef.querySelector('.postAllGifOverview');
    const fileTypeIconClass = file.type === 'video' ? 'videoIcon' : file.type === 'audio' ? 'audioIcon' : file.type === 'text' ? 'textIcon' : file.type === 'image' ? 'imageIcon' : 'fileIconPostAll';
    var updiv = createElement('div', '', ['flexPostAll', 'searchFileItem']);

    var fileIcon = createElement('div', '', [fileTypeIconClass, 'searchFileIcon']);
    var avatar = createElement('div', '', ['avatar-sm', 'fileTypeAvatar']);

    var fileDetailsContainer = createElement('div', '', ['searchFileDetails']);
    var fileName = createElement('div', file.title, ['fileSearchTitle']);
    var fileDetailsBottom = createElement('div', '', ['flexPostAll']);
    var fileCreatedAt = createElement('div', file.createdAt, ['fileCreatedAtPostAll'])
    var seeders = createElement('div', "↑ " + file?.meta?.seeders, ['fileSearchSeeders'])

    var rightDetails = createElement('div', '', ['flexPostAll', 'fileDetailsRight']);
    const fileSize = file.type === 'text' ? file.data.size + " letters"  : formatBytes(file.data.size) 
    var size = createElement('div', fileSize, ['searchFileSize']);
    const itemCopyBt = createElement('div', '', ['itemCopyBtContainer']);
    appendChilds(itemCopyBt, [copyBt])
    updiv.addEventListener('mouseover', function () {
      toggleOverviewPanel(true)
      const playVideo = () => addIframeVideo(streamFrame, file);
      const downloaBtHandler = () => downloadToken(file);
      // i.style.opacity = '1';
      //'torrent-' + file.id
      const streamFrame = createElement('div', '', ['streamTorrentFrame', 'centerPostAll'])

      const tokenTitle = createElement('div', file.title, ['videoTitle']);
      const options = createElement('div', '', ['fileSearchOptionsContainer']);
      const playIcon = createElement('div', '', ['playIconBt', 'searchDownloadBtImage']);
      const playText = createElement('div', 'play');
      var playBt = createElement('div', '', ['searchPlayBt', 'searchResultBt']);
      playBt.addEventListener('click', playVideo)
      appendChilds(playBt, [playIcon, playText])

      var downloadBt = createElement('div', '', ['searchDownloadBt', 'searchResultBt']);
      downloadBt.addEventListener('click', downloaBtHandler)

      const downloadText = createElement('div', 'Download');
      var downloadIcon = createElement('div', '', ['downloadIcon', 'searchDownloadBtImage'])
      var fileDesc = createElement('div', file.desc, ['fileDescOverview'])
      
      var fileOptions = createElement('div', '', ['flexPostAll']);
      var copyBt = getCopyTokenBt(file.id)

      appendChilds(downloadBt, [downloadIcon, downloadText])
      postAllGifOverview.style.width = "fit-content";
      postAllGifOverview.style.height = "fit-content";
      postAllGifOverview.style.left = "-440px";
      if (file.type === 'video') {
        appendChilds(fileOptions, [playBt, downloadBt])
        appendChilds(options, [fileOptions, copyBt])
        streamFrame.addEventListener( 'click', playVideo);
        appendChilds(streamFrame, [playIcon.cloneNode()])
      } 
      else {
        if(file.type !== 'text')
          appendChilds(fileOptions, [downloadBt])
        appendChilds(options, [fileOptions, copyBt])
        if(file.type === 'image'){
          streamFrame.style.backgroundImage = 'url(' + file.data.value + ")";
        }else if(file.type === 'text'){
          const hiddenTextContainer = createElement('div','', ['hiddenTextSearch'])
          hiddenTextContainer.innerText = file.data.value;
          appendChilds(streamFrame, [hiddenTextContainer])
        }
        else{
          var avatarDownloadIcon = createElement('div', '', ['downloadIcon', 'searchDownloadBtImage', 'avatar'])
          appendChilds(streamFrame, [avatarDownloadIcon])
        }
        if(file.type !== 'text')
          streamFrame.addEventListener( 'click', downloaBtHandler)
      }
      appendChilds(postAllGifOverview, [streamFrame, tokenTitle, options, fileDesc])
    })
    updiv.addEventListener('mouseout', mouseOutItem)

    appendChilds(avatar, [fileIcon])
    appendChilds(rightDetails, [size]);
    appendChilds(fileDetailsBottom, file?.meta?.seeders ? [fileCreatedAt, seeders] : [fileCreatedAt])
    appendChilds(fileDetailsContainer, [fileName, fileDetailsBottom])
    appendChilds(updiv, [avatar, fileDetailsContainer, rightDetails, itemCopyBt]);
    appendChilds(parent, [updiv])
  }

  const mouseOutItem = () => {
    if(this.hideOverviewPanelTimeout){ 
      this.hideOverviewPanelTimeout = window.clearTimeout(this.hideOverviewPanelTimeout);
    }
    this.hideOverviewPanelTimeout = window.setTimeout( 
        () => {
            toggleOverviewPanel(false)
        }, 1000
     )
  }

  function toggleOverviewPanel(show){
    const overviewPanel = postAllPanelRef.querySelector('.postAllGifOverview');
    overviewPanel.onmouseover = null;
    overviewPanel.onmouseout = null;
    overviewPanel.innerText = '';
    if(show){
        if(this.hideOverviewPanelTimeout) this.hideOverviewPanelTimeout = window.clearTimeout(this.hideOverviewPanelTimeout)
        overviewPanel.style.display = 'block';
        overviewPanel.addEventListener('mouseover', () => window.clearTimeout(this.hideOverviewPanelTimeout) )
        overviewPanel.addEventListener('mouseout', mouseOutItem );
    }
    else{
      overviewPanel.style.backgroundImage = ``;
      overviewPanel.style.display = 'none';
    }
  } 

  function getCopyTokenBt(tokenId){
    var copyBt = createElement('div','', ['flexPostAll', 'copyTokenBt']);
    var tokenText = createElement('div', tokenId, ['copyTokenText']);
    var copyIcon = createElement('div', '', ['copyIcon']);
    appendChilds(copyBt, [tokenText, copyIcon]);
    const prevColor = window.getComputedStyle( copyBt ,null).getPropertyValue('background-color');  
    const onCopy = () => { 
            window.setTimeout( () => { copyBt.style.backgroundColor = prevColor;  copyBt.addEventListener('click',onCopy)}, 1300 );
            handleCopyClick(copyBt, tokenId)
            copyBt.removeEventListener('click',onCopy )
    }
    copyBt.addEventListener( 'click', onCopy )
    return copyBt
  } 

  const handleCopyClick = (bt, id) => {
    bt.style.backgroundColor = "var(--successPostAll)";
    bt.style.color = 'white';
    copyTextHanler(id)
  }

  function addgiftopanel(par, id, src, url, dim) {
    var updiv = createElement('div', '', ['gifSearchItem'])
    let postAllGifOverview = postAllPanelRef.querySelector('.postAllGifOverview');
    updiv.style.backgroundImage = `url(${url})`;
    var i = document.createElement('i');
    i.classList.add('mcopy');
    i.innerText = "copy";
    i.addEventListener('click', () => {handleCopyClick(i, id)} );

    updiv.addEventListener('mouseover', function () {
      toggleOverviewPanel(true)
      i.style.opacity = "0.8";
      postAllGifOverview.style.backgroundImage = `url(${url})`;
      postAllGifOverview.style.width = (dim[0] * 2) + "px";
      postAllGifOverview.style.height = (dim[1] * 1.8) + "px";
      let leftPositionValue = dim[0] * 2 < 400 ? dim[0] * 2 : 400;
      postAllGifOverview.style.left = ((leftPositionValue + 30) * -1) + "px";
    })
    updiv.addEventListener('mouseout', () => { 
      mouseOutItem();
      i.style.opacity = "0";
      i.style.backgroundColor = "var(--primaryPostAll)"; 
    })

    updiv.appendChild(i);
    par.appendChild(updiv);
  }
  function copyTextHanler(e) {
    var addtext = e;
    navigator.permissions.query({ name: "clipboard-write" }).then(res => {
      if (res.state = "granted") {
        navigator.clipboard.writeText(addtext);
      } else { alert("Permission for copy denied"); }
    })
  }

  function removeMoreBtListners(ele) {
    var old_element = ele;
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
    this.moreBt = new_element;
  }

  function createElement(type, innerHtml, classes, id, attr) {
    const ele = document.createElement(type);
    if (classes) ele.classList.add(...classes)
    if (innerHtml) {
      if (type === 'input' || type === 'textarea')
        ele.value = innerHtml;
      else
        ele.innerText = innerHtml;
    }
    if (id) ele.id = id;
    if (attr) {
      Object.keys(attr).forEach(k => { ele[k] = attr[k] })
    }
    return ele;
  }

  const addIframeVideo = (parent, file) => {
    let src = '';
    if(file.tokenType === 'pirate-bay'){
      src = this.apiUrl + 'streamTorrent?magnet=' + file.data.value;
    }else{
      src = file.data.value;
    }
    const vIframe = createElement('iframe', '', ['videoIframeSm'], '', { src: src, allowFullscreen: true })
    parent.innerText = '';
    appendChilds(parent, [vIframe])
  }

  const downloadToken = (file) => {
    let data = {};
    if(file.tokenType === 'pirate-bay') data = { url : 's/d/s?magnet=' + file.data.value, api: true };
    else data = { url : file.data.value };
    chrome.runtime.sendMessage({ type: 'openNewTab', ...data })
  }

  function appendChilds(node, childs) {
    childs.forEach(c => node.appendChild(c))
  }

  const getFileType = (url) => {
    const splitText = url.split('.');
    return splitText.length > 2 ? splitText.pop() : 'unknown';
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}());
