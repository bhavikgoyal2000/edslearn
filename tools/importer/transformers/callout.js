import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';
/* global WebImporter */

const createCallout = (main, document, params) => {
  const { originalURL } = params;
  const nav = main.querySelector('nav[data-element="WCL Callout"]');
  if (!nav) return;

  const blocks = nav.querySelectorAll('.callout-block');
  if (!blocks.length) return;

  for (const block of blocks) {
    // --- Extract image ---
    const style = block.getAttribute('style') || '';
    const bgMatch = style.match(/url\(["']?([^"')]+)["']?\)/);
    const calloutImage = bgMatch ? bgMatch[1] : '';
    const imgSrc = cleanUpSrcUrl(calloutImage, originalURL);

    // --- Extract title & description ---
    const titleLinkEl = block.querySelector('.title a');
    const titleName = titleLinkEl ? titleLinkEl.textContent.trim() : '';
    const description = block.querySelector('.description')?.textContent.trim() || '';
    const calloutImageAlt = titleName; // fallback alt

    const cardImgElement = buildImageElement({ imgSrc, imgAlt: calloutImageAlt });

    // --- First CTA (h2 + link) ---
    let ctaElement1 = null;
    if (titleLinkEl) {
      const cta1url = removeCfm(titleLinkEl.getAttribute('href'));
      const h2 = document.createElement('h2');
      h2.className = 'txt-embassy-blue-color';

      const a = document.createElement('a');
      a.setAttribute('href', cta1url);
      a.setAttribute('title', titleName);
      a.setAttribute('aria-label', `More about ${titleName}`);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = titleName;

      h2.append(a);
      ctaElement1 = h2;
    }

    // --- Second CTA (see-all) ---
    let ctaElement2 = null;
    const seeAllEl = block.parentElement.querySelector('p.see-all a');
    if (seeAllEl) {
      const cta2url = removeCfm(seeAllEl.getAttribute('href'));
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', cta2url);
      a.setAttribute('title', seeAllEl.textContent.trim());
      a.setAttribute('aria-label', `More about ${seeAllEl.textContent.trim()}`);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = seeAllEl.textContent.trim();
      p.append(a);
      ctaElement2 = p;
    }

    // --- Build table cells ---
    const cells = [
      ['Callout'],
      [titleName],
      [description],
      [cardImgElement],
      [ctaElement1], // first CTA as h2 element
      [ctaElement2], // second CTA as p > a element
    ];

    const table = WebImporter.DOMUtils.createTable(cells, document);
    block.replaceWith(table);
  }
};

export default createCallout;
