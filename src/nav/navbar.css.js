(function () {
  const route = chrome.runtime.getURL('');
  this.settings = '';
  this.postAllPanelRef;
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.message === 'setSettings') {
        this.settings = request.settings;
        addCustomCss();
      }
      else if(request.message === "setPostAllPanelReference"){
        this.postAllPanelRef = document.querySelector(".postAllPanelReff")?.shadowRoot;
        addCustomCss();
      }
    }
  )

  function addCustomCss(){
    if(!this.postAllPanelRef) return;
    const mContainerTopPosition = ( ((550 + 5) * parseFloat(this.settings.panelSize)) - 550 ) / 2;

    this.navBarCss = `
    :host{
      --primaryPostAll: var(--${this.settings.primaryColor});
      --primaryLight: ${ "#" + this.settings.primaryColorCode + '7a'};
      --fileIconPostAll: url("${route + 'images/files/file.svg'}");
      --iconPlayPostAll: url("${route + 'images/files/playIcon.png'}");
      --iconGoggle : url("${route + 'images/google_Icon.webp'}");
      --iconUpload : url("${route + 'images/files/uploadFile.png'}");
      --iconLink: url("${route + 'images/files/linkIcon.png'}");
      --iconCopy: url("${route + 'images/files/copyIcon.png'}");
      --iconExclamation: url("${route + 'images/files/exclamation.svg'}");
      --iconVideoPostAll: url("${route + 'images/files/videoIcon.png'}");
      --iconAudioPostAll: url("${route + 'images/files/audio.png'}");
      --iconImagePostAll: url("${route + 'images/files/image.png'}");
      --iconTextPostAll: url("${route + 'images/files/text.png'}");
      --iconError:url("${route + 'images/files/errorIcon.png'}");
      --closeIcon: url("${route + 'images/files/closeIcon.svg'}");
      --emptyImage: url("${route + 'images/files/empty.png'}");
      --downloadImagePostAll: url("${route + 'images/files/download.png'}");
      --panelScaleSizePostAll: ${this.settings.panelSize};
      --panelTopPositionPostAll : ${mContainerTopPosition + "px"};
      --orange: #ec740d;
      --grayPostAll: #ada8ad;
      --successPostAll: #48BB78;
      --bluePostAll: #4299E1;
      --purple: #5243aa;
      --teal: #00a3bf;
      --cornflowerBlue: #253858;
      --darkGreenPostAll: #21c7665d;
      --orangePostAll: #f67f39;
      --redPostAll: #ea5e5e;
      --grayDark: #040d21;
      --transation-timing-primary: cubic-bezier(0.88, 0.06, 0.02, 1.36) 0.2s;
      --transation-timing-secondary: cubic-bezier(0.26, -0.23, 1, 3.84);
    }
    @font-face {
      font-family: 'Oswald', sans-serif;
      font-style: normal;
      src: url(‘chrome-extension://__MSG_@@extension_id__/fonts/font1.ttf); 
     }
    `;

    //grayDark :  #1A202C
    // --fileIconPostAll :url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBmaWxsPScjZDgzYjNiJyB3aWR0aD0iNzAwcHQiIGhlaWdodD0iNzAwcHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDcwMCA3MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8cGF0aCBkPSJtMTA1IDB2NTYwaDQ1NXYtMzg1aC0xNzV2LTE3NXptMzE1IDB2MTQwaDE0MHoiLz4KPC9zdmc+Cg==');


    //  --iconGoggle: url('data:image/webp;base64,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')

    //url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBmaWxsPScjZDgzYjNiJyB3aWR0aD0iNzAwcHQiIGhlaWdodD0iNzAwcHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDcwMCA3MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8cGF0aCBkPSJtMTA1IDB2NTYwaDQ1NXYtMzg1aC0xNzV2LTE3NXptMzE1IDB2MTQwaDE0MHoiLz4KPC9zdmc+Cg==")
    if(document.body.querySelector("#postallCustomCss")){
      document.body.removeChild(document.body.querySelector("#postallCustomCss"))
    }
      
    let styleSheet = document.createElement('style');
    styleSheet.id = 'postallCustomCss';
    styleSheet.type = 'text/css';


    if (styleSheet.styleSheet) {
      // This is required for IE8 and below.
      styleSheet.styleSheet.cssText = this.navBarCss;
    } else {
      styleSheet.innerHTML = this.navBarCss;
    }

    this.postAllPanelRef.appendChild(styleSheet);
  }
}())