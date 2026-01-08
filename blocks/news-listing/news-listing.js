import { createOptimizedPicture } from '../../scripts/aem.js';
import { SERVER_URL } from '../../scripts/constants.js';

function getOptimizedImageUrl(damPath, imageAltText) {
  if (!damPath || typeof damPath !== 'string') return document.createTextNode('');
  const domain = new URL(SERVER_URL).origin;

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

/**
 * Creates a JSON object from tags, condition, multifieldData, and resultsPerPage.
 * @param {string} multifieldData
 * @param {number} resultsPerPage
 * @returns {object} JSON object with the provided data
 */
function createNewsListingPayload(multifieldData, resultsPerPage) {
  let parsedData = {};
  try {
    parsedData = JSON.parse(multifieldData);
  } catch (e) {
    parsedData = {};
  }

  const currentPath = window.location.pathname;
  const isMagazinePage = currentPath.startsWith('/magazine') || currentPath.includes('/magazine');
  return {
    rootPath: isMagazinePage ? '/content/dam/au/cf/magazine-article-list' : '/content/dam/au/cf/news',
    'cq:tags': parsedData['cq:tags'] || [],
    condition: parsedData.condition || '',
    fields: parsedData.fields || [],
    sortField: parsedData.sortField || '',
    sortOrder: parsedData.sortOrder || '',
    resultsPerPage,
  };
}

function createPaginationLinks(pageNum, totalCount, resultsPerPage) {
  const totalPages = Math.ceil(totalCount / resultsPerPage);
  const start = (pageNum - 1) * resultsPerPage + 1;
  const end = Math.min(pageNum * resultsPerPage, totalCount);

  // Create nav wrapper
  const nav = document.createElement('nav');
  nav.className = 'pagination-holder row page-numbers';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Results list pagination');

  // Create ul
  const ul = document.createElement('ul');
  ul.className = 'pagination col-md-12';

  // Results label
  const labelLi = document.createElement('li');
  labelLi.className = 'nav-label visible-md-inline visible-lg-inline col-md-6';
  labelLi.innerHTML = `<span>Results ${start} - ${end} of ${totalCount}</span>`;
  ul.appendChild(labelLi);

  // Previous arrow
  const prevLi = document.createElement('li');
  if (pageNum > 1) {
    const a = document.createElement('a');
    a.href = `${window.location.pathname}?page=${pageNum - 1}`;
    a.setAttribute('aria-label', 'Previous Page');
    a.setAttribute('title', 'Previous Page');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = 'Previous';
    const icon = document.createElement('span');
    icon.className = 'ion-chevron-left';
    icon.setAttribute('aria-hidden', 'true');
    a.appendChild(sr);
    a.appendChild(icon);
    prevLi.appendChild(a);
  }
  ul.appendChild(prevLi);

  // Page numbers (show up to 4 pages for demo, can be expanded)
  for (let i = 1; i <= totalPages; i += 1) {
    // Only show first, last, current, and neighbors (for large sets, add ellipsis logic)
    if (
      i === 1
      || i === totalPages
      || (i >= pageNum - 1 && i <= pageNum + 2 && i <= totalPages)
    ) {
      const li = document.createElement('li');
      if (i === pageNum) {
        li.className = 'active';
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = 'You are on page ';
        const pageSpan = document.createElement('span');
        pageSpan.textContent = i;
        li.appendChild(sr);
        li.appendChild(pageSpan);
      } else {
        const a = document.createElement('a');
        // Use different base for first page
        a.href = i === 1
          ? `${window.location.pathname}?page=${i}`
          : `${window.location.pathname}?page=${i}`;
        a.setAttribute('aria-label', `Page ${i}`);
        a.setAttribute('title', `Page ${i}`);
        a.textContent = i;
        li.appendChild(a);
      }
      ul.appendChild(li);
    }
  }

  // Next arrow
  if (pageNum < totalPages) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `${window.location.pathname}?page=${pageNum + 1}`;
    a.setAttribute('aria-label', 'Next Page');
    a.setAttribute('title', 'Next Page');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = 'Next';
    const icon = document.createElement('span');
    icon.className = 'ion-chevron-right';
    icon.setAttribute('aria-hidden', 'true');
    a.appendChild(sr);
    a.appendChild(icon);
    li.appendChild(a);
    ul.appendChild(li);
  }

  nav.appendChild(ul);
  return nav;
}

async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

export default async function decorate(block) {
  const currentPath = window.location.pathname;
  const isMagazineRoot = currentPath.startsWith('/magazine') || currentPath.includes('/magazine');
  if (isMagazineRoot) {
    block.parentElement?.classList.add('magazine');
  }
  const innerDivs = Array.from(block.children);

  const divsToProcess = innerDivs.slice(1);

  const multifieldDataObj = divsToProcess[divsToProcess.length - 2];
  const resultsPerPageObj = divsToProcess[divsToProcess.length - 1];

  multifieldDataObj?.remove();
  resultsPerPageObj?.remove();
  const multifieldData = multifieldDataObj ? multifieldDataObj.querySelector('p')?.innerText : '';
  const resultsPerPageInput = resultsPerPageObj ? resultsPerPageObj.querySelector('p')?.innerText : '';
  let resultsPerPage = parseInt(resultsPerPageInput, 10);
  if (Number.isNaN(resultsPerPage) || resultsPerPage <= 0) resultsPerPage = 10;
  const payLoad = createNewsListingPayload(multifieldData, resultsPerPage);
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  const pageNum = parseInt(page, 10) || 1;

  // Detect if running on author
  const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
  };
  let serverUrl = SERVER_URL;
  // If author, add CSRF token
  if (isAuthor) {
    const csrfToken = await getCsrfToken();
    headers['CSRF-Token'] = csrfToken;
    serverUrl = window.location.origin;
  }

  fetch(`${serverUrl}/bin/news/dynamicFilter?page=${pageNum}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payLoad),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch news data');
      return response.json();
    })
    .then((json) => {
      const {
        results = [],
        pageNumber = 1,
        limit = 10,
        total = 0,
      } = json;
      block.textContent = '';
      if (results.length === 0) {
        const noResultsTag = document.createElement('p');
        noResultsTag.className = 'no-results';
        noResultsTag.textContent = 'No results found';
        block.appendChild(noResultsTag);
        return;
      }
      if (pageNumber === 1 && results[0]) {
        const firstItem = results[0];
        const firstSection = document.createElement('section');
        firstSection.className = 'latest-story single-story row row-center';

        const firstArticle = document.createElement('article');
        const firstImageCol = document.createElement('div');
        firstImageCol.className = 'image-wrapper';
        const firstImg = getOptimizedImageUrl(firstItem.newsImage, firstItem.imageAltText);
        firstImageCol.appendChild(firstImg);

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('content-wrapper');

        const firstTitleCol = document.createElement('div');
        firstTitleCol.className = 'heading-text-wrapper';

        const firstTopic = document.createElement('p');
        firstTopic.className = 'topic';
        const firstTime = document.createElement('time');
        firstTime.className = 'pub-date';
        firstTime.setAttribute('datetime', firstItem.publicationDate);
        const firstDate = new Date(firstItem.publicationDate);
        firstTime.textContent = `${firstDate.toLocaleString('default', { month: 'long', day: 'numeric' })}`;
        firstTopic.textContent = `${firstItem.topic} · `;
        firstTopic.appendChild(firstTime);

        const firstH1 = document.createElement('h1');
        firstH1.textContent = firstItem.title;

        firstTitleCol.appendChild(firstTopic);
        if (firstH1.textContent && firstH1.textContent.trim() !== '') {
          firstTitleCol.appendChild(firstH1);
        }

        firstArticle.appendChild(firstImageCol);
        contentWrapper.appendChild(firstTitleCol);

        const firstContent = document.createElement('div');
        firstContent.className = 'text-wrapper';

        const firstP = document.createElement('p');
        firstP.className = 'lede';
        firstP.innerHTML = `${firstItem.teaser}<br>`;

        const firstA = document.createElement('a');
        firstA.href = `${firstItem.path.replace('/content/dam/au/cf', '')}`;
        firstA.className = 'btn btn-news';
        firstA.textContent = 'Full Story';

        firstP.appendChild(firstA);
        firstContent.appendChild(firstP);
        contentWrapper.appendChild(firstContent);
        firstArticle.appendChild(contentWrapper);
        firstSection.appendChild(firstArticle);

        block.appendChild(firstSection);
      }

      // Create story-listing section for the rest
      const listSection = document.createElement('section');
      listSection.className = 'story-listing row row-center';

      const container = document.createElement('div');
      container.className = 'list-wrapper no-bs-padding-right section-center';
      listSection.appendChild(container);
      // On page 1, skip the first item; on other pages, show all
      const itemsToShow = (pageNumber === 1) ? results.slice(1) : results;
      itemsToShow.forEach((item) => {
        const article = document.createElement('article');
        article.className = 'clearfix';

        const imageCol = document.createElement('div');
        imageCol.className = 'image-wrapper';
        const img = getOptimizedImageUrl(item.newsImage, item.imageAltText);
        imageCol.appendChild(img);

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('content-wrapper');

        const titleCol = document.createElement('div');
        titleCol.className = 'heading-text-wrapper';

        const pTopic = document.createElement('p');
        pTopic.className = 'topic';
        const time = document.createElement('time');
        time.className = 'pub-date';
        time.setAttribute('datetime', item.publicationDate);
        const date = new Date(item.publicationDate);
        time.textContent = date.toLocaleString('default', { month: 'long', day: 'numeric' });
        pTopic.textContent = `${item.topic} · `;
        pTopic.appendChild(time);

        const h1 = document.createElement('h1');
        h1.textContent = item.title;

        titleCol.appendChild(pTopic);
        if (h1.textContent && h1.textContent.trim() !== '') {
          titleCol.appendChild(h1);
        }

        article.appendChild(imageCol);
        contentWrapper.appendChild(titleCol);

        const contentCol = document.createElement('div');
        contentCol.className = 'text-wrapper';
        const p = document.createElement('p');
        p.innerHTML = `${item.teaser}<br>`;

        const a = document.createElement('a');
        a.href = `${item.path.replace('/content/dam/au/cf', '')}`;
        a.className = 'btn btn-news btn-sm';
        a.textContent = 'Full Story';

        p.appendChild(a);
        contentCol.appendChild(p);
        contentWrapper.appendChild(contentCol);
        article.appendChild(contentWrapper);

        container.appendChild(article);
      });

      block.appendChild(listSection);
      block.appendChild(createPaginationLinks(pageNumber, total, limit));
    })
    .catch((error) => {
      throw new Error(`Error fetching news data: ${error.message}`);
    });
}
