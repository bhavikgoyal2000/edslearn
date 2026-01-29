import { moveInstrumentation } from '../../scripts/scripts.js';
import { buildTitleWithTitleTypes } from '../../scripts/util.js';

// This method is to extract fields from collapsible blocks
function extractCollapsibleBlocksFields(collapseBlock) {
  const paragraphs = Array.from(collapseBlock.querySelectorAll('p'));
  const extractDisplayStyle = paragraphs[0]?.textContent.trim() || 'none';
  let extractTitleElement = '';
  let extractTitleTypeTagEle = '';

  if (paragraphs[1] && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(paragraphs[1].textContent.trim().toLowerCase())) {
    extractTitleTypeTagEle = paragraphs[1] ? paragraphs[1] : '';
  } else {
    extractTitleElement = paragraphs[1] ? paragraphs[1] : '';
    extractTitleTypeTagEle = paragraphs[2] ? paragraphs[2] : '';
  }
  const fetchDivs = collapseBlock.querySelectorAll('div');
  return {
    text: fetchDivs[1]?.innerHTML.trim() || '',
    displayStyle: extractDisplayStyle,
    titleElement: extractTitleElement,
    titleTypeTagEle: extractTitleTypeTagEle,
  };
}

// This method toggles the collapse state of the collapsible section.
function toggleCollapse(element) {
  const collapsibleSection = element.closest('section');
  const content = collapsibleSection.querySelector('.collapse');

  const isCollapsed = element.classList.contains('collapsed');

  if (isCollapsed) {
    element.classList.remove('collapsed');
    element.classList.add('collapse-toggle');

    content.classList.add('in');
    content.classList.add('collapse');
  } else {
    element.classList.add('collapsed');
    element.classList.remove('collapse-toggle');

    content.classList.remove('in');
  }
}

function generateCollapseId() {
  const randomDigits = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  return `#collapse-${randomDigits}`;
}

export default function decorate(block) {
  const collapsibleBlocks = Array.from(block.children);
  const blocksToProcess = collapsibleBlocks.slice(1);
  const collapseBlockArray = blocksToProcess.map(
    (collapseBlock) => extractCollapsibleBlocksFields(collapseBlock),
  );

  block.textContent = '';
  const collapseBlockParent = document.createElement('div');
  collapseBlockArray.forEach((collapseBlockData, i) => {
    const collapseId = generateCollapseId();
    const collapseLink = document.createElement('a');
    collapseLink.href = collapseId;
    collapseLink.tabIndex = -1;
    collapseLink.classList.add('collapse-link');

    const collapseBlockdiv = document.createElement('div');
    collapseBlockdiv.classList.add('collapsible-block');

    moveInstrumentation(blocksToProcess[i], collapseBlockdiv);

    const section = document.createElement('section');
    section.classList.add('collapsible', 'clearfix', 'collapse-metro-silver', 'narrow-margin');

    const header = document.createElement('div');
    header.classList.add('collapsible-header', collapseBlockData.displayStyle);
    header.tabIndex = 0;
    header.append(collapseLink);
    const gradientDiv = document.createElement('div');
    if (collapseBlockData.displayStyle === 'bg-default-ombre-color') {
      gradientDiv.classList.add('ombre-collapse-wrap');
      header.classList.add('ombre-default');
    }

    const collapseDiv = document.createElement('div');
    collapseDiv.classList.add('collapsed');
    collapseDiv.setAttribute('role', 'button');
    collapseDiv.addEventListener('click', function collapseDivClickHandler() {
      toggleCollapse(this);
    });

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        toggleCollapse(collapseDiv);
      }
    });

    const collapseTitleElement = collapseBlockData.titleElement && collapseBlockData.titleTypeTagEle
      ? buildTitleWithTitleTypes(collapseBlockData.titleTypeTagEle, collapseBlockData.titleElement)
      : '';

    collapseDiv.append(collapseTitleElement);
    header.append(collapseDiv);

    if (collapseBlockData.displayStyle === 'bg-default-ombre-color') {
      section.append(gradientDiv);
      section.append(header);
    } else {
      section.append(header);
    }

    const textDiv = document.createElement('div');
    textDiv.classList.add('collapse');
    textDiv.id = collapseId.substring(1);
    const textParaElement = document.createElement('p');
    textParaElement.innerHTML = collapseBlockData.text;
    textDiv.append(textParaElement);
    section.append(textDiv);
    collapseBlockdiv.append(section);
    collapseBlockParent.append(collapseBlockdiv);
  });

  block.append(collapseBlockParent);
}
