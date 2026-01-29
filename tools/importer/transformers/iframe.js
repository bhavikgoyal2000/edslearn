/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
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

const iframe = (main, document, params) => {

  const iFrameElements = main.querySelectorAll('.cs_control iframe');

  if (iFrameElements) {
    iFrameElements.forEach(iFrameEle => {
    if (iFrameEle.hasAttribute('src')) {
      const iFrameURL = iFrameEle.getAttribute('src') || '';
      const iFrameHeight = iFrameEle.getAttribute('height') || '';
      const firstDiv = document.createElement('div');
      firstDiv.append(mkP(iFrameURL,'iframe_url'));
      firstDiv.append(mkP(iFrameHeight,'iframe_height'));
      const cells = [
        ['IFrame'],
        [''],
        [''],
        [''],
        [''],
        [firstDiv],
      ];

      const block = WebImporter.DOMUtils.createTable(cells, document);
      iFrameEle.replaceWith(block);
    }
    });
  }
};
  export default iframe;
