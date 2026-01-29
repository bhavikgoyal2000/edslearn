/* global WebImporter */
import { hasGlobalElement, getRawHTMLDOM } from '../utils/dom-utils.js';
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';
const highlightStrip = (main, document, params) => {
  const section = main.querySelector('section.highlight-3rd-tier');
  if (!section) return;
  const htmlString = params?.html || '';
  const mainBody = getRawHTMLDOM(htmlString);
  const highlightStripSection = main.querySelector('section.highlight-3rd-tier');
  const { originalURL } = params || {};
  const isGlobal = hasGlobalElement(highlightStripSection) ? 'true' : 'false';
  // Background variation
  let variation = 'style-no-bg';
  if (section.classList.contains('bg-diagonal')) {
    variation = 'style-diagonal-striped';
  }
  // Desktop image
  const imgEl = section.querySelector('img');
  const desktopSrc = imgEl ? cleanUpSrcUrl(imgEl.getAttribute('src'), originalURL) : '';
  const desktopAlt = imgEl ? imgEl.getAttribute('alt') || '' : '';
  const desktopImgElement = buildImageElement({ imgSrc: desktopSrc, imgAlt: desktopAlt });
  // Hover image
  const hoverEl = section.querySelector('source[data-image-hover]');
  const hoverSrc = hoverEl
    ? cleanUpSrcUrl(hoverEl.getAttribute('data-image-hover') || hoverEl.getAttribute('srcset'), originalURL)
    : desktopSrc;
  const hoverAlt = hoverEl ? hoverEl.getAttribute('alt') || desktopAlt : desktopAlt;
  const hoverImgElement = buildImageElement({ imgSrc: hoverSrc, imgAlt: hoverAlt });
  // Mobile image
  const mobileEl = section.querySelector('source[media*="max-width"]');
  const mobileSrc = mobileEl ? cleanUpSrcUrl(mobileEl.getAttribute('srcset'), originalURL) : desktopSrc;
  const mobileImgElement = buildImageElement({ imgSrc: mobileSrc, imgAlt: desktopAlt });
  // Link
  const link = section.querySelector('a');
  // --- Image URL (anchor) ---
  let highlightElement;
  const linkHref = link ? removeCfm(link.getAttribute('href')) : '';
  const leftDiv = document.createElement('div');
  const pictureDesktop = document.createElement('picture');
  pictureDesktop.append(desktopImgElement);
  const pictureHover = document.createElement('picture');
  pictureHover.append(hoverImgElement);
  const picturemobile = document.createElement('picture');
  picturemobile.append(mobileImgElement);
  const a = document.createElement('a');
  a.setAttribute('href', linkHref);
  a.append(pictureDesktop);
  a.append(pictureHover);
  a.append(picturemobile);
  leftDiv.append(a);
  highlightElement = leftDiv;

      /*modelFields="[isGlobal,
      highlightStrip_imageUrl,
      highlightStrip_variation,
      highlightStrip_image,
      highlightStrip_imageAlt,
      highlightStrip_imageHover,
      highlightStrip_imageHoverAlt,
      highlightStrip_imageMobile,
      highlightStrip_imageMobileAlt*/
  const cells = [
    ['Highlight Strip'],
    [isGlobal],
    [linkHref,variation,highlightElement],
    //[highlightElement],
    //[variation],
   // [pictureDesktop],
   // [pictureHover],
   // [picturemobile],
  ];
  const block = WebImporter.DOMUtils.createTable(cells, document);
  section.replaceWith(block);
};
export default highlightStrip;

