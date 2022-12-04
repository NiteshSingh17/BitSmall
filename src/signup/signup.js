(function () {

    let postAllPanelRef = null;
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (!request.page || request.page === 'signup')
                switch (request.message) {
                    case "setPostAllPanelReference":
                        postAllPanelRef = document.querySelector(".postAllPanelReff").shadowRoot;
                        return;
                    case "addEvenListner":
                        addAllEventListner();
                        return;
                    case "loginGoggle":
                        googleLogin(request.url)
                }
        }
    );

    function addAllEventListner() {
        postAllPanelRef.querySelector('.googleLoginContainer').addEventListener('click', handleGoggleLoginBt)
    }
    
    function handleGoggleLoginBt(){
        chrome.runtime.sendMessage({ type: "getBaseUrl", action: 'loginGoggle', page: 'signup' });
    }

    function googleLogin(url){
        window.open(url + "auth/google");
    }
}()
)
