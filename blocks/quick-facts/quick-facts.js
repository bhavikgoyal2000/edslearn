import { moveInstrumentation } from '../../scripts/scripts.js';

function fetchQuickFactsContent(block) {
  const children = [...block.children].slice(1);
  if (children.length < 2) return null;

  const titleDiv = children[0];
  const title = titleDiv.querySelector('p')?.textContent.trim() || '';

  const items = [];

  // Loop through items starting from index 1
  for (let i = 1; i < children.length; i += 1) {
    const itemDiv = children[i];
    const innerDivs = itemDiv.querySelectorAll(':scope > div');

    const prefix = innerDivs[0]?.querySelector('p')?.textContent.trim() || '';
    const figureText = innerDivs[1]?.querySelector('p')?.textContent.trim() || '';
    const descriptionText = innerDivs[1]?.querySelectorAll('p')[1]?.textContent.trim() || '';
    const postfix = innerDivs[2]?.querySelector('p')?.textContent.trim() || '';

    const isEmpty = !prefix && !figureText && !descriptionText && !postfix;

    items.push({
      prefix,
      figureText,
      descriptionText,
      postfix,
      source: itemDiv,
      isEmpty,
    });
  }

  return {
    title,
    items,
  };
}

function createQuickFactsDOM(data) {
  const wrapper = document.createElement('div');
  wrapper.className = 'quick-facts-container';

  // Title
  if (data.title) {
    const h2 = document.createElement('h2');
    h2.className = 'facts-title';
    h2.textContent = data.title;
    wrapper.appendChild(h2);
  }

  // Item container
  const itemContainer = document.createElement('div');
  itemContainer.className = 'facts-item-container';
  const ul = document.createElement('ul');
  ul.className = 'facts-item';

  data.items.forEach(({
    prefix,
    figureText,
    descriptionText,
    postfix,
    isEmpty,
    source,
  }) => {
    const li = document.createElement('li');
    const factItemContainer = document.createElement('div');
    factItemContainer.className = 'fact-item-container';

    if (isEmpty) {
      li.classList.add('empty-fact-item');
      li.textContent = 'Click to configure Quick Fact Item';
    } else {
      // Figure Text Container
      const figureDiv = document.createElement('div');
      figureDiv.className = 'figure-text';

      const prefixSpan = document.createElement('span');
      prefixSpan.className = 'prefix-text';
      prefixSpan.textContent = prefix;

      const postfixSpan = document.createElement('span');
      postfixSpan.className = 'postfix-text';
      postfixSpan.textContent = postfix;

      figureDiv.appendChild(prefixSpan);
      figureDiv.appendChild(document.createTextNode(figureText));
      figureDiv.appendChild(postfixSpan);

      // Description Text
      const descDiv = document.createElement('div');
      descDiv.className = 'desc-text';
      descDiv.textContent = descriptionText;

      factItemContainer.appendChild(figureDiv);
      factItemContainer.appendChild(descDiv);
    }

    li.appendChild(factItemContainer);
    moveInstrumentation(source, li); // maintain instrumentation
    ul.appendChild(li);
  });

  itemContainer.appendChild(ul);
  wrapper.appendChild(itemContainer);

  return wrapper;
}

export default function decorate(block) {
  const contentData = fetchQuickFactsContent(block);
  const dom = createQuickFactsDOM(contentData);

  block.textContent = '';
  block.appendChild(dom);
}
