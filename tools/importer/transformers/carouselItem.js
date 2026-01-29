/* global WebImporter */
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';
import { img } from './dom-builder.js';

const mkP = (text = '', fieldName) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
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
const createItem = (carouselParent, document) => {
    let carouselItem = [];
    const { originalURL } = params;
    let ctaLinkElement = carouselParent.querySelector('.featured-article-text .button-container a');
    
  let imgElement = carouselParent.querySelector('.single-article-feature-inner');
  let imgAlt = imgElement ? imgElement.getAttribute('alt') || '' : '';
  let imgSrc = imgElement ? imgElement.style.backgroundImage.slice(5, -2) || '' : '';
    if (!imgAlt) {
    imgAlt = imgSrc.substring(imgSrc.lastIndexOf('/') + 1);
    }
  const firstDiv = document.createElement('div');
  if (imgSrc) {
    imgSrc = cleanUpSrcUrl(imgSrc, originalURL);
    const pictureEl = buildImageElement({ imgSrc, imgAlt: imgAlt });
    firstDiv.append(mkP(pictureEl,'carousel_image'));
  }

  const heading = carouselParent.querySelector('.featured-article-text-inner h2')?.textContent.trim();
  const secondDiv = document.createElement('div');
  secondDiv.append(mkP(heading,'title_name'));
  const text = carouselParent.querySelector('.featured-article-text-inner p')?.textContent.trim();
  const thirdDiv = document.createElement('div');
  thirdDiv.append(mkP(text,'content'));

  const fourthDiv = document.createElement('div');  
  let linkWrap = '';
  if (ctaLinkElement) {
    const a = document.createElement('a');
    a.href = removeCfm(ctaLinkElement.getAttribute('href')) || '';
    a.textContent = ctaLinkElement.textContent || '';
    linkWrap = mkP(a,'cta1_url','button-container');
  }
  let ctaText = carouselParent.querySelector('.featured-article-text-inner .button-container a')?.textContent.trim();
  fourthDiv.append(mkP(ctaText ? ctaText : '','cta1_text')); 
  fourthDiv.append(linkWrap);



  if (firstDiv.hasChildNodes()) {
    carouselItem.push([firstDiv]);
    carouselItem.push([secondDiv]);
    carouselItem.push([thirdDiv]);
    carouselItem.push([fourthDiv]);
    return carouselItem;
  }

    return undefined; // Return undefined if no valid content is found
};

export default createItem;