import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchComponentData } from '../../scripts/graphql-api.js';
import { GRAPHQL_ENDPOINT } from '../../scripts/constants.js';

function getOptimizedImageUrl(damPath, imageAltText) {
  if (!damPath || typeof damPath !== 'string') return document.createTextNode('');
  const domain = new URL(GRAPHQL_ENDPOINT).origin;

  const optimizedPic = createOptimizedPicture(damPath, imageAltText, false, [{ width: '750' }]);

  optimizedPic.querySelectorAll('source').forEach((srcEl) => {
    if (srcEl.srcset.startsWith('/')) {
      srcEl.srcset = domain + srcEl.srcset;
    } else {
      const newPath = new URL(srcEl.srcset);
      srcEl.srcset = domain + newPath.pathname;
    }
  });

  const imgEl = optimizedPic.querySelector('img');
  if (imgEl) {
    if (imgEl.src.startsWith('/')) {
      imgEl.src = domain + imgEl.src;
    } else {
      const newPath = new URL(imgEl.src);
      imgEl.src = domain + newPath.pathname;
    }
  }

  return optimizedPic;
}

function createSingleStory(cfData) {
  const entry = cfData.newsArticleModelByPath.item;

  const container = document.createElement('div');

  const section = document.createElement('section');
  section.classList.add('single-story');

  const article = document.createElement('article');

  const imgCol = document.createElement('div');
  imgCol.classList.add('image-wrapper');
  const { _path: imagePath = '' } = entry.newsImage || {};
  const imgPath = imagePath;
  const imgAlt = entry.altAsCaption || 'News image';
  const img = getOptimizedImageUrl(imgPath, imgAlt);
  imgCol.appendChild(img);
  article.appendChild(imgCol);

  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('content-wrapper');
  // HEADER
  const textCol = document.createElement('div');
  textCol.classList.add('heading-text-wrapper');

  const topic = document.createElement('p');
  topic.classList.add('topic');
  topic.textContent = entry.topic || '';

  const title = document.createElement('h1');
  title.textContent = entry.title || '';

  textCol.appendChild(topic);
  textCol.appendChild(title);

  contentWrapper.appendChild(textCol);

  // CONTENT SECTION
  const contentCol = document.createElement('div');
  contentCol.classList.add('text-wrapper');

  const lede = document.createElement('p');
  lede.classList.add('lede');
  lede.textContent = entry.teaser || '';

  const linkPara = document.createElement('p');
  const link = document.createElement('a');
  const { _path: entryPath = '#' } = entry;
  link.href = entryPath;
  link.classList.add('btn', 'btn-news');
  link.textContent = 'Full Story';
  linkPara.appendChild(link);

  contentCol.appendChild(lede);
  contentCol.appendChild(linkPara);

  // Assemble
  contentWrapper.appendChild(contentCol);
  article.appendChild(contentWrapper);
  section.appendChild(article);
  container.appendChild(section);

  return container;
}

export default function decorate(block) {
  const allDivs = Array.from(block.children);

  const blocksToProcess = allDivs.slice(1)[0];
  const contentFragmentPath = blocksToProcess?.querySelector('p')?.textContent.trim() || '';

  if (!contentFragmentPath) {
    blocksToProcess.textContent = 'No content fragment path provided.';
    return;
  }

  fetchComponentData('News-Element-GraphQL-Query', contentFragmentPath)
    .then((cfData) => {
      if (!cfData) {
        throw new Error('No data returned from GraphQL');
      }

      const wrapper = createSingleStory(cfData);
      blocksToProcess.textContent = '';
      blocksToProcess.appendChild(wrapper);
    })
    .catch(() => {
      block.textContent = 'Failed to load news content.';
    });
}
