import { moveInstrumentation } from '../../scripts/scripts.js';

function extractRankListContent(block) {
  const children = [...block.children].slice(1);
  if (children.length < 2) return null;

  const headingDiv = children[0];
  const descriptionDiv = children[1];

  const headingText = headingDiv.textContent.trim();
  const descriptionText = descriptionDiv.outerHTML.trim();

  const items = [];

  for (let i = 2; i < children.length; i += 1) {
    const itemDiv = children[i];
    const innerDiv = itemDiv.querySelector('div');

    if (innerDiv) {
      const firstP = innerDiv.querySelector('p');
      let figureText = '';
      let descriptionHtml = '';

      if (firstP) {
        figureText = firstP.textContent.trim();
        const remainingNodes = Array.from(innerDiv.childNodes).filter((node) => node !== firstP);
        descriptionHtml = remainingNodes.map((node) => node.outerHTML || node.textContent).join('').trim();
      }
      const isEmpty = !figureText && !descriptionHtml;

      items.push({
        figureText,
        descriptionHtml,
        source: itemDiv,
        isEmpty,
      });
    }
  }

  return {
    headingText,
    descriptionText,
    items,
  };
}

function createRankListCard(contentData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'rank-list-layout rank-list-text';

  const { headingText, descriptionText, items = [] } = contentData;

  if (headingText) {
    const heading = document.createElement('h3');
    heading.textContent = headingText;
    wrapper.appendChild(heading);
  }

  if (descriptionText) {
    wrapper.insertAdjacentHTML('beforeend', descriptionText);
  }

  const ul = document.createElement('ul');

  items.forEach(({
    figureText,
    descriptionHtml,
    isEmpty,
    source,
  }) => {
    const li = document.createElement('li');

    if (isEmpty) {
      li.classList.add('empty-rank-item');
      li.textContent = 'Click to configure Rank List Item';
    } else {
      const span = document.createElement('span');
      span.textContent = figureText;

      li.appendChild(span);
      li.insertAdjacentHTML('beforeend', descriptionHtml);
    }

    moveInstrumentation(source, li);
    ul.appendChild(li);
  });

  wrapper.appendChild(ul);
  return wrapper;
}

export default function decorate(block) {
  const contentData = extractRankListContent(block);
  const cardDOM = createRankListCard(contentData);

  block.textContent = '';
  block.appendChild(cardDOM);
}
