/* global WebImporter */
import { img } from './dom-builder.js';

import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';

const mkP = (text = '', fieldName, className) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    if (className) {
      p.className = className;
    }
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(text);
    div.appendChild(p);
    }
    return div;
  };

  const buildResponsivePicture = (document, baseSrc, alt) => {
  const picture = document.createElement('picture');

  // webp (large)
  const s1 = document.createElement('source');
  s1.setAttribute('type', 'image/webp');
  s1.setAttribute('srcset', `${baseSrc}?width=2000&format=webply&optimize=medium`);
  s1.setAttribute('media', '(min-width: 600px)');
  picture.appendChild(s1);

  // webp (small)
  const s2 = document.createElement('source');
  s2.setAttribute('type', 'image/webp');
  s2.setAttribute('srcset', `${baseSrc}?width=750&format=webply&optimize=medium`);
  picture.appendChild(s2);

  // jpeg (large)
  const s3 = document.createElement('source');
  s3.setAttribute('type', 'image/jpeg');
  s3.setAttribute('srcset', `${baseSrc}?width=2000&format=jpg&optimize=medium`);
  s3.setAttribute('media', '(min-width: 600px)');
  picture.appendChild(s3);

  // img fallback
  picture.appendChild(
    img({
      src: `${baseSrc}?width=750&format=jpg&optimize=medium`,
      loading: 'lazy',
      alt,
      width: '1310',
      height: '440',
    }),
  );

  return picture;
};

const createItem = (flexHouseAdsParent, document, params) => {
  let flexHouseAdsItem = [];
  const { originalURL } = params;
  let ctaLinkElement = flexHouseAdsParent.querySelector('a');
    
  let imgElement = ctaLinkElement.querySelector('img');
  let imgAlt = imgElement ? imgElement.getAttribute('alt') || '' : '';
  let imgSrc = imgElement ? imgElement.getAttribute('src') || '' : '';

  const firstDiv = document.createElement('div');
  if (imgSrc) {
    imgSrc = cleanUpSrcUrl(imgSrc, originalURL);
    const pictureEl = buildImageElement({ imgSrc, imgAlt: imgAlt });
    firstDiv.append(mkP(pictureEl,'flexHouseAdsItem_image'));
  }  
  let linkWrap;
  if (ctaLinkElement) {
    const a = document.createElement('a');
    a.href = removeCfm(ctaLinkElement.getAttribute('href')) || '';
    a.textContent = ctaLinkElement.textContent || '';
    linkWrap = mkP(a,'flexHouseAdsItem_imageUrl','button-container');
  }
  firstDiv.append(linkWrap);  

  if (firstDiv.hasChildNodes()) {
    flexHouseAdsItem.push([firstDiv]);
    return flexHouseAdsItem;
  }

    return undefined; // Return undefined if no valid content is found
};

export default createItem;