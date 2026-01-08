function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function getApiParams(query) {
  // Get all query params from current URL
  const params = new URLSearchParams(window.location.search);

  // Set defaults if missing
  if (!params.has('collection')) params.set('collection', 'american~sp-program-finder');
  if (!params.has('profile')) params.set('profile', '_default_preview');
  if (!params.has('form')) params.set('form', 'partial');

  // You can modify/add params here as needed, e.g.:
  params.set('query', query);
  // params.delete('someParam');

  return params;
}

function loadScriptsSequentially(scripts, callback) {
  if (scripts.length === 0) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = scripts[0].src;
  script.onload = () => loadScriptsSequentially(scripts.slice(1), callback);
  document.body.appendChild(script);
}

export default async function decorate(block) {
  // Read query param from URL
  const query = getQueryParam('query');
  const apiParams = getApiParams(query);
  const apiUrl = `https://american-search.funnelback.squiz.cloud/s/search.html?${apiParams.toString()}`;

  // Show loader
  block.innerHTML = '<div class="program-finder-loader"><div class="spinner"></div><p>Loading results...</p></div>';

  try {
    const response = await fetch(apiUrl, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch results');
    const html = await response.text();

    // Insert the HTML response into the block
    block.innerHTML = html;

    // After block.innerHTML = html;
    const contentWrapper = block.querySelector('.content-wrapper');
    if (contentWrapper) {
      const form = contentWrapper.querySelector('form');
      if (form) {
        form.setAttribute('action', window.location.pathname);
      }
    }

    // 1. Collect external and inline scripts separately
    const externalScripts = [];
    const inlineScripts = [];

    block.querySelectorAll('script').forEach((oldScript) => {
      if (oldScript.src) {
        externalScripts.push(oldScript);
      } else {
        inlineScripts.push(oldScript);
      }
      oldScript.remove();
    });

    // Apply styles in the loaded HTML FIRST
    block.querySelectorAll('style').forEach((oldStyle) => {
      const newStyle = document.createElement('style');
      newStyle.textContent = oldStyle.textContent;
      document.head.appendChild(newStyle);
      oldStyle.remove();
    });

    // THEN load scripts
    loadScriptsSequentially(externalScripts, () => {
      inlineScripts.forEach((oldScript) => {
        if (oldScript.textContent.trim().startsWith('<')) return;
        const newScript = document.createElement('script');
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
      });

      // Initialize Funnelback cart widget if available
      if (window.Funnelback && window.Funnelback.SessionCart) {
        // eslint-disable-next-line no-new
        new window.Funnelback.SessionCart({
          collection: 'american~sp-program-finder',
          iconPrefix: 'fa fal fa-fw fa-',
          resultItemTrigger: {
            selector: 'h6',
            iconAdd: 'square',
            iconDelete: 'check-square',
            labelAdd: 'Add to compare',
            labelDelete: 'Remove',
          },
          cartItemTrigger: {
            iconAdd: 'square',
            iconDelete: 'check-square',
            labelAdd: 'Add to compare',
            labelDelete: 'Remove',
          },
          cartCount: {
            icon: '',
            label: 'comparision list',
            backLabel: 'Back to Programs',
          },
          cart: {
            icon: 'clipboard-list',
            label: 'Selected Programs',
            clearIcon: 'trash',
            clearLabel: 'Clear',
          },
          item: {
            title: '.search-results__content > .search-results__top > h3 > .search-results__link > .search-results__title',
            summary: '.search-results__content > p.search-results__desc > #full_desc',
            template:
              '<h4>{{#truncate 70}}{{title}}{{/truncate}}</h4><div class="module-compare__content"><span>{{metadata.degree}}</span><div class="module-compare__school-list"><span class="module-compare__school">{{metadata.school}}</span></div><p class="module-compare__desc">{{summary}}</p><div class="module-compare__details"><div class="module-compare__details-content"><dl class="module-compare__data-list"><dt>Format</dt><dd>{{metadata.format}}</dd><dt>Credits</dt><dd>{{metadata.credits}}</dd></dl></div></div></div><p><a href="{{metadata.visitpageurl}}" class="btn">Visit Program Page <span class="sr-only">for {{title}}</span></a><span> </span><a href="{{metadata.rfiURL}}" data-guid="{{metadata.rfiURLdataguid}}" data-program="{{metadata.rfiURLdataprogram}}" data-school={{metadata.rfiURLdataschool}} data-specialization="{{metadata.rfiURLdataspl}}" class="btn">Request Info <span class="sr-only">for {{title}}</span></a></p>',
            metadataSelectors: {
              degree: '.search-results__content > .search-results__top > h3 > .search-results__link > .search-results__degreetype',
              school: '.search-results__content > .search-results__top .search-results__school',
              format: '.search-results__content > .search-results__bottom > dl > .search-results__info',
              credits: '.search-results__content > .search-results__bottom > dl > dd:last-child',
              visitpageurl: '.search-results__content > .search-results__bottom > #visitpageurl',
              rfiURL: '.search-results__content > .search-results__bottom > #rfiURL',
              rfiURLdataguid: '.search-results__content > .search-results__bottom > #rfiURL-dataguid',
              rfiURLdataprogram: '.search-results__content > .search-results__bottom > #rfiURL-data-program',
              rfiURLdataschool: '.search-results__content > .search-results__bottom > #rfiURL-data-school',
              rfiURLdataspl: '.search-results__content > .search-results__bottom > #rfiURL-data-spl',
            },
          },
        });
      }

      setInterval(() => {
        const compareCount = document.querySelector('.badge');
        const compareBlock = document.querySelector('#compare-display');
        if (compareCount != null) {
          if (Number(compareCount.textContent) === 0) {
            compareBlock.classList.add('hidden');
          } else {
            compareBlock.classList.remove('hidden');
          }
        }
      }, 500);
    });

    // Remove elements with class "section related-links"
    block.querySelectorAll('section.related-links').forEach((el) => el.remove());
  } catch (err) {
    block.innerHTML = `<div>Error loading results: ${err.message}</div>`;
  }
}
