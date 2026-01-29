/* global WebImporter */
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

const blockquote = (main, document, params) => {
  const blockquoteElements = main.querySelectorAll('aside[data-element="2016 Blockquote"]');

  const htmlString = params.html;
    const mainBody = getRawHTMLDOM(htmlString);
      const blockquoteSection = mainBody.querySelectorAll('aside[data-element="2016 Blockquote"]');

  if (blockquoteElements) {
    blockquoteElements.forEach((blockquoteEle, index) => {
      const isGlobal = hasGlobalElement(blockquoteSection[index]) ? 'true' : 'false';
      const blockquotes = blockquoteEle.querySelectorAll('blockquote');
      const ombreStyleDiv = blockquoteEle.querySelector('.block-above');
      const quoteMarkDiv = blockquoteEle.querySelector('.quote-mark');
      
      blockquotes.forEach(blockquote => {
        let styleType = '';
        if (blockquote.classList.contains('ca-purple')) {
          styleType = 'ca-style-purple';
        } else if (blockquote.classList.contains('ca-green')) {
          styleType = 'ca-style-green';
        } else if (ombreStyleDiv) {
          styleType = 'ombre-style';
        } else if (blockquoteEle.classList.contains('diag-back')) {
          styleType = 'bg-image';
        }
        const blockquoteText = blockquote.querySelector('p') ? blockquote.querySelector('p').innerHTML : '';
        const cite = blockquoteEle.querySelector('cite') ? blockquoteEle.querySelector('cite').innerHTML : '';

        const firstDiv = document.createElement('div');
        firstDiv.append(mkP(blockquoteText,'blockquote_text'));
        firstDiv.append(mkP(cite,'blockquote_citationName'));
        firstDiv.append(mkP(cite,'blockquote_citationTxt'));
        //firstDiv.append(mkP('','blockquote_image'));

        //firstDiv.append(mkP('','blockquote_iconQuotation'));
       // firstDiv.append(mkP('','blockquote_iconQuotation'));

        const cells = [
            ['Block Quote'],
            [isGlobal],
            [styleType],
            [firstDiv],
            [''],
            ['']
          ];

          const block = WebImporter.DOMUtils.createTable(cells, document);
          blockquote.replaceWith(block);
      });
    });
  }

};

export default blockquote;
