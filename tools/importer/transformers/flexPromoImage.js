import { cleanUpSrcUrl } from '../utils/image-utils.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';
const flexPromoImage = (main, document, params) => {
  const { originalURL } = params;

  const promoContainer = main.querySelectorAll('.flex-promo-image');
  if (!promoContainer) return;
  if (promoContainer.length == 0) return;

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const flexPromoImageSection = mainBody.querySelectorAll('.flex-promo-image');

  for (let i = 0; i < promoContainer.length; i++) {
    const promo = promoContainer[i];
    const isGlobal = hasGlobalElement(flexPromoImageSection[i]) ? 'true' : 'false';
    // --- IMAGE ---
  const imgEl = promo.querySelector('.promo-photo img');
  let imgSrc = null;
  let imgAlt = 'Promo image';

  if (imgEl) {
    imgSrc = cleanUpSrcUrl(imgEl.dataset.src || imgEl.src, originalURL);
    imgAlt = imgEl.alt || imgAlt;
  }

  let img = null;
  if (imgSrc) {
    img = document.createElement('img');
    img.src = imgSrc;
    img.alt = imgAlt;
  }

  // --- TITLE ---
  const titleEl = promo.querySelector('header h2');
  const titleText = titleEl ? titleEl.textContent.trim() : 'Promo Title';
  const h2 = document.createElement('h2');
  h2.textContent = titleText;

  // --- DESCRIPTION ---
  const descEl = promo.querySelector('.promo-content p');
  const descText = descEl ? descEl.textContent.trim() : '';
  const pDesc = document.createElement('p');
  pDesc.textContent = descText;

  // --- CTA ---
  const ctaEl = promo.querySelector('.promo-cta a');
  let cta = null;
  if (ctaEl) {
    cta = document.createElement('a');
    cta.href = ctaEl.href;
    cta.textContent = ctaEl.textContent.trim();
    cta.className = 'btn btn-cta';
    if (ctaEl.title) cta.title = ctaEl.title;
    if (ctaEl.getAttribute('aria-label')) cta.setAttribute('aria-label', ctaEl.getAttribute('aria-label'));
  }

  // --- WRAP INTO TABLE/IMPORT BLOCK ---
  const cells = [['Promo'], [isGlobal],[]];
  const container = document.createElement('div');

  if (img) container.appendChild(img);
  container.appendChild(h2);
  container.appendChild(pDesc);
  if (cta) container.appendChild(cta);

  cells[2].push(container);

  const block = WebImporter.DOMUtils.createTable(cells, document);

  // Replace original promo content
  promo.innerHTML = '';
  promo.appendChild(block);
}
};

export default flexPromoImage;
