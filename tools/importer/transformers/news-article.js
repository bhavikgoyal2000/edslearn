/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';

const newsArticle = (main, document, params) => {

  const newsArticleElements = main.querySelectorAll('.news-success-story');
  if (newsArticleElements) {
    newsArticleElements.forEach(newsArticleElement => {
    const cells = [
      ['News Article'],
      [''],
      [''],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    newsArticleElement.replaceWith(block);
    });
  }
};
export default newsArticle;
