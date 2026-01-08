import createDataLayerEvent from '../../scripts/analytics-util.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { addFlexParentClasses } from '../../scripts/util.js';

/**
 * Extracts header and bullet content from authored block structure.
 */
function extractCardContent(wrapper) {
  const contentDivs = [...wrapper.children];
  if (contentDivs.length === 0) return null;

  const headerGroup = contentDivs[0];
  if (!headerGroup) return null;

  const headerParagraph = [...headerGroup.children].find((el) => el.tagName === 'P');
  if (!headerParagraph) return null;

  const headerIndex = [...headerGroup.children].indexOf(headerParagraph);
  const bullet1Content = [...headerGroup.children].slice(headerIndex + 1);

  const bullets = [];
  if (bullet1Content.length > 0) bullets.push(bullet1Content);
  if (contentDivs[1]) {
    const bullet2 = [...contentDivs[1].children];
    if (bullet2.length > 0) bullets.push(bullet2);
  }
  if (contentDivs[2]) {
    const bullet3 = [...contentDivs[2].children];
    if (bullet3.length > 0) bullets.push(bullet3);
  }

  return {
    header: headerParagraph,
    bullets,
  };
}

/**
 * Builds a single card DOM node from the authored wrapper.
 * Applies fallback if content is missing.
 */
function createThreeBulletCard(cardWrapper) {
  const cardContainer = document.createElement('div');
  cardContainer.classList.add('three-bullet-card');
  cardContainer.classList.add('el-flex-item');

  const contentData = extractCardContent(cardWrapper);

  // Fallback if missing or incomplete content
  if (!contentData || !contentData.header || contentData.bullets.length === 0) {
    cardContainer.classList.add('empty-card');
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-card-placeholder';
    placeholder.textContent = 'Click to configure Three-Bullet Card';
    cardContainer.appendChild(placeholder);

    moveInstrumentation(cardWrapper, cardContainer);
    return cardContainer;
  }

  // Header
  const header = document.createElement('h1');
  [...contentData.header.childNodes].forEach((node) => header.appendChild(node));
  cardContainer.appendChild(header);

  // Bullets
  const bulletCount = contentData.bullets.length;
  if (bulletCount >= 2) {
    const ul = document.createElement('ul');
    ul.classList.add('compact');

    contentData.bullets.forEach((group) => {
      const li = document.createElement('li');
      group.forEach((el) => li.appendChild(el));
      ul.appendChild(li);
    });

    cardContainer.appendChild(ul);
  } else if (bulletCount === 1) {
    contentData.bullets[0].forEach((el) => cardContainer.appendChild(el));
  }

  // Move instrumentation after full DOM is ready
  moveInstrumentation(cardWrapper, cardContainer);

  return cardContainer;
}

/**
 * Main decorator entry point.
 */
export default function decorate(block) {
  const allCards = [...block.children];
  if (allCards.length === 0) return;

  const wrapper = document.createElement('section');
  wrapper.classList.add('three-bullet-wrapper');
  wrapper.classList.add('el-flex-grid');
  const cardsToProcess = allCards.slice(1);
  addFlexParentClasses(block, cardsToProcess.length);

  cardsToProcess.forEach((cardWrapper) => {
    const cardDOM = createThreeBulletCard(cardWrapper);
    wrapper.appendChild(cardDOM);
  });

  // Clear after instrumentation is moved
  block.textContent = '';
  block.appendChild(wrapper);

  // Add data-layer to use for analytics
  // Find all links inside the bullets block
  const bulletLinks = wrapper.querySelectorAll('a');
  bulletLinks.forEach((link) => {
    createDataLayerEvent('click', 'click', () => ({
      linkName: link.textContent.trim(),
      linkURL: link.href,
      linkType: 'cta',
      linkRegion: 'main',
      componentName: 'Flex 3 Bullets',
      componentId: 'flex-3-bullets',
    }), link);
  });
}
