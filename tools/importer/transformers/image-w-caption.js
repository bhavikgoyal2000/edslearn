/* global WebImporter */
import { img } from './dom-builder.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

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
    
    // img fallback
    picture.appendChild(
      img({
        src: `${baseSrc}`,
        alt,
      }),
    );
  
    return picture;
  };

const imagewithcaption = (main, document, params) => {
  
  const imagewithCaptionElements = main.querySelectorAll('.secondary-figure');
   const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const imageWithCaptionSection = mainBody.querySelectorAll('.secondary-figure');

  if (imagewithCaptionElements) {

    imagewithCaptionElements.forEach((imagewithCaptionElement, index) => {
      const isGlobal = hasGlobalElement(imageWithCaptionSection[index]) ? 'true' : 'false';
      let variationType = '';
      if (imagewithCaptionElement.classList.contains('figure-full-bleed')) {

        variationType = 'full-bleed';

      } else if (imagewithCaptionElement.classList.contains('figure-right-bleed')) {
        variationType = 'right-bleed';
      }
      
      const imageSrc = imagewithCaptionElement.querySelector('img')?.src || '';
      const altText = imagewithCaptionElement.querySelector('img')?.alt || '';
      
      const firstDiv = document.createElement('div');
      
      //firstDiv.append(mkP(imageSrc,'image'));
      const pictureEl = buildResponsivePicture(document, imageSrc, altText);
      firstDiv.append(mkP(pictureEl,'image'));
   
      const secondDiv = document.createElement('div');
      secondDiv.append(mkP(variationType,'style_layout'));
      const thirdDiv = document.createElement('div');
      thirdDiv.append(mkP(isGlobal,'isGlobal'));
    
    const cells = [
      ['Image w Caption'],
      [firstDiv],
      [''],
      [secondDiv],
      [thirdDiv],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    imagewithCaptionElement.replaceWith(block);
     });
  }
};
  export default imagewithcaption;
