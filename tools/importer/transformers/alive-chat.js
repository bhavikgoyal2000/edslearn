/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';
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

function getSchoolCode(url) {
  try {
    const pathParts = new URL(url).pathname.split('/').filter(Boolean);
    return pathParts.length > 0 ? pathParts[0].toLowerCase() : null;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}

const aliveChat = (main, document, params) => {
  
  const aliveChatButton = main.querySelector('.btn-alive-chat');
  const aliveTout = main.querySelector('.icon-focus > ion-ios-chatboxes-outline');
  if (aliveChatButton) {
    const buttonText = aliveChatButton.textContent;
    
    let pageURL = params.pageUrl;
    let schoolCode = getSchoolCode(pageURL);

    if (schoolCode) {
      schoolCode = schoolCode.toUpperCase();
    }

    const firstDiv = document.createElement('div');

    firstDiv.append(schoolCode);
      
    const secondDiv = document.createElement('div');
    const thirdDiv = document.createElement('div');
    

    secondDiv.append('button');
    thirdDiv.append('outline');

    const fourthDiv = document.createElement('div');
    fourthDiv.append(mkP(buttonText,'ctaSuffixTxt'));

    const cells = [
      ['Alive Chat'], 
      [firstDiv],
      [secondDiv],
      [thirdDiv],
      [fourthDiv],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    aliveChatButton.replaceWith(block);
  } else if (aliveTout) {

    const buttonText = aliveTout?.parentElement?.querySelector('.text-below')?.textContent || 'Chat with Us';
    
    let pageURL = params.pageUrl;
    let schoolCode = getSchoolCode(pageURL);

    if (schoolCode) {
      schoolCode = schoolCode.toUpperCase();
    }

    const firstDiv = document.createElement('div');

    firstDiv.append(schoolCode);
      
    const secondDiv = document.createElement('div');
    const thirdDiv = document.createElement('div');
    

    secondDiv.append('tout');
    thirdDiv.append('outline-taupe');

    const fourthDiv = document.createElement('div');
    fourthDiv.append(mkP(buttonText,'ctaSuffixTxt'));

    const cells = [
      ['Alive Chat'], 
      [firstDiv],
      [secondDiv],
      [thirdDiv],
      [fourthDiv],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    aliveChatButton.replaceWith(block);
  }
};
  export default aliveChat;
