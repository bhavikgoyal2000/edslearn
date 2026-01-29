/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';

const createHero = (main, document, params) => {
  const { originalURL } = params;

  const hero = main.querySelector('.hero');

  if (hero) {
    const picImg = hero.querySelector('picture > img');
    picImg.src = cleanUpSrcUrl(picImg.src, originalURL);
    picImg.alt = picImg.alt || 'Hero image';
    const title = hero.querySelector('p:nth-child(2)');

    const h1 = document.createElement('h1');
    // assign the title to the h1 element
    h1.textContent = title.textContent;
    title.remove();

    const p = document.createElement('p');
    p.appendChild(h1);
    p.appendChild(picImg);

    const cells = [
      ['Hero'],
      [p],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    hero.append(block);
  }
};
  export default createHero;
