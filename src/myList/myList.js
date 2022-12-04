(function(){
    let hideOverviewPanelTimeout = null;
    let postAllPanelRef = null;
    this.userTokens = [];
    chrome.runtime.onMessage.addListener(
          function (request, sender, sendResponse) {
              if(request.page === 'myList' || !request.page ){
                switch (request.message){
                    case "addEvenListner":
                        addAllEvenListner();
                        return;
                    case 'getUserToken':
                        chrome.runtime.sendMessage({ type: "toggleLoader", position: 'page', show: false });
                         if(request?.data?.message == 'ok')
                            addUserItems(request?.data?.data)
                            return;
                    case "setPostAllPanelReference":
                        postAllPanelRef = document.querySelector(".postAllPanelReff").shadowRoot;
                        return;
                    case "successEditToken":
                        chrome.runtime.sendMessage({ type: "toggleLoader", position: 'page', show: false });
                        addUserItems(this.userTokens.map( t => t._id === request?.data?.data._id ? request?.data?.data : t ))
                        return
                }
              }
          }
    );

    function addAllEvenListner(){
        const url = "user/token";
        chrome.runtime.sendMessage({ type: "httpApiCall", method: 'POST' ,url : url , onSuccessEvent : "getUserToken" });
        chrome.runtime.sendMessage({ type: "toggleLoader", position: 'page', show: true });
        postAllPanelRef.querySelectorAll('.oneMyListItemPostAll').forEach(
            item => {
                item.addEventListener('mouseover',mouseOverItem); 
                item.addEventListener('mouseout', () => {mouseOutItem()}); 
            }
        )
    }

    function addUserItems(d){
        this.userTokens = d;
        this.data = d;
        this.itemsParent = postAllPanelRef.querySelector('#myListItemsPostAll');
        this.itemsParent.innerText = '';
        const handleItemActions = (newItemElement, itemData) => {
            newItemElement.addEventListener('mouseover', () => mouseOverItem(itemData)); 
            newItemElement.addEventListener('mouseout', () => { mouseOutItem()}); 
            appendChilds(this.itemsParent, [newItemElement]);
        }
        if(this.data.length === 0 ){
            this.emptyImgContainer = createElement('div', '', ['centerPostAll'])
            this.emptyImg = createElement('img', '', ['emptyIcon'])
            this.btnContainer = createElement('div', '', ['centerPostAll'])
            this.createBtn = createElement('div', 'Create', ['createnewTokenBt']);
            this.createBtn.addEventListener('click', gotoCreatePage)
            appendChilds(this.btnContainer, [this.createBtn])
            appendChilds(this.emptyImgContainer, [this.emptyImg]);
            appendChilds(this.itemsParent, [this.emptyImgContainer,this.btnContainer])
        }else{
            this.data.forEach( item => {
                this.newItem = createSingleUserItem(item);
                handleItemActions(this.newItem, item);
            });
        }
    }

    function gotoCreatePage(){
        chrome.runtime.sendMessage({ type: "changeScreen", newPage: 'createToken' ,newSettings: { lastActiveTab: 'createToken' } });
    }

    function createSingleUserItem(item){
        this.itemContainer = createElement('div','', ['flexPostAll','oneMyListItemPostAll'])
        this.fileImageContainer = createElement('div', '', ['avatar-sm', 'fileTypeAvatar']);
        this.fileTypeIconClass = item.type === 'video' ? 'videoIcon' : item.type === 'audio' ? 'audioIcon' : item.type === 'text' ? 'textIcon' : item.type === 'image' ? 'imageIcon' : 'fileIconPostAll';
        this.fileimage = createElement('image', '', [fileTypeIconClass,'searchFileIcon']);
        appendChilds(this.fileImageContainer, [this.fileimage]);
        
        this.detailsContainer = createElement('div', '', ['flexGrow1PostAll']);
        this.itemTitle = createElement('div', item.title || "Empty", ['textWrapPostAll','listItemTextPostAll','fileListItemTitle'])
        this.itemMetaContiner = createElement('div', '', ['flexPostAll'])
        this.itemTypeText = createElement('div', item.createdAt, ['createdDate'])
        this.copyBt = getCopyTokenBt(item.id)
        this.itemCopyBt = createElement('div', '', ['itemCopyBtContainer']);
        this.fileSize = item.type === 'text' ? item.data.size + " letters"  : formatBytes(item.data.size) 
        this.size = createElement('div', this.fileSize, ['searchFileSize']);
       
        this.rightDetails = createElement('div', '', ['flexPostAll', 'fileDetailsRight']);
        appendChilds(this.itemCopyBt, [this.copyBt])
        appendChilds(this.itemMetaContiner, [this.itemTypeText])
        appendChilds(this.rightDetails, [this.size])
        appendChilds(this.detailsContainer, [this.itemTitle,this.itemMetaContiner]);
        appendChilds(this.itemContainer, [this.fileImageContainer, this.detailsContainer, this.rightDetails, this.itemCopyBt]);
        return this.itemContainer;
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
      copyTextHanler(id);
    }
    
    function copyTextHanler(e) {
      var addtext = e;
      navigator.permissions.query({ name: "clipboard-write" }).then(res => {
        if (res.state = "granted") {
          navigator.clipboard.writeText(addtext);
        } else { alert("Permission for copy denied"); }
      })
    }
    
    function mouseOverItem(item){
        if(hideOverviewPanelTimeout) window.clearTimeout(hideOverviewPanelTimeout)
        toggleOverviewPanel(true)
        addItemDetailsToPanel(item)
    }
    function mouseOutItem(){
        if(hideOverviewPanelTimeout) window.clearTimeout(hideOverviewPanelTimeout);

        hideOverviewPanelTimeout = window.setTimeout( 
            () => {
                toggleOverviewPanel(false)
            }, 1000
         )
    }

    function toggleOverviewPanel(show){
        const overviewPanel = postAllPanelRef.querySelector('.postAllGifOverview');
        overviewPanel.onmouseover = null;
        overviewPanel.onmouseout = null;
        
        if(show){
            overviewPanel.style.display = 'block';
            overviewPanel.style.width = "400px";
            overviewPanel.style.height = "auto";
            overviewPanel.style.left = "-415px";
            overviewPanel.classList.add('darkBg')
            overviewPanel.addEventListener('mouseover', () => window.clearTimeout(hideOverviewPanelTimeout) )
            overviewPanel.addEventListener('mouseout', mouseOutItem );
        }
        else{
            overviewPanel.classList.remove('darkBg')
            overviewPanel.style.display = 'none';
        }
    }

    async function handleEditFormSubmit (e){
        e.preventDefault();
        const formData = new FormData(postAllPanelRef.querySelector('form[name=editTokenPostaAll]'));
        const type = formData.get("typePostAll");
        
        if(type === 'image' || type === 'file' || type === 'video'){
            if(formData.get('file')?.size){
                let fileData = await fileReader(formData.get('file'));
                fileData = JSON.stringify(fileData)
                formData.append('file', fileData)
            }else{
                formData.delete('file');
            }
        }
        toggleOverviewPanel(false)
        chrome.runtime.sendMessage({ type: "toggleLoader", position: 'page', show: true });
        chrome.runtime.sendMessage({ type: "uploadFile", url: 'token', method: 'PATCH', body: Object.fromEntries(formData), onSuccessEvent: 'successEditToken' });
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
    function addItemDetailsToPanel(item){
        const fileTypes = ['image', 'file', 'text', 'video'];

        const overviewPanel = postAllPanelRef.querySelector('.postAllGifOverview');
        const container = createElement('div',"", ["overviewContainerPostAll"])
        const editForm = createElement('form', "", [], '', { onsubmit: handleEditFormSubmit, name: 'editTokenPostaAll' })
        const itemValueContainer = createElement('div', '', ['tokenOverviewValue']);
        let itemValue = null
        if(item.type === 'image' || item.type === 'video'){
            const LinkConatainter = createElement('div', '', ['tokenLinkContainer']);
            const link = createElement('a', '', ['tokenLink', 'linkIcon'], '' , { href: item.data.value, target: '_blank' } );
            appendChilds(LinkConatainter, [link]);
            itemValue = createElement('div', '', ['tokenImageValueContainer']);
            let imageValue = ''
            if(item.type === 'image'){
                imageValue = createElement('img', '', ['tokenImageValue'], '', { src: item.data.value });
           }else if(item.type === 'video'){
                imageValue = createElement('iframe', '', ['tokenImageValue'],'', { src: item.data.value, allowFullscreen: true })
            }
            appendChilds(itemValue,[LinkConatainter, imageValue])
        }
        else if(item.type === "text"){
            itemValue = createElement('textarea', '', ['tokenPostallTextValue', 'inputPostAll'], '', { value: item.data.value, rows: 10, disabled: true });
        }else if(item.type === 'file'){
            const LinkConatainter = createElement('div', '', ['tokenLinkContainer']);
            const link = createElement('a', '', ['tokenLink', 'linkIcon'], '' , { href: item.data.value, target: '_blank' } );
            appendChilds(LinkConatainter, [link]);
            const fileType = getFileType(item.data.value);
            const filtTypeAvatar = createElement('div', fileType , ['avatar']);
            const sizeText = createElement('div', "File Size : " + formatBytes(item.data.size) , ['TokenValueSizeText']);
            const typeText = createElement('div', "File Type : " + fileType , ['TokenValueTypeText']);
            itemValue = createElement('div','', ['TokenFileValue']);
            appendChilds(itemValue, [LinkConatainter,filtTypeAvatar,sizeText, typeText])
        }

        if(itemValue)
            appendChilds(itemValueContainer,[itemValue]);

        const inputContainer = createElement('div','',['inputTextContainerPostAll'])
        const titleHead = createElement('input', item.title, ["inputPostAll", "itemOverviewInput"], '', {'placeholder' :'Title', name: 'title'});
        const descContainer = createElement('div','',['inputTextContainerPostAll'], )
        const description = createElement('textarea', item.desc, ["inputPostAll", "itemOverviewInput"],"",{"rows":"3", "placeholder": "Description", name: 'description'});
        inputContainer.appendChild(titleHead) 
        descContainer.appendChild(description);
        const viewFileContainer = createElement("div")
        
        const fileTypeText = createElement('div',"Document Type ", ["helpTextPostAll"])
        const fileTypeContainers = createElement('div','', ['flexPostAll']);
        fileTypes.forEach( f => {
            const isItemType =  item.type === f;
            const radioContainer = createElement('div', "", ['centerPostAll', 'marginNormalPostAll']);
            const radioText = createElement('div', f.toUpperCase(), ['radioTextPostAll']);
            const radio = createElement('input', f, [], "", { type: 'radio', name: "typePostAll", value: f, checked: isItemType})
            radio.addEventListener("click", () => handleFileTypeChange(viewFileContainer, f))
            if(isItemType){
                handleFileTypeChange(viewFileContainer, f)
            }
            appendChilds(radioContainer, [radio, radioText])
            appendChilds(fileTypeContainers, [radioContainer])
        })

        const editBt = createEditBt();
        const hiidenItemId = createElement('input', '', [], '', { type: 'hidden', name: "id", value: item._id })
        appendChilds(editForm, [itemValueContainer, inputContainer,descContainer, fileTypeText, fileTypeContainers, viewFileContainer, hiidenItemId, editBt ])
        appendChilds( container, [editForm] )
        overviewPanel.innerText = '';
        appendChilds(overviewPanel,[container])
    }

    const createEditBt = () => {
        const center = createElement('div', '', ['centerPostAll']);
        const bt = createElement('input', 'Update', ['loginBtPostAll','createButton'], '', { type: 'submit' })
        appendChilds(center, [bt]);
        return center;
    //     <div class="centerPostAll" style="margin-top: 55px;">
    //     <input type="submit" class="loginBtPostAll createButton" value="Create" />
    // </div>
    }

    const handleFileTypeChange = (parent, type) => {
        let children;
        if(type === 'image'){
            children = getFileInput("Add Image", 'image')
        }
        else if(type === 'file'){
            children = getFileInput("Add File", 'file')
        }
        else if(type === 'video'){
            children = getFileInput("Add Video", 'video')
        }else if(type === 'text'){
            children = getTextInput('Update Text')
        }

        parent.innerText = '';
        appendChilds(parent, [children])
    }
    

    const getTextInput = (title) => {
        const textAreaContainer = createElement('div',"", ["overviewContainerPostAll"]);
        textAreaContainer.style.marginTop = '15px';
        const textArea = createElement('textarea','',['inputPostAll'],'', { rows: 3,name: 'postallText', placeholder: title })
        textArea.style.color = 'black';
        textAreaContainer.appendChild(textArea);
        return textAreaContainer;
    }

    const getFileInput = (title,type) => {
        const imageContainer = createElement('div',"", ["overviewContainerPostAll"])
        const acceptFileTypes = type === 'image' ? 'image/*' : type === 'video' ? "video/*" : '*';
        const imageInput = createElement('input','',["displayNonePostAll"],'', { type: 'file', name: 'file', accept: acceptFileTypes })
        const fileBt = getFileBt(() => { imageInput.click() }, title)
        const maxSizeContainer = createElement('div', '', ['flexPostAll', 'helpTextPostAll'])
        const exclamationIcon = createElement('div', '', ['iconExclamation', 'imageMarginRight', 'searchFileIcon'])
        const maxFileSize = type === 'video' ? '100mb' : '20mb';
        const maxSizeText = createElement('div', type+' size upto '+maxFileSize)
        imageInput.addEventListener( 'change', (e) => { if(e.target.files.length > 0) fileBt.innerText = e.target.files[0].name; } )
        appendChilds(maxSizeContainer, [exclamationIcon,maxSizeText]);
        appendChilds(imageContainer, [fileBt, imageInput,maxSizeContainer])
        return imageContainer;
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

    function appendChilds(node, childs){
        childs.forEach( c => node.appendChild(c) )
    }

    const getFileType = (url) => {
       const splitText = url.split('.');
       return splitText.length > 2 ? splitText.pop() : 'unknown';
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

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}())