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
      let title = '';
      let subtitle = '';

      if (firstP) {
        figureText = firstP.textContent.trim();
        // const remainingNodes = Array.from(innerDiv.childNodes).filter((node) => node !== firstP);
        // title = remainingNodes.map((node) => node.outerHTML || node.textContent).join('').trim();

        const secondP = innerDiv.querySelectorAll('p')[1];
        if (secondP) {
          title = secondP.textContent.trim();
        }
        const thirdP = innerDiv.querySelectorAll('p')[2];
        if (thirdP) {
          subtitle = thirdP.textContent.trim();
        }
      }
      const isEmpty = !figureText && !title;

      items.push({
        figureText,
        title,
        subtitle,
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

function createRankListDOM(contentData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'row full-rankings';

  const { headingText, descriptionText, items = [] } = contentData;

  if (headingText) {
    const heading = document.createElement('h3');
    heading.textContent = headingText;
    wrapper.appendChild(heading);
  }

  if (descriptionText) {
    wrapper.insertAdjacentHTML('beforeend', descriptionText);
  }

  items.forEach(({
    figureText,
    title,
    subtitle,
    isEmpty,
    source,
  }) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-12 col-md-6 col-lg-6 ranking';
    if (isEmpty) {
      col.classList.add('empty-rank-item');
      col.textContent = 'Click to configure Rank List Item';
    } else {
      const spanValue = document.createElement('span');
      spanValue.className = 'value';
      spanValue.textContent = figureText;

      const pr = document.createElement('p');
      pr.innerHTML = `${title} <span class="source">${subtitle}</span>`;

      col.appendChild(spanValue);
      col.appendChild(pr);
    }

    moveInstrumentation(source, col);
    wrapper.appendChild(col);
  });

  return wrapper;
}

export default function decorate(block) {
  const contentData = extractRankListContent(block);
  const rankListDOM = createRankListDOM(contentData);

  block.textContent = '';
  block.appendChild(rankListDOM);
}
