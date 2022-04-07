// ==UserScript==
// @name         embyLaunchPotplayer
// @name:en      embyLaunchPotplayer
// @name:zh      embyLaunchPotplayer
// @name:zh-CN   embyLaunchPotplayer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @description:zh-cn emby调用外部播放器
// @license      MIT
// @author       @bpking
// @include       *emby*
// @include       *:8*
// ==/UserScript==


let api_key = '';

const reg = /\/[a-z]{2,}\/\S*?id=/;


let timer = setInterval(function () {
  let potplayer = document.querySelectorAll("#embyIINA")[0];
  if (!potplayer) {
    let mainDetailButtons = document.querySelectorAll("#itemDetailPage > div.detailPageWrapperContainer > div.detailPagePrimaryContainer.padded-left.padded-right.detailRibbon > div.mainDetailButtons.focuscontainer-x")[0];
    if (mainDetailButtons) {
      let buttonhtml = `<div class ="flex">
                  <button id="embyIINA" type="button" class="button-flat btnPlay detailButton emby-button" title="IINA"> <div class="detailButton-content"> <i class="material-icons "></i>  <div class="detailButton-text">IINA</div> </div> </button>
                  </div>`
      mainDetailButtons.insertAdjacentHTML('afterend', buttonhtml)
      document.querySelector("#embyIINA").onclick = embyIINA;
      api_key = ApiClient.accessToken();
    }
  }
}, 1000)

async function getItemInfo() {
  let itemInfoUrl = window.location.href.replace(reg, "/Items/").split('&')[0] + "/Download?api_key=" + api_key;
  console.log("itemInfo: " + itemInfoUrl);
}

function getSeek() {
  let resumeButton = document.querySelector("div[is='emby-scroller']:not(.hide) div.resumeButtonText");
  let seek = null;
  if (resumeButton) {
    const re = /[\d+:]+\d+/;
    if (re.exec(resumeButton.innerText)) {
      seek = re.exec(resumeButton.innerText)[0];
    }
  }
  return seek;
}

function getSubUrl(mediaSource) {
  const selectSubtitles = document.querySelector("div[is='emby-scroller']:not(.hide) select.selectSubtitles");
  let subTitleUrl = '';
  if (selectSubtitles && selectSubtitles.value > 0) {
    if (mediaSource.MediaStreams[selectSubtitles.value].IsExternal) {
      let subtitleCodec = mediaSource.MediaStreams[selectSubtitles.value].Codec;
      const domain = window.location.href.replace(reg, "/emby/videos/").split('&')[0];
      subTitleUrl = `${domain}/${mediaSource.Id}/Subtitles/${selectSubtitles.value}/Stream.${subtitleCodec}?api_key=${api_key}`;
      console.log(subTitleUrl);
    }
  }
  return subTitleUrl;
}


async function getEmbyMediaUrl() {
  const mediaSourceId = document.querySelector("select.selectSource").value;
  //let selectAudio = document.querySelector("div[is='emby-scroller']:not(.hide) select.selectAudio");
  const itemInfo = await getItemInfo();
  //const mediaSource = itemInfo.MediaSources.find(m => m.Id == mediaSourceId);
  //let PlaySessionId = itemInfo.PlaySessionId;
  //let subUrl = await getSubUrl(mediaSource);
  let subUrl =0;
  //let streamUrl = ApiClient._serverAddress +'/emby'+ mediaSource.DirectStreamUrl;
  //const domain = window.location.href.replace(reg, "/Items/").split('&')[0];
  //let streamUrl = `${domain}/Download?api_key=${api_key}&Static=true&MediaSourceId=${mediaSourceId}&PlaySessionId=${PlaySessionId}`;
  let streamUrl = window.location.href.replace(reg, "/Items/").split('&')[0] + "/Download?api_key=" + api_key;
  //const intent = getIntent(mediaSource);
  const intent =0;
  //console.log(streamUrl, subUrl, intent);
  return Array(streamUrl, subUrl,intent);
}

function getIntent(mediaSource){
    const title = mediaSource.Path.split('/').pop();
    let position = 0;
    if (getSeek()) {
      const times = getSeek().split(':').map(Number);
      if(times.length == 3){
        position = (times[0]*3600 + times[1]*60 + times[2])*1000;
      }else if (times.length == 2) {
        position = (times[0]*60 + times[1])*1000;
      }
    }
    let externalSubs = mediaSource.MediaStreams.filter(m => m.IsExternal ==true);
    const subs = ''; //要求是android.net.uri[] ?
    let subs_name = '';
    let subs_filename = '';
    const subs_enable = '';
    if (externalSubs) {
        subs_name = externalSubs.map(s => s.DisplayTitle);
        subs_filename = externalSubs.map(s => s.Path.split('/').pop());
    }
    return {
       title : title,
       position : position,
       subs : subs,
       subs_name : subs_name,
       subs_filename : subs_filename,
       subs_enable : subs_enable
    };
}

async function embyIINA() {
  let mediaUrl = await getEmbyMediaUrl();
  let iinaUrl = `iina://weblink?url=${escape(mediaUrl[0])}&new_window=1`;
  console.log(`iinaUrl= ${iinaUrl}`);
  window.open(iinaUrl, "_blank");
}
function getOS() {
  const u = navigator.userAgent
  if (!!u.match(/compatible/i) || u.match(/Windows/i)) {
    return 'windows'
  } else if (!!u.match(/Macintosh/i) || u.match(/MacIntel/i)) {
    return 'macOS'
  } else if (!!u.match(/iphone/i) || u.match(/Ipad/i)) {
    return 'ios'
  } else if (u.match(/android/i)) {
    return 'android'
  } else if (u.match(/Ubuntu/i)) {
    return 'Ubuntu'
  } else {
    return 'other'
  }
}


