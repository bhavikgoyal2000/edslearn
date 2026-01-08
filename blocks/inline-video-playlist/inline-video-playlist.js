import { SERVER_URL } from '../../scripts/constants.js';
import { importYTIframeAPI } from '../../scripts/util.js';
import collapsiblesDecorate from '../collapsibles/collapsibles.js';

// Retreieves CSRF token from Author instance session
async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

// Gets Youtube Playlist Info from AEM Servlet
async function getPlistInfo(playlistId) {
  // Detect if running on author
  const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);

  // Prepare headers
  const headers = {};

  let serverUrl = SERVER_URL;
  // If author, add CSRF token
  if (isAuthor) {
    const csrfToken = await getCsrfToken();
    headers['CSRF-Token'] = csrfToken;
    serverUrl = window.location.origin;
  }

  let plistInfo = {};
  await fetch(`${serverUrl}/content/apis/au/youtubePlaylist.json?id=${playlistId}`, {
    method: 'GET',
    headers,
  }).then((response) => {
    if (!response.ok) throw new Error('Failed to fetch news data');
    return response.json();
  })
    .then((json) => {
      plistInfo = json;
    });
  return plistInfo;
}

// Creates Youtube Player using Youtube iFrame API
function makeYTPlayer(tries, playlistId, playerId) {
  if (typeof YT !== 'undefined' || tries > 100) {
    // eslint-disable-next-line no-undef
    YT.ready(() => {
      // eslint-disable-next-line no-undef, no-new
      new YT.Player(playerId, {
        playerVars: {
          playsinline: 1,
          listType: 'playlist',
          list: playlistId,
        },
      });
    });
  } else {
    // If iFrame API is not ready recursive call after delay
    const newTries = tries + 1;
    setTimeout(() => { makeYTPlayer(newTries, playlistId, playerId); }, 100);
  }
}

// Gets Authoring data of inline video playlist component
function getData(block) {
  const innerDivs = [...block.children].slice(1);
  const playlistId = innerDivs[0].textContent.trim();
  const display = innerDivs[1].textContent.trim() || 'partial';
  const title = innerDivs[2].textContent.trim();
  const description = innerDivs[3].textContent.trim();
  const ctas = [];
  for (let i = 4; i < innerDivs.length; i += 1) {
    const buttonProps = innerDivs[i].querySelectorAll('p');
    if (buttonProps.length === 2) {
      const ctaText = buttonProps[0].textContent.trim();
      const ctaUrl = buttonProps[1].textContent.trim();
      ctas.push({
        ctaText,
        ctaUrl,
      });
    }
  }
  let data = {};
  if (playlistId && display && title && description) {
    data = {
      playlistId,
      display,
      title,
      description,
      ctas,
    };
  }
  return data;
}

function generateVideosListDOM(items, playlistId) {
  let videosDOM = '';
  items.forEach((video) => {
    videosDOM += `
    <li class="inline-video-playlist-videos-list-item">
        <a href="https://www.youtube.com/watch?v=${video.videoId}&list=${playlistId}">
        <img src="${video.thumbnail}" class="pull-left is-decorative" alt="" />
        <div>
            <p class="inline-video-playlist-videos-list-item-topic">${video.channelTitle}</p>
            <p class="inline-video-playlist-videos-list-item-lede">${video.title}</p>
        </div>
        </a>
    </li>`;
  });
  return videosDOM;
}

export default async function decorate(block) {
  // Import Youtube iFrame API
  importYTIframeAPI();
  const data = getData(block);

  // If component is not authored render placeholder
  if (!data.playlistId) {
    block.innerHTML = '<p>Inline Video Playlist Placeholder</p>';
    return;
  }

  // Create unique ID's to populate components with async content
  const playerId = `inline-video-playlist-player-${Math.random().toString(5).substring(2, 7)}`;
  const topicId = `inline-video-playlist-topic-${Math.random().toString(5).substring(2, 7)}`;
  const videosId = `inline-video-playlist-videos-${Math.random().toString(5).substring(2, 7)}`;
  const collapseId = `inline-video-playlist-collapse-${Math.random().toString(5).substring(2, 7)}`;
  const display = data.display || 'partial';

  const videosDOM = `
    <div class="inline-video-playlist-videos-container">
      <h2 class="inline-video-playlist-videos-title">Videos in this playlist</h2>
      <p class="inline-video-playlist-videos-help-blurb">To play a specific video, use the playlist icon <span class="inline-video-playlist-videos-playlist-icon" aria-hidden="true"></span> in the player or view each video on YouTube.</p>
      <ol class="inline-video-playlist-videos-list" id="${videosId}"></ol>
    </div>`;

  const videosCollapsibleDOM = `
    <div class="collapsibles-wrapper">
      <div id="${collapseId}" class="collapsibles block" data-block-name="collapsibles" data-block-status="loaded">
        <div>
          <div>
            <p>bg-metro-silver-color</p>
            <p>Videos in this playlist</p>
            <p>h2</p>
          </div>
          <div class="inline-video-playlist-videos-container">
            <p class="inline-video-playlist-videos-help-blurb">To play a specific video, use the playlist icon <span class="inline-video-playlist-videos-playlist-icon"></span> in the player or view each video on YouTube.</p>
            <ol class="inline-video-playlist-videos-list" id="${videosId}"></ol>
          </div>
        </div>
      </div>
    </div>`;

  const newDOM = `
    <div class="inline-video-playlist-super">
      <div id="${topicId}" class="inline-video-playlist-topic"></div>
      <h2 class="inline-video-playlist-title">${data.title}</h2>
      <div class="inline-video-playlist-description">${data.description}</div>
      <div class="inline-video-playlist-content inline-video-playlist-content-${display}">
        <div class="inline-video-playlist-player" style="" id="${playerId}"></div>
        ${data.display === 'collapsible' ? videosCollapsibleDOM : videosDOM}
      </div>
    </div>`;

  // Populate DOM with playlist authored content
  block.innerHTML = newDOM;
  if (data.display === 'collapsible') {
    collapsiblesDecorate(document.getElementById(collapseId));
  }
  makeYTPlayer(0, data.playlistId, playerId);

  // Populate DOM with Playlist Info from AEM Servlet
  const plistInfo = await getPlistInfo(data.playlistId);
  document.getElementById(topicId).innerHTML = `<a href="https://www.youtube.com/channel/${plistInfo.playlistInfo.channelId}">${plistInfo.playlistInfo.channelTitle}</a>`;
  document.getElementById(videosId)
    .innerHTML = generateVideosListDOM(plistInfo.items, data.playlistId);
}
