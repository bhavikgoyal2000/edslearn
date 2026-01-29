/* global WebImporter */
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
const createItem = (featuredEventsParent, document) => {
    let featuredEventsItem = [];    
    
    let eventType = 'flexEvent';
  //let imgElement = featuredEventsParent.querySelector('.single-article-feature-inner');
  let imgAlt = featuredEventsParent ? featuredEventsParent.getAttribute('alt') || '' : '';
  let imgSrc = featuredEventsParent ? featuredEventsParent.getAttribute('data-bg') || '' : '';
  if (!imgAlt) {
  imgAlt = imgSrc.substring(imgSrc.lastIndexOf('/') + 1);
  }

  let eventTitle = featuredEventsParent.querySelector('header h1')?.textContent.trim() || '';

const dateElement = featuredEventsParent.querySelector('footer .date');
const timeElement = featuredEventsParent.querySelector('footer .time');
let startDate = '';
let endDate = '';

if (dateElement) {
  const dateTimes = dateElement.querySelectorAll('time');
  if (dateTimes.length === 2) {
    // Hyphen/date range case
    startDate = dateTimes[0].getAttribute('datetime') || '';
    endDate = dateTimes[1].getAttribute('datetime') || '';
  } else if (dateTimes.length === 1) {
    startDate = dateTimes[0].getAttribute('datetime') || '';
    endDate = '';
    // If .time exists, check if its datetime matches the date
    if (timeElement) {
      const timeTag = timeElement.querySelector('time');
      const timeDate = timeTag ? timeTag.getAttribute('datetime') : '';
      if (timeDate && timeDate === startDate) {
        endDate = startDate;
      }
    }
  }
}

let ctas = featuredEventsParent.querySelectorAll('.overlay .promo-cta a');

let cta1Text = ctas[0]?.textContent.trim() || '';
let cta1Url = ctas[0]?.getAttribute('href') || '';
let cta2Text = ctas[1]?.textContent.trim() || '';
let cta2Url = ctas[1]?.getAttribute('href') || '';

const firstDiv = document.createElement('div');
firstDiv.append(mkP(eventType,'flexVariation'));

const secondDiv = document.createElement('div');
secondDiv.append(mkP(eventTitle,'content_title'));
secondDiv.append(mkP('','content_richtext'));

const thirdDiv = document.createElement('div');
thirdDiv.append(mkP(startDate,'dates_startDate'));
thirdDiv.append(mkP(endDate,'dates_endDate'));


const fifthDiv = document.createElement('div');

  if (imgSrc) {
    const pictureEl = buildResponsivePicture(document, imgSrc, imgAlt);
    fifthDiv.append(mkP(pictureEl,'media_image'));
  }

   
  const sixthDiv = document.createElement('div');  
  let linkWrap = '';
  if (ctas[0]) {
    const a = document.createElement('a');
    a.href = ctas[0].getAttribute('href') || '';
    a.textContent = ctas[0].textContent || '';
    linkWrap = mkP(a,'ctas_link1','button-container');
  } else {
    linkWrap = mkP('','ctas_link1','button-container');
  }
  let ctaText = cta1Text;
  //sixthDiv.append(mkP(ctaText ? ctaText : '','ctas_link1Text'));
  sixthDiv.append(linkWrap);

  //const seventhDiv = document.createElement('div'); 

  let linkWrap2 = '';
  if (ctas[1]) {
    const a = document.createElement('a');
    a.href = ctas[1].getAttribute('href') || '';
    a.textContent = ctas[1].textContent || '';
    linkWrap2 = mkP(a,'ctas_link2','button-container');
  } else {
    linkWrap2 = mkP('','ctas_link2','button-container');
  }
  let ctaText2 = cta2Text;
  //sixthDiv.append(mkP(ctaText2 ? ctaText2 : '','ctas_link2Text'));
  sixthDiv.append(linkWrap2);

  const eightDiv = document.createElement('div'); 
  const ninthDiv = document.createElement('div'); 
  const tenthDiv = document.createElement('div'); 
  eightDiv.append(mkP());
  ninthDiv.append(mkP());
  tenthDiv.append(mkP());


  if (firstDiv.hasChildNodes()) {
    featuredEventsItem.push([firstDiv]);
    featuredEventsItem.push([secondDiv]);
    featuredEventsItem.push([thirdDiv]);
    featuredEventsItem.push([fifthDiv]);
    featuredEventsItem.push([sixthDiv]);
    //featuredEventsItem.push([eightDiv]);

    return featuredEventsItem;
  }

    return undefined; // Return undefined if no valid content is found
};

export default createItem;