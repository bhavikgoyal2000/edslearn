import { createOptimizedPicture } from '../../scripts/aem.js';
import { GRAPHQL_ENDPOINT } from '../../scripts/constants.js';
import { fetchComponentData } from '../../scripts/graphql-api.js';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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

function getElementsBetweenPlaceholders(section, startClass, endClass) {
  const children = Array.from(section.children);

  let startIdx = startClass
    ? children.findIndex((el) => el.classList.contains(startClass))
    : -1;

  let endIdx = endClass
    ? children.findIndex((el) => el.classList.contains(endClass))
    : -1;

  // Normalize invalid indices
  if (startIdx === -1 && endIdx === -1) return [];

  if (startIdx === -1) startIdx = -1;
  if (endIdx === -1) endIdx = children.length;

  // Slice between start and end (excluding both markers)
  const between = children.slice(startIdx + 1, endIdx);

  // Filter out any unexpected placeholder wrappers accidentally included
  return between.filter((el) => {
    const { classList } = el;
    return !(
      classList.contains('news-placeholder-1-wrapper')
      || classList.contains('news-placeholder-2-wrapper')
      || classList.contains('news-placeholder-3-wrapper')
      || classList.contains('news-article-wrapper')
    );
  });
}

function createNewsArticleBlock(cfData) {
  const data = cfData.newsArticleModelByPath.item;
  const { _path: imagePath = '' } = data.newsImage || {};
  const imgPath = imagePath;
  const imgAlt = data.altAsCaption || 'News image';
  const image = getOptimizedImageUrl(imgPath, imgAlt);

  const figure = document.createElement('div');
  figure.className = 'pull-right half-width';

  const metaWidth = document.createElement('meta');
  metaWidth.setAttribute('itemprop', 'width');
  metaWidth.content = '600';

  const metaHeight = document.createElement('meta');
  metaHeight.setAttribute('itemprop', 'height');
  metaHeight.content = '315';

  figure.append(image, metaWidth, metaHeight);
  const imageHTML = figure.outerHTML;
  const fragment = document.createRange().createContextualFragment(`
    <div id="page-main-container">
    <div class="row">
        <article class="news-success-story clearfix" data-new-title=${data.news_title} | American University, Washington, D.C.">
            <div class="clearfix">
                <div>
                    <div class="topic">${data.topic}</div>
                    <h1>${data.news_title}</h1>
                    ${data.teaser ? `<div class="teaser">${data.teaser}</div>` : ''}
                </div>
                <div class="byline">
                    <p class="author">${data.author ? `By <span>${data.author}</span>&nbsp;<span class="grey">|</span>&nbsp;` : ''}
              <span>${formatDate(data.publicationDate || '')}</span></p>
                </div>
            </div>
            <div class="article-copy">
                <div class="image-holder news-success-story ${data.useImage === false ? 'hide' : ''}">
                    ${imageHTML}
                </div>
                <section id="section-1" class="news-section-1">
                    ${data.description?.html || ''}
                </section>
                <section id="section-2" class="news-section-2">
                    ${data.contentArea2?.html || ''}
                </section>
                <section id="section-3" class="news-section-3">
                    ${data.contentArea3?.html || ''}
                </section>
                <section id="section-4" class="news-section-4">
                    ${data.contentArea4?.html || ''}
                </section>
            </div>
        </article>
    </div>
</div>
  `);
  return fragment;
}

function insertOtherBlocksDynamically(sectionEle, fragment) {
  if (sectionEle && !window.top.location.href.includes('universal-editor')) {
    const between1and2 = getElementsBetweenPlaceholders(sectionEle, 'news-placeholder-1-wrapper', 'news-placeholder-2-wrapper');
    const between2and3 = getElementsBetweenPlaceholders(sectionEle, 'news-placeholder-2-wrapper', 'news-placeholder-3-wrapper');
    const between3and4 = getElementsBetweenPlaceholders(sectionEle, 'news-placeholder-3-wrapper', null); // everything after 3

    const wrapper = fragment.querySelector('.article-copy');

    try {
      const section1 = wrapper.querySelector('.news-section-1');
      const section2 = wrapper.querySelector('.news-section-2');
      const section3 = wrapper.querySelector('.news-section-3');

      if (section1 && between1and2.length) {
        between1and2.slice().reverse().forEach((el) => section1.after(el));
      }

      if (section2 && between2and3.length) {
        between2and3.slice().reverse().forEach((el) => section2.after(el));
      }

      if (section3 && between3and4.length) {
        between3and4.slice().reverse().forEach((el) => section3.after(el));
      }
    } catch (err) {
      throw new Error(`Error inserting blocks dynamically: ${err.message}`);
    }
  }

  return fragment;
}

export default function decorate(block) {
  const allDivs = Array.from(block.children);
  const blocksToProcess = allDivs.slice(1)[0];
  const contentFragmentPath = blocksToProcess?.querySelector('p')?.textContent.trim() || '';

  if (!contentFragmentPath) {
    block.textContent = 'No content fragment path provided.';
    return;
  }

  fetchComponentData('News-Element-GraphQL-Query', contentFragmentPath)
    .then((cfData) => {
      if (!cfData) {
        throw new Error('No data returned from GraphQL');
      }
      const wrapper = createNewsArticleBlock(cfData);
      const sectionEle = block.closest('.section');
      block.textContent = '';
      block.appendChild(insertOtherBlocksDynamically(sectionEle, wrapper));
    })
    .catch(() => {
      block.textContent = 'Failed to load news content.';
    });
}
