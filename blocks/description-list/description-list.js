import { moveInstrumentation } from '../../scripts/scripts.js';

function extractDeadlines(container) {
  const deadlines = [];

  // Each direct child <div> is one term/definition pair
  container.querySelectorAll(':scope > div').forEach((item) => {
    const termDiv = item.querySelector(':scope > div:first-child');
    const defDiv = item.querySelector(':scope > div:last-child');
    let term = '';
    if (termDiv) {
      term = Array.from(termDiv.querySelectorAll('p'))
        .map((p) => p.innerHTML.trim()) // use innerHTML to preserve <strong>, <a>, etc.
        .join('<br>');
    }
    // Collect all <p> inside the definition part
    let definition = '';
    if (defDiv) {
      definition = Array.from(defDiv.querySelectorAll('p'))
        .map((p) => p.innerHTML.trim()) // use innerHTML to preserve <strong>, <a>, etc.
        .join('<br>');
    }

    deadlines.push({ term, definition });
  });

  return deadlines;
}

export default function decorate(block) {
  // console.log(block.children);
  // const deadlines = block.children;
  const wrapper = document.createElement('div');
  wrapper.classList.add('tabular', 'compact', 'extra');

  const deadlines = extractDeadlines(block);
  const allItems = [...block.children];
  deadlines.forEach((item, index) => {
    const row = document.createElement('div');
    const term = document.createElement('div');
    term.classList.add('term');
    term.innerHTML = item.term;
    const def = document.createElement('div');
    def.classList.add('definition');
    def.innerHTML = item.definition;
    row.appendChild(term);
    row.appendChild(def);
    const descriptionListItem = allItems[index];
    moveInstrumentation(descriptionListItem, row);
    wrapper.appendChild(row);
  });

  block.textContent = '';
  block.appendChild(wrapper);
}
