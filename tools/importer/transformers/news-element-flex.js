/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';

const newsElementFlex = (main, document, params) => {

  const newsArticleElements = main.querySelectorAll('.flex-news-feature');
  if (newsArticleElements) {
    newsArticleElements.forEach(newsArticleElement => {
    const cells = [
      ['News Element Flex'],
      [''],
      [''],
      [''],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    newsArticleElement.replaceWith(block);
     });
  }
};
export default newsElementFlex;
