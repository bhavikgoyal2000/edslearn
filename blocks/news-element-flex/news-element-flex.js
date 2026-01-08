import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchComponentData } from '../../scripts/graphql-api.js';
import { GRAPHQL_ENDPOINT } from '../../scripts/constants.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { addFlexParentClasses } from '../../scripts/util.js';

function getOptimizedImageUrl(damPath, imageAltText) {
  if (!damPath || typeof damPath !== 'string') return document.createTextNode('');
  const domain = new URL(GRAPHQL_ENDPOINT).origin;

  const optimizedPic = createOptimizedPicture(damPath, imageAltText, false, [{ width: '750' }]);

  optimizedPic.querySelectorAll('source').forEach((srcEl) => {
    const newPath = new URL(srcEl.srcset, domain);
    srcEl.srcset = newPath.href;
  });

  const imgEl = optimizedPic.querySelector('img');
  if (imgEl) {
    const newPath = new URL(imgEl.src, domain);
    imgEl.src = newPath.href;
  }

  return optimizedPic;
}

function createFlexCard(entry, sourceEl) {
  const article = document.createElement('article');
  article.className = 'el-flex-item flex-left';

  moveInstrumentation(sourceEl, article);

  // Image block
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'news-photo';
  const { _path: imgPath = '' } = entry.newsImage || {};
  const altText = entry.altAsCaption || '';
  const optimizedImg = getOptimizedImageUrl(imgPath, altText);
  imgWrapper.appendChild(optimizedImg);
  article.appendChild(imgWrapper);

  // Footer meta
  const footer = document.createElement('div');
  footer.className = 'text-body-base';
  const meta = document.createElement('p');

  if (entry.topic) {
    const topicSpan = document.createElement('span');
    topicSpan.className = 'topic';
    topicSpan.textContent = entry.topic;
    meta.appendChild(topicSpan);
  }

  if (entry.publicationDate) {
    const sep = document.createTextNode(' · ');
    meta.appendChild(sep);
    const time = document.createElement('time');
    time.className = 'pub-date';
    time.dateTime = entry.publicationDate;
    const dateObj = new Date(entry.publicationDate);
    time.textContent = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    meta.appendChild(time);
  }

  footer.appendChild(meta);
  article.appendChild(footer);

  // Header title
  const header = document.createElement('div');
  header.className = 'text-body';
  const title = document.createElement('h1');
  title.textContent = entry.title || '';
  header.appendChild(title);
  article.appendChild(header);

  // CTA link
  const ctaP = document.createElement('p');
  ctaP.className = 'cta-paragraph';
  const link = document.createElement('a');
  const { _path: entryPath = '#' } = entry;
  link.href = entryPath;
  link.className = 'btn btn-news';
  link.textContent = 'Read More';
  link.title = `Read more about ${entry.title}`;
  link.setAttribute('aria-label', `Read more about ${entry.title}`);
  ctaP.appendChild(link);
  article.appendChild(ctaP);

  return article;
}

async function processRow(index, row, cfPath, cardElements) {
  if (!cfPath) {
    const placeholder = document.createElement('article');
    placeholder.className = 'el-flex-item ... empty-card';
    moveInstrumentation(row, placeholder);
    placeholder.innerHTML = '<div class="empty-card-placeholder">Click to configure News Item</div>';
    cardElements[index] = placeholder;
    return; // exits early
  }

  if (cfPath.startsWith('/')) {
    try {
      const cfData = await fetchComponentData('News-Element-GraphQL-Query', cfPath);
      const entry = cfData.newsArticleModelByPath?.item;
      if (!entry) throw new Error('Missing entry in response');
      const card = createFlexCard(entry, row);
      cardElements[index] = card;
    } catch {
      const fallback = document.createElement('article');
      fallback.className = 'el-flex-item ... cards-card-error';
      fallback.textContent = `Error loading card for ${cfPath}`;
      cardElements[index] = fallback;
    }
    return; // prevent falling through
  }

  // Only if cfPath exists but is not valid
  const fallback = document.createElement('article');
  fallback.className = 'el-flex-item ... cards-card-error';
  moveInstrumentation(row, fallback);
  fallback.innerHTML = '<div class="empty-card-placeholder">Invalid content path</div>';
  cardElements[index] = fallback;
}

export default function decorate(block) {
  const section = document.createElement('section');
  section.className = 'el-flex-grid';

  const rows = [...block.children].slice(1); // skip first div
  if (rows.length === 0) {
    block.innerHTML = '<p>No content fragment references found.</p>';
    return;
  }

  const titleRow = rows[0];
  const titleText = titleRow.querySelector('p')?.textContent?.trim();

  if (titleText) {
    const header = document.createElement('div');
    header.className = 'flex-title';
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    header.appendChild(h1);
    section.appendChild(header);
  }

  const cardElements = new Array(rows.length - 2);
  addFlexParentClasses(block, cardElements.length);
  const promises = [];

  for (let i = 2; i < rows.length; i += 1) {
    const row = rows[i];
    const p = row.querySelector('p') || row.querySelector('div p');
    const cfPath = p?.textContent?.trim();
    const index = i - 1;
    promises.push(processRow(index, row, cfPath, cardElements)); // async-safe
  }

  Promise.all(promises).then(() => {
    block.textContent = '';
    cardElements.forEach((el) => section.appendChild(el));
    block.appendChild(section);
  });
}
