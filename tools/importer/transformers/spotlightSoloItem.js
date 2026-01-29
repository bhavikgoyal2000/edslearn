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

const createItem = (spotlightsoloParent, document, params) => {
  let spotlightsoloItem = [];
  const { originalURL } = params;

  const tagLine = spotlightsoloParent.querySelector('header > h1')?.textContent || '';

  let imgSrc = spotlightsoloParent.querySelector('img')?.getAttribute('src') || '';
  let imgAlt = spotlightsoloParent.querySelector('img')?.getAttribute('alt') || '';

  imgSrc = cleanUpSrcUrl(imgSrc, originalURL);

  const img = buildImageElement({ imgSrc, imgAlt });

  const heading = spotlightsoloParent.querySelector('.panel-body h1')?.textContent || '';
  const subheading = spotlightsoloParent.querySelector('.panel-body .byline-sub')?.textContent || '';

  const pullQuote = spotlightsoloParent.querySelector('.panel-body blockquote')?.innerHTML || '';

  const storyText = spotlightsoloParent.querySelector('.panel-body .story-text')?.innerHTML || '';

  spotlightsoloItem.push([mkP(Math.ceil(Math.random() * (1000 - 100) + 100), 'cookieId')]);
  spotlightsoloItem.push([mkP(tagLine,'tagline')]);
  spotlightsoloItem.push([mkP(heading,'header')]);
  spotlightsoloItem.push([mkP(subheading,'subheading1')]);
  spotlightsoloItem.push(['']);
  spotlightsoloItem.push([mkP(pullQuote,'pull_quote')]);
  spotlightsoloItem.push([mkP(img,'spotlight_image')]);
  spotlightsoloItem.push(['']);
  spotlightsoloItem.push([mkP(storyText,'story_text')]);
  spotlightsoloItem.push(['']);
  spotlightsoloItem.push(['']);
  return spotlightsoloItem;
};

export default createItem;