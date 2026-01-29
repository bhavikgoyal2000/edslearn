/* global WebImporter */

const blockquoteDOM = (main, document) => {
  const blockquotes = main.querySelectorAll('blockquote');
  if (!blockquotes.length) return;

  for (const blockquote of blockquotes) {
    const parentCells = [
      ['BlockQuote DOM']
    ];
    const parentDiv = document.createElement('div');
    parentDiv.className = 'blockquote';
    const pTag = document.createElement('p');
    pTag.innerHTML = blockquote.innerHTML;
    parentDiv.appendChild(pTag);
    parentCells.push([parentDiv]);
    const parentBlock = WebImporter.DOMUtils.createTable(parentCells, document);
    blockquote.replaceWith(parentBlock);
  }

};

export default blockquoteDOM;
