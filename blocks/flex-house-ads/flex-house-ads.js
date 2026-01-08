import { moveInstrumentation } from '../../scripts/scripts.js';
import { addFlexParentClasses } from '../../scripts/util.js';
import createDataLayerEvent from '../../scripts/analytics-util.js';

/**
 * Extracts the image and button content from authored block structure.
 */
function extractHouseAdContent(wrapper) {
  const picture = wrapper.querySelector('picture');
  const anchor = wrapper.querySelector('a[href]');

  if (!picture || !anchor) return null;

  return {
    picture,
    href: anchor.getAttribute('href'),
  };
}

/**
 * Creates the house ad DOM using target structure.
 */
function createHouseAdCard(cardWrapper) {
  const content = extractHouseAdContent(cardWrapper);

  const article = document.createElement('article');
  article.className = 'el-flex-item flex-left';

  const innerDiv = document.createElement('div');
  innerDiv.className = 'flex-house';

  const bgUrl = `${window.hlx.codeBasePath}/blocks/flex-house-ads/background-img.png`;
  innerDiv.style.background = `#ebebec url('${bgUrl}') repeat`;

  if (!content) {
    article.classList.add('empty-card');
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-card-placeholder';
    placeholder.textContent = 'Click to configure House Ad Card';
    article.appendChild(placeholder);
    moveInstrumentation(cardWrapper, article);
    return article;
  }

  const link = document.createElement('a');
  link.href = content.href;

  // Append a clone of the picture to avoid moving original nodes
  link.appendChild(content.picture.cloneNode(true));
  innerDiv.appendChild(link);
  article.appendChild(innerDiv);

  moveInstrumentation(cardWrapper, article);
  return article;
}

/**
 * Main decorator entry point.
 */
export default function decorate(block) {
  const allCards = [...block.children];
  if (allCards.length === 0) return;

  const wrapper = document.createElement('section');
  wrapper.classList.add('house-ads-wrapper');
  wrapper.classList.add('el-flex-grid');
  const cardsToProcess = allCards.slice(1);
  addFlexParentClasses(block, cardsToProcess.length);

  cardsToProcess.forEach((cardWrapper) => {
    const card = createHouseAdCard(cardWrapper);
    wrapper.appendChild(card);
  });

  block.textContent = '';
  block.appendChild(wrapper);

  const adLinks = wrapper.querySelectorAll('a[href]');
  adLinks.forEach((link) => {
    createDataLayerEvent('click', 'Housead:click', () => ({
      linkName: link.textContent.trim(),
      linkURL: link.href,
      linkType: 'cta',
      linkRegion: 'main',
      componentName: 'Flex House Ad',
      componentId: 'flex-house-ad',
    }), link);
  });
}
