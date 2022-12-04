(function(){
    
    let postAllPanelRef = null;
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if(!request.page || request.page === 'nav' )
            switch (request.message){
                case "addEvenListner":
                    addAllEventListner();
                    return;
                case "setPostAllPanelReference":
                    postAllPanelRef = document.querySelector(".postAllPanelReff").shadowRoot;
                    return;
                case "getUserInfo":
                   return handleUserInfo(request.userInfo);
            }
        }
    );
  
    function handleUserInfo(userInfo){
        if(userInfo){
            postAllPanelRef.querySelector('#signOutOption').classList.remove('hideItem');
            postAllPanelRef.querySelector('#userNameNavPostAll>#name').innerText = userInfo.name;
        }else{
            postAllPanelRef.querySelector('#signOutOption').classList.add('hideItem');
            postAllPanelRef.querySelector('#userNameNavPostAll>#name').innerText = "Welcome";
        }
    }

    function addAllEventListner(){
        postAllPanelRef.querySelector('#navBarMenuButtonPostAll').addEventListener('click',toogleNav)
        postAllPanelRef.querySelector('.navCrossPostAll').addEventListener('click',toogleNav)
        postAllPanelRef.querySelectorAll('.navBarItemPostAll').forEach(element => {
            element.addEventListener('click', navToNewScreen)
        });
        chrome.runtime.sendMessage({ type: 'getUserInfo', page: 'nav' })
    }

    function toogleNav(){
        var nav = postAllPanelRef.querySelector('#navOverlayPostAll');
        nav.classList.toggle('showNavPostAll');
        if(postAllPanelRef.querySelector("#postAllInnerContent").style.overflowY !== 'hidden'){
            postAllPanelRef.querySelector("#postAllInnerContent").style.overflowY = 'hidden';
        }else{
            postAllPanelRef.querySelector("#postAllInnerContent").style.overflowY = 'scroll';
        }
    }

    function navToNewScreen(e){
        const newPage = e.target.dataset?.route;
        chrome.runtime.sendMessage({ type: "changeScreen", newPage: newPage ,newSettings: { lastActiveTab: newPage } });
        toogleNav();
    }

}());


