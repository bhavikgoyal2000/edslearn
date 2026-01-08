import { createOptimizedPicture } from '../../scripts/aem.js';
import { GRAPHQL_ENDPOINT } from '../../scripts/constants.js';
import { fetchComponentData } from '../../scripts/graphql-api.js';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

function getOptimizedImageUrl(damPath, imageAltText) {
  if (!damPath || typeof damPath !== 'string') return document.createTextNode('');
  const domain = new URL(GRAPHQL_ENDPOINT).origin;

  const optimizedPic = createOptimizedPicture(damPath, imageAltText, false, [{ width: '750' }]);

  optimizedPic.querySelectorAll('source').forEach((srcEl) => {
    const newPath = new URL(srcEl.srcset, domain);
    srcEl.srcset = domain + newPath.pathname;
  });

  const imgEl = optimizedPic.querySelector('img');
  if (imgEl) {
    const newPath = new URL(imgEl.src, domain);
    imgEl.src = domain + newPath.pathname;
  }

  return optimizedPic;
}

function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  Object.entries(options).forEach(([key, value]) => {
    if (key === 'dataset') {
      Object.entries(value).forEach(([dKey, dValue]) => {
        el.dataset[dKey] = dValue;
      });
    } else if (key in el) {
      el[key] = value;
    } else {
      el.setAttribute(key, value);
    }
  });

  return el;
}

function createChannelIssue(data) {
  const p = createElement('p', {
    className: 'channel-issue',
    id: 'this-article-channel',
  });

  const channel = createElement('span', { className: 'channel' });
  const link = createElement('a', {
    /* eslint-disable no-underscore-dangle */
    href: data.topicLink?._path ?? '#',
    textContent: data.topic ?? '',
  });

  channel.appendChild(link);

  const time = createElement('time', {
    className: 'issue',
    textContent: formatDate(data.publicationDate),
  });
  time.setAttribute('datetime', `${data.publicationDate} 00:00:00`);

  p.append(channel, ' ', time);
  return p;
}

function createImage(data) {
  const figure = createElement('figure', {
    className: 'pull-left',
    itemprop: 'image',
  });

  const image = getOptimizedImageUrl(
    /* eslint-disable no-underscore-dangle */
    data.newsImage._path,
    data.altAsCaption,
  );

  figure.appendChild(image);
  return figure;
}

function appendCredit(container, label, value) {
  if (!value) {
    return;
  }

  const p = createElement('p', {
    className: 'credit author',
    textContent: `${label} ${value}`,
  });

  container.appendChild(p);
}

function getContentSections(data) {
  return [
    { id: 'section-1', cls: 'magazine-section-1', html: data.description?.html },
    { id: 'section-2', cls: 'magazine-section-2', html: data.contentArea2?.html },
    { id: 'section-3', cls: 'magazine-section-3', html: data.contentArea3?.html },
    { id: 'section-4', cls: 'magazine-section-4', html: data.contentArea4?.html },
  ]
    .filter((section) => Boolean(section.html))
    .map((section) => {
      const div = createElement('div', {
        id: section.id,
        className: section.cls,
      });
      div.innerHTML = section.html;
      return div;
    });
}

function createMainContent(data) {
  const col = createElement('div', {
    className: 'col-md-11 article-content',
  });

  // const col8 = createElement('div', { className: 'col-md-8' });
  const col8 = document.createElement('div');
  const section = createElement('section', {
    className: 'section-main',
  });

  /* eslint-disable no-underscore-dangle */
  if (data.newsImage?._path && data.useImage !== false) {
    section.appendChild(createImage(data));
  }

  getContentSections(data).forEach(section.appendChild.bind(section));

  col8.appendChild(section);
  col.appendChild(col8);

  return col;
}

function createCredits(data) {
  const col = createElement('div', {
    className: 'col-md-1 article-footer',
  });

  appendCredit(col, 'By', data.author);
  appendCredit(col, 'Photography by', data.photographyBy);
  appendCredit(col, 'Illustration by', data.illustrationBy);

  return col;
}

function createBody(data) {
  const row = createElement('div', { className: 'row row-center' });

  row.appendChild(createCredits(data));
  row.appendChild(createMainContent(data));

  return row;
}

function createHeader(data) {
  const row = createElement('div', { className: 'row-center' });
  const col = createElement('div', {
    className: 'col-12 col-md-9 article-header',
  });

  if (data.publicationDate) {
    col.appendChild(createChannelIssue(data));
  }

  if (data.news_title) {
    col.appendChild(
      createElement('h1', {
        itemprop: 'headline',
        textContent: data.news_title,
      }),
    );
  }

  if (data.teaser && data.showTeaser !== false) {
    const teaser = createElement('p', {
      className: 'teaser',
      itemprop: 'description',
    });
    teaser.innerHTML = data.teaser;
    col.appendChild(teaser);
  }

  row.appendChild(col);
  return row;
}

function createMagazineArticle(cfData) {
  const data = cfData?.magazineArticleModelByPath?.item;
  if (!data) {
    return null;
  }

  const article = createElement('article', {
    className: `article-page article-${data.topic ?? ''}`,
    dataset: { element: 'Magazine Article' },
  });

  article.appendChild(createHeader(data));
  article.appendChild(createBody(data));

  return article;
}

export default function decorate(block) {
  const allDivs = Array.from(block.children);
  block.textContent = '';

  const blocksToProcess = allDivs.slice(1)[0];
  const contentFragmentPath = blocksToProcess?.querySelector('p')?.textContent.trim() || '';

  if (!contentFragmentPath) {
    block.textContent = 'No content fragment path provided.';
    return;
  }

  fetchComponentData('getMagazineArticle', contentFragmentPath)
    .then((cfData) => {
      if (!cfData) {
        throw new Error('No data returned from GraphQL');
      }
      const wrapper = createMagazineArticle(cfData);
      block.appendChild(wrapper);
    })
    .catch(() => {
      block.textContent = 'Failed to load Magazine Article.';
    });
}
