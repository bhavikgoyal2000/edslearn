import { hasGlobalElement } from '../utils/dom-utils.js';

// import utility for inline video playlist
const inlineVideoPlaylist = async (main, document, params) => {
  const sections = main.querySelectorAll('section.section-playlist[data-element="2020 Inline Video Playlist"]');
  if (!sections) return;

  sections.forEach(async (section) => {
    const cells = [
      ['Inline Video Playlist'] // block name
    ];

    const isGlobal = hasGlobalElement(section) ? 'true' : 'false';
    let videoId = '';
    let style = 'partial';
    if (section.classList.contains('video-full')) style = 'full';
    if (section.classList.contains('video-collapsible')) style = 'collapsible';
    const title = section.querySelector('header')?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim() || '';
    const description = section.querySelector(':scope > div > p.lede')?.textContent.trim() || '';

    const iframeSrc = section.querySelector('iframe')?.getAttribute('src');
    if (!iframeSrc) return;
    const iframeUrl = new URL(iframeSrc);
    if (iframeUrl.hostname.includes('youtube.com')) {
      videoId = iframeUrl.searchParams.get('list');
    }

    cells.push([isGlobal]);
    cells.push([videoId]);
    cells.push([style]);
    cells.push([title]);
    cells.push([description]);

    // --- Wrap in importer table ---
    const block = WebImporter.DOMUtils.createTable(cells, document);

    section.innerHTML = '';
    section.append(block);
  });
};

export default inlineVideoPlaylist;
