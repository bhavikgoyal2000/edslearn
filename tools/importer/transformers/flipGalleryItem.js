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

const createItem = (flipGalleryParent, document, flipCards, params) => {
    //let flipGalleryItem = [];    
    const { originalURL } = params;
  const parentEle = flipGalleryParent.querySelector('.row.row-center > .flex');
  const immediateChildren = Array.from(parentEle.children);
  let layOutType = 'layout1';
  const cards = [];
  immediateChildren.forEach((child, parentIndex) => {
  const parentDiv = Array.from(child.children);
  parentDiv.forEach((divElem, index) => {
    
    if (parentIndex === immediateChildren.length-1) {
      
      const lastParentDiv = Array.from(divElem.children);

      lastParentDiv.forEach((lastPDiv, lastParentIndex) => {

        const divElemClass = lastPDiv.classList.contains('square') ? 'square' :
                  lastPDiv.classList.contains('square-big') ? 'square-big' :
                  lastPDiv.classList.contains('landscape') ? 'landscape' : '';
    

          let image;
          let text;
          let elementType;
          if (divElemClass === 'square') {
            
            image = lastPDiv.querySelector('.tile > img')?.src || '';
            text = lastPDiv.querySelector('.modal-body')?.textContent.trim() || '';
            elementType = 'square';
                      
          } else if (divElemClass === 'square-big') {
            image = lastPDiv.querySelector('.tile > img')?.src || '';
            text = lastPDiv.querySelector('.modal-body')?.textContent.trim() || '';
            elementType = 'bigsquare';
          } else if (divElemClass === 'landscape') {
            image = lastPDiv.querySelector('.tile > img')?.src || '';
            text = lastPDiv.querySelector('.modal-body')?.textContent.trim() || '';
            elementType = 'landscape';
          }

          if (image &&  text && elementType) {
              cards.push({image, text, elementType});
            }

      });


    } else {
    const divElemClass = divElem.classList.contains('square') ? 'square' :
                  divElem.classList.contains('square-big') ? 'square-big' :
                  divElem.classList.contains('landscape') ? 'landscape' : '';
    

          let image;
          let text;
          let elementType;
          if (divElemClass === 'square') {
            
            image = divElem.querySelector('.tile > img')?.src || '';
            text = divElem.querySelector('.modal-body')?.textContent.trim() || '';
            elementType = 'square';
                      
          } else if (divElemClass === 'square-big') {
            image = divElem.querySelector('.tile > img')?.src || '';
            text = divElem.querySelector('.modal-body')?.textContent.trim() || '';
            elementType = 'bigsquare';
          } else if (divElemClass === 'landscape') {
            if (index === 0) {
              layOutType = 'layout2';
            }
            image = divElem.querySelector('.tile > img')?.src || '';
            text = divElem.querySelector('.modal-body')?.textContent.trim() || '';
            elementType = 'landscape';
          }

          if (image &&  text && elementType) {
              cards.push({image, text, elementType});
            }
          }

  });
});

cards.forEach(card => {
  const { image, text, elementType } = card;
  //const pictureEl = buildResponsivePicture(document, image);
  const imgSrc = cleanUpSrcUrl(image, originalURL);
  const pictureEl = buildImageElement({ imgSrc, imgAlt: image.alt || '' });
  //const cardDiv = document.createElement('div');

    // Left column: type and display
    const leftDiv = document.createElement('div');
    leftDiv.append(mkP(elementType,'flipImageCards_cardStyle'));
    leftDiv.append(mkP(text,'flipImageCards_flipTxt'));

    // Right column: picture
    const rightDiv = document.createElement('div');
      rightDiv.append(mkP(pictureEl,'image'));
    flipCards.push([leftDiv, rightDiv]);
});
};

export default createItem;