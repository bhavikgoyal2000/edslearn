import { hasGlobalElement } from '../utils/dom-utils.js';
import { removeCfm } from '../utils/link-utils.js';

// import utility for inline video
const inlineVideo = async (main, document, params) => {
  const sections = main.querySelectorAll('section.section-inline-video[data-element="2016 Inline Video"]');
  if (!sections) return;

  sections.forEach(async (section) => {
    const cells = [
      ['Inline Video'] // block name
    ];

    const isGlobal = hasGlobalElement(section) ? 'true' : 'false';
    let videoService = '';
    let videoId = '';
    const style = section.classList.contains('video-partial') ? 'partial' : 'full';
    const runtime = section.querySelector('.running-time')?.textContent.trim() || '';
    const title = section.querySelector('header')?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim() || '';
    const hideTitle = Boolean(section.querySelector('header')?.querySelector('.sr-only'));
    const description = section.querySelector('.video-content-container')?.querySelector('p')?.textContent.trim() || '';
    const topic = section.querySelector('.topic')?.textContent.trim() || '';
    let cta1Text = '';
    let cta1Url = '';
    let cta2Text = '';
    let cta2Url = '';
    let cta3Text = '';
    let cta3Url = '';

    const iframeSrc = section.querySelector('iframe')?.getAttribute('src');
    if (!iframeSrc) return;
    const iframeUrl = new URL(iframeSrc);
    if (iframeUrl.hostname.includes('youtube.com')) {
      videoService = 'youtube';
      videoId = iframeUrl.pathname?.split('/')?.at(-1);
    } else if (iframeUrl.hostname.includes('vimeo.com')) {
      videoService = iframeUrl.pathname?.includes('showcase') ? 'vimeoShowcase' : 'vimeo';
      const strippedPath = iframeUrl.pathname?.replace('/embed', '') || '';
      videoId = strippedPath.split('/')?.at(-1) || '';
    } else { return; }

    let ctasWrapper = section.querySelector('.video-content-container')?.querySelectorAll('p')[1];
    if (ctasWrapper) {
      const cta1 = ctasWrapper.querySelector('a');
      cta1Text = cta1.textContent.trim();
      cta1Url = removeCfm(cta1.getAttribute('href'));
    } else {
      ctasWrapper = section.querySelector('.video-content-container')?.querySelectorAll('li');
      if (ctasWrapper) {
        const cta1 = ctasWrapper[0]?.querySelector('a');
        cta1Text = cta1?.textContent.trim() || '';
        cta1Url = removeCfm(cta1?.getAttribute('href') || '');
        const cta2 = ctasWrapper[1]?.querySelector('a');
        cta2Text = cta2?.textContent.trim() || '';
        cta2Url = removeCfm(cta2?.getAttribute('href') || '');
        const cta3 = ctasWrapper[2]?.querySelector('a');
        cta3Text = cta3?.textContent.trim() || '';
        cta3Url = removeCfm(cta3?.getAttribute('href') || '');
      }
    }

    cells.push([isGlobal]);
    cells.push([videoService]);
    cells.push([videoId]);
    cells.push([style]);
    cells.push([runtime]);
    cells.push([title]);
    cells.push([hideTitle]);
    cells.push([description]);
    cells.push([topic]);
    cells.push([cta1Text]);
    cells.push([cta1Url]);
    cells.push([cta2Text]);
    cells.push([cta2Url]);
    cells.push([cta3Text]);
    cells.push([cta3Url]);

    // --- Wrap in importer table ---
    const block = WebImporter.DOMUtils.createTable(cells, document);

    section.innerHTML = '';
    section.append(block);
  });
};

export default inlineVideo;
