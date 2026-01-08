import { importVimeoIframeAPI, importYTIframeAPI } from '../../scripts/util.js';

// Creates Vimeo Player using Vimeo iFrame API
function makeVimeoPlayer(tries, videoId, playerId) {
  if (typeof Vimeo !== 'undefined' || tries > 100) {
    // eslint-disable-next-line no-new, no-undef
    new Vimeo.Player(playerId, { id: videoId });
  } else {
    const newTries = tries + 1;
    setTimeout(() => { makeVimeoPlayer(newTries, videoId, playerId); }, 100);
  }
}

// Creates Youtube Player using Youtube iFrame API
function makeYTPlayer(tries, videoId, playerId) {
  if (typeof YT !== 'undefined' || tries > 100) {
    // eslint-disable-next-line no-undef
    YT.ready(() => {
      // eslint-disable-next-line no-undef, no-new
      new YT.Player(playerId, {
        videoId,
        playerVars: {
          playsinline: 1,
        },
      });
    });
  } else {
    // If iFrame API is not ready, recursively call after delay
    const newTries = tries + 1;
    setTimeout(() => { makeYTPlayer(newTries, videoId, playerId); }, 100);
  }
}

// Gets Authoring data of inline video playlist component
function getData(block) {
  const innerDivs = [...block.children].slice(1);
  const videoService = innerDivs[0].textContent.trim();
  let videoId = innerDivs[1].textContent.trim();
  const display = innerDivs[2].textContent.trim() || 'partial';
  const runtime = innerDivs[3].textContent.trim();
  const title = innerDivs[4].textContent.trim();
  const hideTitle = innerDivs[5].textContent.trim() || 'false';
  const description = innerDivs[6].textContent.trim();
  const topic = innerDivs[7].textContent.trim();
  const ctas = [];
  for (let i = 8; i < innerDivs.length; i += 1) {
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
  if (videoService && videoId && display) {
    if (videoId.startsWith('http')) {
      const url = new URL(videoId);
      const params = new URLSearchParams(url.search);
      const path = url.pathname.substring(1);
      const pathList = path.split('/');
      if (videoService === 'vimeo') {
        videoId = pathList.at(0);
      } else if (videoService === 'vimeoShowcase') {
        videoId = pathList.at(1);
      } else {
        videoId = params.get('v');
      }
    }
    data = {
      videoService,
      videoId,
      display,
      runtime,
      title,
      hideTitle,
      description,
      topic,
      ctas,
    };
  }
  return data;
}

// Generate list of CTAs from authored data
function generateCTAsDOM(ctas) {
  if (ctas.length === 0) {
    return '';
  }
  if (ctas.length === 1) {
    return `<div class="inline-video-single-cta-wrapper"><a class="btn btn-primary" href="${ctas[0].ctaUrl}">${ctas[0].ctaText}</a>`;
  }
  let ctaDOM = '<ul class="inline-video-multi-cta-list">';
  ctas.forEach((o) => {
    ctaDOM += `<li><a class"inline-video-cta" href="${o.ctaUrl}">${o.ctaText}</a></li>`;
  });
  return `${ctaDOM}</ul>`;
}

export default function decorate(block) {
  const data = getData(block);

  // If block is not authored, render placeholder
  if (!data.videoId) {
    block.innerHTML = '<p>Inline Video Placeholder</p>';
    return;
  }

  // Create Player DOM based on authored content
  const playerId = `inline-video-player-${Math.random().toString(5).substring(2, 7)}`;
  let runtimeColor = data.runtime?.substring(0, 1)?.match(/[A-Za-z]/) ? '#c4122f' : '#6d6d6d';
  runtimeColor = data.description ? runtimeColor : 'transparent';
  const display = data.display || 'partial';
  const topicDom = data.topic ? `<div class="inline-video-topic">${data.topic}</div>` : '';
  const newDOM = `
  <div class="inline-video-super">
    ${topicDom}
    <h2 class="inline-video-title ${data.hideTitle === 'true' ? 'sr-only' : ''}">${data.title}</h2>
    <div class="inline-video-content inline-video-content-${display}">
      <div class="inline-video-player" id="${playerId}"></div>
      <div class="inline-video-description-container">
        ${data.runtime ? `<div class="inline-video-runtime" style="color: ${runtimeColor}; border-right-color: ${runtimeColor}">${data.runtime}</div>` : ''}
        <div class="inline-video-description">${data.description}</div>
        ${generateCTAsDOM(data.ctas)}
    </div>
  </div>`;
  block.innerHTML = newDOM;

  // Populate video Player with iFrame depending on service selected
  if (data.videoService === 'vimeo') {
    importVimeoIframeAPI();
    makeVimeoPlayer(0, data.videoId, playerId);
  } else if (data.videoService === 'vimeoShowcase') {
    document.getElementById(playerId).innerHTML = `<iframe src="https://vimeo.com/showcase/${data.videoId}/embed" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  } else {
    importYTIframeAPI();
    makeYTPlayer(0, data.videoId, playerId);
  }
}
