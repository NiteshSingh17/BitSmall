(
    function () {
        this.postallWebPathName = '/s/d/s';
        this.postallWebPathhost = 'apibitsmall.cyclic.app';
        this.webtorWebPathhost = 'webtor.io';
        this.webtorWebPathName = '/show';
        chrome.runtime.onMessage.addListener(handleIncomingChromeRequest);

        function handleIncomingChromeRequest(request, sender, sendResponse) {
            if (!request.page || request.page === 'downloadTorrent')
                switch (request.message) {
                    case "getTorrentDownloadUrl":
                        document.body.onload = handleGetDownloadLink;
                        return;
                    case "openTorrentDownloadUrl":
                        openDownloadurl({ ...request });
                }
        }
        handleIncomingChromeRequest.bind(this)

        function openDownloadurl({ msgType }) {
            if (window.location.pathname === this.postallWebPathName && window.location.host === this.postallWebPathhost) {
                const loaderText = document.querySelector('.loader');
                if(msgType === 'badGateway' ){
                    loaderText.innerText = 'Oops something went wrong!'
                }else if(msgType === 'downloadStart'){
                    loaderText.innerText = 'Thank you for choosing us!'
                }else if(msgType === 'fileNotFound'){
                    loaderText.innerText = 'File not found!';
                }
            }
        }

        function canGetLink() {
            if((window.location.pathname === this.webtorWebPathName && window.location.host === this.webtorWebPathhost))
             chrome.runtime.sendMessage({ type: "getTorrentDownloadUrl" });
        }
        canGetLink();

        function handleGetDownloadLink() {
            const targetBodyNode = document.body;
            if(window.location.host !== this.webtorWebPathhost ) return null;
            if (!targetBodyNode) return;
            let errTimeout = null;
            
            const config = { attributes: true, childList: true, subtree: true };
            const callback = (mutationList, observer) => {
                for (const mutation of mutationList) {
                    const targetNode = document.getElementById('app-load-wrapper');
                    
                    if(!targetNode) {
                        if(errTimeout) clearTimeout(errTimeout);
                        chrome.runtime.sendMessage({ type: 'openTorrentDownloadUrl', msgType: 'badGateway' }) 
                        return;
                    }
                    if (mutation.type === 'childList') {
                        const urlButton = targetNode.querySelectorAll('button');
                        if (urlButton.length) {
                            urlButton.forEach(bt => {
                                if (bt.innerText === 'Direct download') {
                                    bt.click();
                                    observer.disconnect();
                                    if(errTimeout) clearTimeout(errTimeout);
                                    chrome.runtime.sendMessage({ type: 'openTorrentDownloadUrl', msgType: 'downloadStart' })
                                }
                            })
                        }else{
                            if(errTimeout) window.clearTimeout(errTimeout);
                            errTimeout = window.setTimeout( () => {
                                chrome.runtime.sendMessage({ type: 'openTorrentDownloadUrl', msgType: 'fileNotFound' }) 
                            }, 12000)
                        }
                    }
                }
            };

            const observer = new MutationObserver(callback);
            observer.observe(targetBodyNode, config);
        }
    }()
)