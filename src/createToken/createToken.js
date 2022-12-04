(function(){
    let postAllPanelRef = null;
    chrome.runtime.onMessage.addListener(handleIncomingChromeRequest.bind(this));
    function handleIncomingChromeRequest(request, sender, sendResponse) {
      if(!request.page || request.page === 'createToken')
      switch (request.message){
          case "addEvenListner":
              addAllEvenListner();
              return;
          case "setPostAllPanelReference":
              postAllPanelRef = document.querySelector(".postAllPanelReff").shadowRoot;
              return;
          case "successCreateToken":
            chrome.runtime.sendMessage({ type: "toggleLoader", position: 'page', show: false });
            chrome.runtime.sendMessage({ type: "setSettings", newSettings: { lastActiveTab: 'myList' } });
            return
      }
    }

    function addAllEvenListner(){
        postAllPanelRef.querySelector('form[name=createTokenPostaAll]').addEventListener('submit', createTokenHandler);
        postAllPanelRef.querySelectorAll('input[name=typePostAll]').forEach(
            radio => radio.addEventListener('click', chageFileUploadType)
        )
    }

    async function createTokenHandler(e){
        e.preventDefault();
        chrome.runtime.sendMessage({ type: "toggleLoader", position: 'page', show: true });
        const formData = new FormData(postAllPanelRef.querySelector('form[name=createTokenPostaAll]'));
        const type = formData.get("typePostAll");
        if(type === 'image' || type === 'file' || type === 'video'){
            let fileData = await fileReader(formData.get('file'));
            fileData = JSON.stringify(fileData)
            formData.append('file', fileData)
        }
        chrome.runtime.sendMessage({ type: "uploadFile", url: 'token' ,body: Object.fromEntries(formData), onSuccessEvent: 'successCreateToken' });
    }

    const fileReader = (src) => {
        const cls = Object.prototype.toString.call(src).slice(8, -1);      
        return new Promise(resolve => {
            const { name, type, lastModified } = src;
            const reader = new FileReader();
            reader.onload = () => resolve({
              cls, name, type, lastModified,
              value: reader.result.slice(reader.result.indexOf(',') + 1),
            });
            reader.readAsDataURL(src);
          });
    }

    function chageFileUploadType(e){
        const type = e.target.value;
        const parent = postAllPanelRef.querySelector('#uploadFileBtPostAllContainer');
        let children;
        if(type === 'image'){
            children = getFileInput("Add Image",'image')
        }
        else if(type === 'file'){
            children = getFileInput("Add File", 'file')
        }
        else if(type === 'video'){
            children = getFileInput("Add Video", 'video')
        }
        else if(type === 'text'){
            children = getTextInput('Hidden text')
        }
        parent.innerText = '';
        parent.appendChild(children);
    }

    const getTextInput = (tile) => {
        const textAreaContainer = createElement('div',"", ["overviewContainerPostAll"]);
        textAreaContainer.style.marginTop = '15px'
        const textArea = createElement('textarea','',['inputPostAll'],'', { rows: 5,name: 'postallText', placeholder: tile })
        textAreaContainer.appendChild(textArea);
        return textAreaContainer;
    }

    const getFileInput = (title, type) => {
        const imageContainer = createElement('div',"", ["overviewContainerPostAll"]);
        imageContainer.style.marginTop = '15px';
        const acceptFileTypes = type === 'image' ? 'image/*' : type === 'video' ? "video/*" : '*';
        const imageInput = createElement('input','',["hiddenRequireFile"],'', { type: 'file', name:'file',required: true, accept: acceptFileTypes })
        const fileBt = getFileBt(() => { imageInput.click() }, title);
        const maxSizeContainer = createElement('div', '', ['flexPostAll', 'helpTextPostAll'])
        const exclamationIcon = createElement('div', '', ['iconExclamation', 'imageMarginRight', 'searchFileIcon'])
        const maxFileSize = type === 'video' ? '100mb' : '20mb';
        const maxSizeText = createElement('div', type+' size upto '+maxFileSize)
        imageInput.addEventListener( 'change', (e) => { if(e.target.files.length > 0) fileBt.innerText = e.target.files[0].name; } )
        imageContainer.appendChild(fileBt);
        maxSizeContainer.appendChild(exclamationIcon);
        maxSizeContainer.appendChild(maxSizeText);
        imageContainer.appendChild(maxSizeContainer);
        imageContainer.appendChild(imageInput);
        return imageContainer;
    }

    function createElement(type, innerText, classes, id, attr){

        const ele = document.createElement(type);
        if(classes) ele.classList.add(...classes)
        if(innerText){
            if(type === 'input' || type === 'textarea' )
                ele.value = innerText;
            else
                ele.innerText = innerText;
        }
        if(id) ele.id = id;
        if(attr) {
            Object.keys(attr).forEach( k => { ele[k] = attr[k] } )
        }
        return ele;
    }

    const getFileBt = (handler, text) => {
        const textDiv = createElement('div', text);
        const iconUpload = createElement('div', '', ['iconUpload','searchFileIcon', 'imageMarginRight'])
        const bt = createElement('div', '', ['primaryBtPostAll','textWrapPostAll', 'centerPostAll'])
        bt.style.textAlign = 'center';
        bt.addEventListener('click', handler)
        bt.appendChild(iconUpload);
        bt.appendChild(textDiv);
        return bt;
    }

}())    