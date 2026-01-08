// check if a script is already loaded
function isScriptLoaded(src) {
  return Array.from(document.scripts).some((script) => script.src === src);
}

// Function to create and return the catalog widget section
function loadCatalogWidgetAndInitDOM(block) {
  const section = document.createElement('section');
  const [, departCodeObj, filterObj] = Array.from(block.children).slice(1);
  const departCode = departCodeObj ? departCodeObj.textContent.trim() : '';
  const filter = filterObj ? filterObj.textContent.trim() : '';
  const jQueryUrl = 'https://code.jquery.com/jquery-3.7.1.min.js';
  const widgetUrl = 'https://catalog.american.edu/widget-api/widget-api.min.js';

  function initCatalog() {
    const ul = document.createElement('ul');
    ul.className = 'acalog';
    ul.setAttribute('data-acalog-data', 'courses');
    ul.setAttribute('data-acalog-display', 'dynamic');
    ul.setAttribute('data-acalog-course-prefix', departCode);
    ul.setAttribute('data-acalog-catalog-legacy-id', '22');
    ul.setAttribute('data-acalog-course-type', filter);

    const li = document.createElement('li');
    li.textContent = 'Loading...';
    ul.appendChild(li);

    const loader = document.createElement('div');
    loader.className = 'loader-three-dots loader-blue';
    loader.setAttribute('aria-label', 'Loading content...');

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    ['bounce1', 'bounce2', 'bounce3'].forEach((cls) => {
      const bounce = document.createElement('div');
      bounce.className = cls;
      spinner.appendChild(bounce);
    });

    loader.appendChild(spinner);
    ul.appendChild(loader);
    section.appendChild(ul);

    if (typeof window.jQuery !== 'undefined' && typeof window.jQuery.fn.acalogWidgetize === 'function') {
      window.jQuery('.acalog').acalogWidgetize({
        gateway: 'https://catalog.american.edu',
      });
    }
  }

  function loadWidgetAndInit() {
    if (!isScriptLoaded(widgetUrl)) {
      const widgetScript = document.createElement('script');
      widgetScript.src = widgetUrl;
      widgetScript.type = 'text/javascript';
      widgetScript.onload = initCatalog;
      document.head.appendChild(widgetScript);
    } else {
      initCatalog();
    }
  }

  if (typeof window.jQuery === 'undefined' || typeof window.jQuery.fn.acalogWidgetize !== 'function') {
    if (!isScriptLoaded(jQueryUrl)) {
      const jQueryScript = document.createElement('script');
      jQueryScript.src = jQueryUrl;
      jQueryScript.type = 'text/javascript';
      jQueryScript.onload = () => {
        loadWidgetAndInit();
      };
      document.head.appendChild(jQueryScript);
    } else {
      loadWidgetAndInit();
    }
  } else {
    loadWidgetAndInit();
  }

  return section;
}

export default function decorate(block) {
  const section = loadCatalogWidgetAndInitDOM(block);
  if (section) {
    block.textContent = '';
    block.appendChild(section);
  }
}
