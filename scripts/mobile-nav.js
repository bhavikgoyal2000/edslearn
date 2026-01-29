/* Shared mobile helpers used by Tier2/Tier3 headers */
export const MOBILE_MAX = 991;
export const isMobile = () => window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;

function loadCssOnce(href, dataAttr = 'data-breadcrumb-mobile') {
  if (!href) return;
  if (document.querySelector(`link[${dataAttr}]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute(dataAttr, 'true');
  document.head.appendChild(link);
}

export function waitForHeaderBlock(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const header = document.querySelector('body > header');
    if (!header) {
      reject(new Error('<header> not found in DOM'));
      return;
    }
    let block = header.querySelector('.header.block');
    if (block) {
      resolve(block);
      return;
    }
    const observer = new MutationObserver(() => {
      block = header.querySelector('.header.block');
      if (block) {
        observer.disconnect();
        resolve(block);
      }
    });
    observer.observe(header, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Header block not found within timeout'));
    }, timeout);
  });
}

export function ensureMobileHeader({
  breadcrumbItems,
  pageTitle,
  header,
  cssHref,
}) {
  // Load the correct mobile CSS for the block
  loadCssOnce(cssHref);

  const items = (breadcrumbItems && breadcrumbItems.length)
    ? breadcrumbItems
    : [{ pageTitle: 'Home', url: '/' }];

  const lastItem = items[items.length - 1];
  const parentItems = items.slice(0, -1);

  const parentsMarkup = parentItems.map((item, index) => `
    <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <meta itemprop="position" content="${index + 1}">
      <a itemprop="item" class="crumb parent" href="${item.url}">
        <span itemprop="name">${item.pageTitle}</span>
      </a>
    </span>
  `).join('');

  const frag = document.createRange().createContextualFragment(`
    <div id="row-mobile-header" class="row row-center visible-xs visible-sm has-crumb mobile-header bg-school-primary">
      <div class="col-xs-12">
        <span itemscope itemtype="https://schema.org/BreadcrumbList" role="navigation" aria-labelledby="breadcrumb-label">
          <span class="sr-only" id="breadcrumb-label">You are here: </span>
          ${parentsMarkup}
          <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="sr-only">
            <meta itemprop="position" content="${parentItems.length + 1}">
            <a itemprop="item" class="crumb parent hidden-top" href="${lastItem.url}">
              <span itemprop="name">${lastItem.pageTitle}</span>
            </a>
          </span>
        </span>
      </div>
      <div class="navbar-mobile-full visible-sm-flex visible-xs-flex col-xs-12 col-sm-12">
        <button class="navbar-toggle collapsed" type="button" aria-expanded="false" aria-controls="new-mobile-nav" data-target="#new-mobile-nav" data-toggle="collapse" data-placement="left" tabindex="-1" aria-hidden="false">
          <span class="sr-only"><span>Show</span> navigation</span>
          <span class="ion-chevron-down"></span>
        </button>
        <h2 id="mobile-navigation-header-text">${pageTitle || lastItem.pageTitle}</h2>
      </div>
      <nav id="new-mobile-nav" class="navmenu collapsed col-xs-12 col-sm-5 col-md-4 collapse" role="navigation" aria-label="Mobile Site Navigation Menu" aria-expanded="true"></nav>
    </div>
  `);
  header.append(frag);
}

const sideNavOrigin = new WeakMap();
export function wireNavbarToggle(
  scope,
  parentScope,
  findSideNav = () => (
    document.getElementById('nav-accordion-holder')
    || document.querySelector('ul.sideAccordion.content-navigation')
  ),
) {
  const root = scope || document;
  const btn = root.querySelector('.navbar-toggle');
  if (!btn || btn.dataset.wired) return;
  btn.dataset.wired = '1';

  const targetSel = btn.getAttribute('data-target') || '#new-mobile-nav';
  let target = targetSel ? document.querySelector(targetSel) : null;

  if (!target && targetSel === '#new-mobile-nav') {
    const mobileBar = root.querySelector('.navbar-mobile-full') || root;
    target = document.createElement('nav');
    target.id = 'new-mobile-nav';
    target.className = 'navmenu collapsed col-xs-12 col-sm-5 col-md-4 collapse';
    target.setAttribute('role', 'navigation');
    target.setAttribute('aria-label', 'Mobile Site Navigation Menu');
    target.setAttribute('aria-expanded', 'false');
    mobileBar.parentElement.insertBefore(target, mobileBar.nextSibling);
  }
  if (target) target.classList.add('collapse');

  const moveSideNav = (opening) => {
    const sideNav = findSideNav();
    if (!sideNav || !target) return;
    if (opening) {
      if (sideNav.parentElement !== target) {
        let meta = sideNavOrigin.get(sideNav);
        if (!meta) {
          meta = { parent: sideNav.parentElement, next: sideNav.nextSibling };
          sideNavOrigin.set(sideNav, meta);
        }
        target.appendChild(sideNav);
      }
    } else {
      const meta = sideNavOrigin.get(sideNav);
      if (meta && meta.parent) meta.parent.insertBefore(sideNav, meta.next || null);
      sideNavOrigin.delete(sideNav);
    }
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const opening = btn.classList.contains('collapsed');
    if (opening) scope.classList.add('navhidden'); else scope.classList.remove('navhidden');

    btn.className = opening ? 'navbar-toggle' : 'navbar-toggle collapsed';
    btn.setAttribute('aria-expanded', String(opening));

    const icon = btn.querySelector('.ion-chevron-down, .ion-android-close');
    if (icon) {
      if (opening) {
        icon.classList.remove('ion-chevron-down');
        icon.classList.add('ion-android-close');
        parentScope.querySelector('#main-container').style.paddingTop = '0px';
      } else {
        icon.classList.remove('ion-android-close');
        icon.classList.add('ion-chevron-down');
        parentScope.querySelector('#main-container').style.paddingTop = '85px';
      }
    }

    moveSideNav(opening);
    if (target) {
      if (opening) {
        target.classList.add('in');
        target.removeAttribute('hidden');
        target.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add('mobile-nav-open');
        document.body.classList.add('mobile-nav-open');
      } else {
        target.classList.remove('in');
        target.setAttribute('hidden', '');
        target.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('mobile-nav-open');
        document.body.classList.remove('mobile-nav-open');
      }
    }

    const sr = btn.querySelector('.sr-only > span');
    if (sr) sr.textContent = opening ? 'Hide' : 'Show';
  });

  document.addEventListener('click', (evt) => {
    if (!target) return;
    if (btn.contains(evt.target) || target.contains(evt.target)) return;
    if (target.classList.contains('in')) {
      btn.className = 'navbar-toggle collapsed';
      btn.setAttribute('aria-expanded', 'false');
      const icon = btn.querySelector('.ion-android-close, .ion-chevron-down');
      if (icon) {
        icon.classList.remove('ion-android-close');
        icon.classList.add('ion-chevron-down');
      }
      const sr = btn.querySelector('.sr-only > span');
      if (sr) sr.textContent = 'Show';
      moveSideNav(false);
      target.classList.remove('in');
      target.setAttribute('hidden', '');
      target.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('mobile-nav-open');
      document.body.classList.remove('mobile-nav-open');
    }
  });
}

export function setMobileHeaderOffsetVar(root = document) {
  const header = root.querySelector('#row-mobile-header') || document.getElementById('row-mobile-header');
  const h = header ? Math.ceil(header.getBoundingClientRect().height) : 85;
  document.documentElement.style.setProperty('--mobile-header-h', `${h}px`);
}

export function watchHeaderOffset(root = document) {
  setMobileHeaderOffsetVar(root);
  window.addEventListener('resize', () => setMobileHeaderOffsetVar(root), { passive: true });
  const header = root.querySelector('#row-mobile-header');
  if (!header) return;
  const ro = new ResizeObserver(() => setMobileHeaderOffsetVar(root));
  ro.observe(header);
  const mo = new MutationObserver(() => setMobileHeaderOffsetVar(root));
  mo.observe(header, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    subtree: true,
  });
}
