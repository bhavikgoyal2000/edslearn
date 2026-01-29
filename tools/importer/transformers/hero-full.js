/* global WebImporter */
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { hasGlobalElement, getRawHTMLDOM } from '../utils/dom-utils.js';
import { img } from './dom-builder.js';

const mkP = (text = '', fieldName) => {
  const div = document.createElement('div');
  if (!fieldName) return div;

  const p = document.createElement('p');
  div.innerHTML = `<!-- field:${fieldName} -->`;

  if (text instanceof HTMLElement) {
    div.appendChild(text);
  } else {
    p.textContent = text || '';
    div.appendChild(p);
  }
  return div;
};

const createFullHero = (main, document, params) => {
  const { originalURL, html: htmlString } = params;
  const mainBody = getRawHTMLDOM(htmlString);
  const heroSection = mainBody.querySelector('.hero-image.hero-image-full');
  const hero = main.querySelector('.hero-image.hero-image-full');

  if (!hero) return;

  const isGlobal = hasGlobalElement(heroSection) ? 'true' : 'false';

  // --- Image setup ---
  const picImg = hero.querySelector(':scope > img, .hero-img-wrap img');
  let imgSrc = picImg?.src || '';
  let imgAlt = picImg?.alt || '';
  imgSrc = cleanUpSrcUrl(imgSrc, originalURL);

  const pictureEl = buildImageElement({ imgSrc, imgAlt });

  const firstDiv = document.createElement('div');
  firstDiv.append(mkP('var-full-width-image', 'hero_variation'));
  firstDiv.append(mkP(pictureEl, 'hero_image'));

  // --- Message and description ---
  const heroMsgContainer = hero.querySelector('.message');
  const descriptionText =
    heroMsgContainer?.querySelector('.lede')?.textContent.trim() || '';
  firstDiv.append(mkP(descriptionText, 'hero_text'));
  // --- Flex context handling (safe) ---
  const flexContext = hero.querySelector('.flex-context');
  const flexClasses = flexContext ? flexContext.classList : [];

  // Vertical alignment
  let verticalAlignP = '';
  if (flexClasses.contains('flex-top')) {
    verticalAlignP = 'txt-align-start';
  } else if (flexClasses.contains('flex-bottom')) {
    verticalAlignP = 'txt-align-end';
  } else {
    verticalAlignP = 'txt-align-center';
  }
  firstDiv.append(mkP(verticalAlignP, 'hero_textVerticalAlignment'));

  // Horizontal alignment (defaulting to left)
  let horizontalAlignP = 'txt-horizontal-left';
  if (hero.classList.contains('full-width-right')) {
    horizontalAlignP = 'txt-horizontal-right';
  }
  firstDiv.append(mkP(horizontalAlignP, 'hero_textHorizontalAlignment'));

  // --- CTA handling ---
  const ctaLink =
    heroMsgContainer?.querySelector('.lede a, a.btn, a.button') || null;
  const ctaText = ctaLink?.textContent.trim() || '';
  const ctaHref = ctaLink?.href || '';

  firstDiv.append(mkP(ctaText, 'hero_btnCaption'));
  firstDiv.append(mkP(ctaHref, 'hero_btnLink'));
  firstDiv.append(mkP('link', 'hero_buttonVariation'));
  firstDiv.append(mkP('cta-bg-indigo-purple-color', 'hero_ctaBackgroundColor'));

  // --- Cross-fade images (if any) ---
  const crossFadeEle = hero.querySelector('.cross-fade');
  if (crossFadeEle) {
    const images = crossFadeEle.querySelectorAll('img');
    images.forEach((image, i) => {
      const src = cleanUpSrcUrl(image.src || '', originalURL);
      const alt = image.alt || '';
      const imageEl = buildImageElement({ imgSrc: src, imgAlt: alt });
      firstDiv.append(mkP(imageEl, `hero_image${i + 1}`));
    });
  } else {
    const heroFirstPictureEl = buildImageElement({ imgSrc, imgAlt });
    firstDiv.append(mkP(heroFirstPictureEl, `hero_image1`));
  }

  // --- Title + Subtitle ---
  let title = '';
  let subTitle = '';

  const titleHeader = hero.querySelector('.message header');
  if (titleHeader) {
    subTitle =
      titleHeader.querySelector('h1 > small')?.textContent.trim() || '';
      const small = titleHeader.querySelector('h1 > small');
      if (small) small.remove();
      title = titleHeader.querySelector('h1')?.textContent.trim() || '';
  } else {
    // fallback: take message text or lede as title
    title =
      heroMsgContainer?.querySelector('.lede')?.textContent.trim() ||
      heroMsgContainer?.textContent.trim() ||
      '';
  }

  const secondDiv = document.createElement('div');
  const thirdDiv = document.createElement('div');
  const fourthDiv = document.createElement('div');

  secondDiv.append(mkP(title, 'title'));
  thirdDiv.append(mkP(subTitle, 'surtitle'));

  const ucmApprovedImg = heroMsgContainer?.querySelector('img') || null;
 let ucmApprovedImgSrc = ucmApprovedImg?.src || '';
 const ucmApprovedImgAlt = ucmApprovedImg?.alt || '';
 if (ucmApprovedImgSrc) {
    ucmApprovedImgSrc = cleanUpSrcUrl(ucmApprovedImgSrc, originalURL);
    const ucmApprovedImageEl = buildImageElement({ imgSrc: ucmApprovedImgSrc, imgAlt: ucmApprovedImgAlt });
    fourthDiv.append(mkP(ucmApprovedImageEl, 'imageLogo'));
 }

  // --- Assemble final block ---
  const cells = [
    ['Hero'],
    [isGlobal],
    [firstDiv],
    [secondDiv],
    [thirdDiv],
    [fourthDiv],
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  hero.replaceWith(block);
};

export default createFullHero;
