function getAncestorPages(currentPagePath) {
  const withoutHtml = currentPagePath && currentPagePath.endsWith('.html')
    ? currentPagePath.replace(/\.html$/, '')
    : currentPagePath;

  const basePath = window.hlx.codeBasePath ? window.hlx.codeBasePath.split('.')[0] : '';
  const normalizedPath = basePath && withoutHtml.startsWith(`${basePath}`)
    ? withoutHtml.replace(`${basePath}`, '')
    : withoutHtml;

  const pages = normalizedPath.split('/').map((page) => page.trim());
  let path = '';
  return pages
    .map((page) => {
      if (page) {
        path += `/${page}`;
        return path;
      }
      return '';
    })
    .filter(Boolean);
}

export async function fetchPathsAndTitles() {
  try {
    const response = await fetch('/query-index.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }
    const jsonData = await response.json();
    const data = jsonData.data || [];
    const pathTitleMap = new Map();
    data.forEach((item) => {
      if (item.path) {
        const sanitizedTitle = item.title.replace(/<\/?[^>]+(>|$)/g, '');
        pathTitleMap.set(item.path, sanitizedTitle);
      }
    });

    return pathTitleMap;
  } catch (error) {
    return new Map();
  }
}

export function buildBreadcrumbs(pathTitleMap) {
  const currentUrl = window.location.pathname;
  const breadcrumbs = [];
  const ancestorPages = getAncestorPages(currentUrl);
  for (let i = 0; i < ancestorPages.length; i += 1) {
    let pageTitle = pathTitleMap.get(ancestorPages[i]);
    if (pageTitle) {
      breadcrumbs.push({ pageTitle, url: ancestorPages[i] });
    } else {
      pageTitle = pathTitleMap.get(`${ancestorPages[i]}/`);
      if (pageTitle) {
        breadcrumbs.push({ pageTitle, url: `${ancestorPages[i]}/` });
      }
    }
  }
  return breadcrumbs;
}

function createBreadcrumbLink(item, class1, class2) {
  return `<a href="${item.url}" class="${class1} ${class2}" itemprop="item"><span itemprop="name">${item.pageTitle}</span></a>`;
}

async function getPageTitleFromURL(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch page');
    }
    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');

    const title = doc.querySelector('title')?.innerText;
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.content;
    return ogTitle || title;
  } catch (error) {
    return null;
  }
}

export async function buildBreadcrumbsFromSitemap() {
  const sitemapUrl = '/sitemap.xml';

  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch sitemap');
    }
    const sitemapXml = await response.text();
    const xmlDoc = new DOMParser().parseFromString(sitemapXml, 'application/xml');
    const urls = Array.from(xmlDoc.querySelectorAll('url > loc')).map((loc) => loc.textContent);
    const urlMap = new Map(urls.map((url) => {
      const path = new URL(url).pathname.replace(/\/$/, '');
      return [path, url];
    }));
    const currentUrl = window.location.pathname;
    const breadcrumbs = [];

    const ancestorPages = getAncestorPages(currentUrl);
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < ancestorPages.length; i += 1) {
      const normalizedPage = ancestorPages[i].replace(/\/$/, '');
      const url = urlMap.get(normalizedPage);
      if (url) {
        const pageTitle = await getPageTitleFromURL(url.includes('.hlx') ? url.replace('.hlx', '.aem') : url);
        breadcrumbs.push({
          pageTitle,
          url,
        });
      }
    }
    /* eslint-enable no-await-in-loop */
    return breadcrumbs;
  } catch (error) {
    return [];
  }
}

function toBooleanFalseDefault(value) {
  if (value == null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim();
    if (v === '') return false;
    const l = v.toLowerCase();
    if (l === 'true') return true;
    if (l === 'false') return false;
    return false;
  }
  return Boolean(value);
}

export default async function createBreadcrumbs(
  breadcrumbItems,
  pageTitle,
  isMarketingPage,
  showBreadCrumb,
) {
  // Normalize items; keep original shape compatibility (pageTitle | name)
  const items = (breadcrumbItems && breadcrumbItems.length) ? breadcrumbItems : [{ name: 'Home', url: '/' }];
  const lastItem = items[items.length - 1];
  const finalTitle = pageTitle || lastItem?.pageTitle || lastItem?.name || '';
  const marketing = toBooleanFalseDefault(isMarketingPage);
  const showCrumb = toBooleanFalseDefault(showBreadCrumb);

  // If marketing page and breadcrumbs are hidden, render only the page title
  if (marketing && !showCrumb) {
    const titleOnly = document.createElement('h1');
    titleOnly.classList.add('t3-page-header', 'visible-md', 'visible-lg');
    titleOnly.innerHTML = `<span class="child you-are-here">${finalTitle}</span>`;
    return titleOnly;
  }

  // Default behavior: render full breadcrumbs
  const breadcrumbContainer = document.createElement('h1');
  breadcrumbContainer.classList.add('t3-page-header');

  const parentItems = items.slice(0, -1);
  const parentsMarkup = parentItems.map((item, index) => `
    <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <meta itemprop="position" content="${index}">
      ${createBreadcrumbLink(item, 'crumb', 'parent')}
    </span>
  `).join('');

  breadcrumbContainer.innerHTML = `
    <span itemscope itemtype="https://schema.org/BreadcrumbList" role="navigation" aria-labelledby="breadcrumb-label">
      ${parentsMarkup}
      <span class="child you-are-here">${finalTitle}</span>
    </span>
  `;

  return breadcrumbContainer;
}

export async function createBreadcrumbsForMobile(breadcrumbItems) {
  const breadcrumbContainer = document.createElement('div');
  breadcrumbContainer.classList.add('bg-school-primary', 'col-xs-12');

  const items = (breadcrumbItems && breadcrumbItems.length) ? breadcrumbItems : [{ name: 'Home', url: '/' }];

  breadcrumbContainer.innerHTML = `
    <span itemscope itemtype="https://schema.org/BreadcrumbList" role="navigation" aria-labelledby="breadcrumb-label">
      <span class="sr-only" id="breadcrumb-label">You are here: </span>
      ${items.map((item, index) => `
        <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <meta itemprop="position" content="${index + 1}">
          <a itemprop="item" class="${index === 0 ? 'sr-only' : 'crumb parent'}" href="${item.url}">
            <span itemprop="name">${item.name}</span>
          </a>
        </span>
      `).join('')}
    </span>
  `;

  return breadcrumbContainer;
}

export async function createBreadcrumbsForTier2Header(breadcrumbItems, pageTitle) {
  const breadcrumbContainer = document.createElement('h1');
  breadcrumbContainer.classList.add('t2-page-header');

  const items = breadcrumbItems && breadcrumbItems.length ? breadcrumbItems : [{ name: 'Home', url: '/' }];
  const lastItem = items[items.length - 1];
  const parents = items.slice(0, -1);

  breadcrumbContainer.innerHTML = `
    <span itemscope itemtype="https://schema.org/BreadcrumbList" role="navigation" aria-labelledby="breadcrumb-label">
      <span class="sr-only" id="breadcrumb-label">You are here: </span>
      ${parents
    .map(
      (item, index) => `
        <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <meta itemprop="position" content="${index + 1}">
          ${createBreadcrumbLink(item, 'crumb', 'parent')}
        </span>
      `,
    )
    .join('')}
    </span>
    <span class="child you-are-here">${pageTitle || lastItem.pageTitle}</span>
  `;
  return breadcrumbContainer;
}
