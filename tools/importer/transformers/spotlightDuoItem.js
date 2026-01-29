/* global WebImporter */
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { img } from './dom-builder.js';

/**
 * Utility to create a field placeholder for the WebImporter table
 */
const mkP = (value = '', fieldName, className) => {
  const div = document.createElement('div');
  if (fieldName) {
    const p = document.createElement('p');
    if (className) p.className = className;
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(value);
    div.appendChild(p);
  }
  return div;
};

/**
 * Extract Duo Spotlight item data from a panel group
 * Returns a single array representing one JCR item
 */
const createItem = (duoParent, document, params) => {
  const { originalURL } = params;

  // Cookie ID & Tagline
  const cookieId = Math.ceil(Math.random() * (1000 - 100) + 100);
  const tagline = duoParent.closest('section')?.querySelector('header > h1')?.textContent || '';

  let leftHeader = '', leftSub1 = '', leftSub2 = '', leftPullQuote = '', leftStory = '', leftCta = '', leftImg = null, leftImgAlt = '';
  let rightHeader = '', rightSub1 = '', rightSub2 = '', rightPullQuote = '', rightStory = '', rightCta = '', rightImg = null, rightImgAlt = '';

  // Iterate over articles inside panel-group.duo
  duoParent.querySelectorAll('article.panel').forEach(article => {
    const panelBody = article.querySelector('.panel-body');
    if (!panelBody) return;

    const imgEl = article.querySelector('img');
    const imgSrc = cleanUpSrcUrl(imgEl?.getAttribute('src') || '', originalURL);
    const imgAlt = imgEl?.getAttribute('alt') || '';
    const imgElement = buildImageElement({ imgSrc: imgSrc, imgAlt });

    const byline = panelBody.querySelector('.byline')?.textContent || '';
    const sub1 = panelBody.querySelector('.byline-sub')?.textContent || '';
    const sub2 = panelBody.querySelector('.byline-sub-b')?.textContent || '';
    const pullQuote = panelBody.querySelector('blockquote')?.innerHTML || '';
    const story = panelBody.querySelector('.story-text')?.innerHTML || '';
    const cta = panelBody.querySelector('button')?.textContent || '';

    const divId = article.querySelector('div[id]')?.id || '';

    if (divId.includes('panel-left')) {
      leftHeader = byline;
      leftSub1 = sub1;
      leftSub2 = sub2;
      leftPullQuote = pullQuote;
      leftStory = story;
      leftCta = cta;
      leftImg = imgElement;
      leftImgAlt = imgAlt;
    } else if (divId.includes('panel-right')) {
      rightHeader = byline;
      rightSub1 = sub1;
      rightSub2 = sub2;
      rightPullQuote = pullQuote;
      rightStory = story;
      rightCta = cta;
      rightImg = imgElement;
      rightImgAlt = imgAlt;
    }
  });

  // SINGLE ROW = SINGLE JCR ITEM
  const duoItem = [
    mkP(cookieId, 'cookieId'),
    mkP(tagline, 'tagline'),

    mkP(leftHeader, 'leftHeader'),
    mkP(leftSub1, 'leftSubheading1'),
    mkP(leftSub2, 'leftSubheading2'),
    mkP(leftPullQuote, 'leftPullQuote'),
    mkP(leftImg, 'left_image'),
    mkP(leftImgAlt, 'left_imageAlt'),
    mkP(leftStory, 'leftStory'),
    mkP(leftCta, 'leftCta'),

    mkP(rightHeader, 'rightHeader'),
    mkP(rightSub1, 'rightSubheading1'),
    mkP(rightSub2, 'rightSubheading2'),
    mkP(rightPullQuote, 'rightPullQuote'),
    mkP(rightImg, 'right_image'),
    mkP(rightImgAlt, 'right_imageAlt'),
    mkP(rightStory, 'rightStory'),
    mkP(rightCta, 'rightCta')
  ];

  return duoItem;
};

export default createItem;
