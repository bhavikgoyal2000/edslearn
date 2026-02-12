// Creates the DOM structure as described in your HTML example
function createVideoHeroDOM(
  videoSrc,
  posterImgSrc,
  posterImgCaption,
  mobileImgSrc,
  mobileImgAlt,
  ctaText,
  ctaLink,
  titleText,
) {
  const row = document.createElement('div');
  row.className = 'videorow';

  const videoContainer = document.createElement('div');
  videoContainer.className = 'col-xs-12 video-container no-bs-padding';
  videoContainer.setAttribute('itemscope', '');
  videoContainer.setAttribute('itemtype', 'http://schema.org/VideoObject');

  const mobileImg = document.createElement('img');
  mobileImg.className = 'visible-xs';
  mobileImg.src = mobileImgSrc;
  mobileImg.alt = mobileImgAlt;
  videoContainer.appendChild(mobileImg);

  const video = document.createElement('video');
  video.tabIndex = 0;
  video.id = 'homepage-video';
  video.className = 'visible-sm visible-md visible-lg active';
  video.muted = true;
  video.poster = posterImgSrc;
  video.preload = 'auto';
  video.setAttribute('aria-describedby', 'hero-video-description');
  video.autoplay = true;
  video.loop = true;
  video.setAttribute('data-au-video-name', 'Challenge Accepted Video');
  video.setAttribute('disablepictureinpicture', '');

  const source = document.createElement('source');
  source.src = videoSrc;
  source.type = 'video/mp4';
  video.appendChild(source);

  videoContainer.appendChild(video);

  const desc = document.createElement('p');
  desc.id = 'hero-video-description';
  desc.className = 'sr-only hidden-xs hidden-sm';
  desc.setAttribute('itemprop', 'transcript description');
  desc.textContent = posterImgCaption;
  videoContainer.appendChild(desc);

  const videoBgContent = document.createElement('div');
  videoBgContent.className = 'video-background-content';

  const contentContainer = document.createElement('div');
  contentContainer.className = 'content container';

  const wordmarkImg = document.createElement('img');
  wordmarkImg.src = `${window.hlx.codeBasePath}/blocks/backgroundvideo/your-purpose-wordmark.png`;
  wordmarkImg.alt = 'AU WordMark';
  contentContainer.appendChild(wordmarkImg);

  const h1 = document.createElement('h1');
  h1.textContent = titleText;
  contentContainer.appendChild(h1);

  const cta = document.createElement('a');
  cta.href = ctaLink;
  cta.className = 'cta';
  cta.textContent = ctaText;
  contentContainer.appendChild(cta);

  videoBgContent.appendChild(contentContainer);
  videoContainer.appendChild(videoBgContent);

  row.appendChild(videoContainer);

  const heroBtns = document.createElement('div');
  heroBtns.className = 'hero-btns';

  const heroBtnsContainer = document.createElement('div');
  heroBtnsContainer.className = 'container';

  const firstP = document.createElement('p');

  const playBtn = document.createElement('div');
  playBtn.id = 'play-btn';
  playBtn.className = '';

  const txt508 = document.createElement('div');
  txt508.id = 'txt508';

  const playLink = document.createElement('a');
  playLink.href = '#';
  playLink.id = 'pop';

  const spanWholeVid = document.createElement('span');
  spanWholeVid.className = 'whole-vid';
  spanWholeVid.textContent = 'Pause';

  playLink.appendChild(spanWholeVid);
  txt508.appendChild(playLink);
  playBtn.appendChild(txt508);

  const secondP = document.createElement('p');

  heroBtnsContainer.appendChild(firstP);
  heroBtnsContainer.appendChild(playBtn);
  heroBtnsContainer.appendChild(secondP);

  heroBtns.appendChild(heroBtnsContainer);

  // Append hero-btns after videoContainer
  row.appendChild(heroBtns);

  return row;
}

export default function decorate(block) {
  const [
    videoObj,
    posterImgObj,
    posterImgCaptionObj,
    ctaObj,
    titleObj,
    mobileImgObj,
  ] = block.children;
  const videoSrc = videoObj?.querySelector('a')?.href;
  const posterImgSrc = posterImgObj?.querySelector('img')?.src;
  const posterImgCaption = posterImgCaptionObj?.querySelector('p')?.textContent;
  const mobileImgSrc = mobileImgObj?.querySelector('img')?.src;
  const mobileImgAlt = mobileImgObj?.querySelector('img')?.getAttribute('alt');
  const ctaText = ctaObj?.querySelector('a')?.textContent || 'Join Us';
  const ctaLink = ctaObj?.querySelector('a')?.href || '#';
  const heading = titleObj?.querySelector('h1, h2, h3, h4, h5, h6');
  const titleText = heading?.textContent
                   || 'Start your journey at AU in Washington, DC.';

  const row = createVideoHeroDOM(
    videoSrc,
    posterImgSrc,
    posterImgCaption,
    mobileImgSrc,
    mobileImgAlt,
    ctaText,
    ctaLink,
    titleText,
  );
  block.textContent = '';
  block.appendChild(row);

  const playBtn = block.querySelector('.hero-btns #pop');
  const video = block.querySelector('#homepage-video');
  const playText = playBtn.querySelector('.whole-vid');

  playBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (video.paused) {
      video.play();
      playText.textContent = 'Pause';
    } else {
      video.pause();
      playText.textContent = 'Play';
    }
  });
}
