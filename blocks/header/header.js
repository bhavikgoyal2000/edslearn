import createDataLayerEvent from '../../scripts/analytics-util.js';
import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { fetchTopNavData } from '../../scripts/graphql-api.js';
import { cleanAEMUrl } from '../../scripts/util.js';

function appendLogo(pictureTag, imageAltText, isProgramFinder) {
  const logoCol = document.createElement('div');
  logoCol.className = 'col-xs-11 col-sm-6 col-md-4';

  const h1 = document.createElement('h1');
  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.className = 'logo';

  const logoPic = createOptimizedPicture(pictureTag, imageAltText, false, [
    { width: '750' },
  ]);
  logoLink.appendChild(logoPic);
  h1.appendChild(logoLink);
  if (isProgramFinder) {
    h1.innerHTML += ' <span class="program-finder-text">Program Finder</span>';
  }
  logoCol.appendChild(h1);

  createDataLayerEvent('click', 'click', () => ({
    linkName: 'header logo',
    linkURL: '/',
    linkType: 'nav',
    linkRegion: 'header',
    componentName: 'Top Nav',
    componentId: 'topnav',
  }), logoLink);

  return logoCol;
}

function appendNavLinks(navItems) {
  const homeLinks = document.createElement('div');
  homeLinks.className = 'home-links';

  navItems
    .filter((item) => item.type !== 'hamburger')
    .forEach((item) => {
      if (item.label && item.link) {
        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = item.label;
        homeLinks.appendChild(a);

        createDataLayerEvent('click', 'click', () => ({
          linkName: item.label,
          linkURL: item.link,
          linkType: 'nav',
          linkRegion: 'header',
          componentName: 'Top Nav',
          componentId: 'topnav',
        }), a);
      }
    });

  return homeLinks;
}

function createSearchFindBlock(browseTitle, browseUrl) {
  const container = document.createElement('div');
  container.className = 'search-find-container';

  const toggleLink = document.createElement('a');
  toggleLink.tabIndex = -1;
  toggleLink.id = 'new-search-toggle';
  toggleLink.dataset.toggle = 'collapse';
  toggleLink.dataset.target = '#new-search';
  toggleLink.href = '#new-search';
  toggleLink.textContent = window.innerWidth < 991 ? 'Search' : '';

  const searchCollapse = document.createElement('div');
  searchCollapse.id = 'new-search';
  searchCollapse.className = 'collapsed in';
  const formGroupStyle = 'display: flex; align-items: center;';

  const searchForm = document.createElement('form');
  searchForm.name = 'search';
  searchForm.id = 'new-search-form';
  searchForm.method = 'GET';
  searchForm.action = 'https://search.american.edu/s/search.html';
  searchForm.className = 'form-inline';
  searchForm.role = 'search';

  const searchGroup = document.createElement('div');
  searchGroup.className = 'form-group';
  searchGroup.style = formGroupStyle;

  const searchHidden = document.createElement('input');
  searchHidden.name = 'collection';
  searchHidden.type = 'hidden';
  searchHidden.value = 'au-meta';

  const searchInput = document.createElement('input');
  searchInput.tabIndex = 0;
  searchInput.className = 'search form-control';
  searchInput.type = 'search';
  searchInput.name = 'query';
  searchInput.id = 'new-search-q';
  searchInput.placeholder = 'Search Website';

  const searchButton = document.createElement('button');
  searchButton.tabIndex = 0;
  searchButton.id = 'new-submit-search';
  searchButton.setAttribute('aria-label', 'Search');
  searchButton.type = 'submit';
  searchButton.className = 'btn btn-primary';
  const searchIcon = document.createElement('span');
  searchIcon.className = 'search-icon';
  searchButton.appendChild(searchIcon);

  searchGroup.appendChild(searchHidden);
  searchGroup.appendChild(searchInput);
  searchGroup.appendChild(searchButton);
  searchForm.appendChild(searchGroup);

  const peopleForm = document.createElement('form');
  peopleForm.name = 'people';
  peopleForm.id = 'new-people-form';
  peopleForm.method = 'GET';
  peopleForm.action = '/directory';
  peopleForm.className = 'form-inline';

  const peopleGroup = document.createElement('div');
  peopleGroup.className = 'form-group';
  peopleGroup.style = formGroupStyle;

  const peopleInput = document.createElement('input');
  peopleInput.tabIndex = 0;
  peopleInput.className = 'search form-control';
  peopleInput.type = 'search';
  peopleInput.name = 'q';
  peopleInput.id = 'new-people-q';
  peopleInput.placeholder = 'Find AU Faculty/Staff';

  const peopleButton = document.createElement('button');
  peopleButton.tabIndex = 0;
  peopleButton.id = 'new-submit-people';
  peopleButton.setAttribute('aria-label', 'Find');
  peopleButton.name = 'btnG';
  peopleButton.type = 'submit';
  peopleButton.className = 'btn btn-primary';
  const peopleIcon = document.createElement('span');
  peopleIcon.className = 'search-icon';
  peopleButton.appendChild(peopleIcon);

  peopleGroup.appendChild(peopleInput);
  peopleGroup.appendChild(peopleButton);
  peopleForm.appendChild(peopleGroup);

  const deptPara = document.createElement('p');
  const deptLink = document.createElement('a');
  deptLink.tabIndex = 0;
  deptLink.href = browseUrl;
  deptLink.textContent = browseTitle;
  deptPara.appendChild(deptLink);

  createDataLayerEvent('click', 'click', () => ({
    linkName: browseTitle,
    linkURL: browseUrl,
    linkType: 'nav',
    linkRegion: 'header',
    componentName: 'Top Nav',
    componentId: 'topnav',
  }), deptLink);

  searchCollapse.appendChild(searchForm);
  searchCollapse.appendChild(peopleForm);
  searchCollapse.appendChild(deptPara);

  container.appendChild(toggleLink);
  container.appendChild(searchCollapse);

  return container;
}

function createHamburgerNav(subMenuData, browseTitle, browseUrl, headerColor) {
  const nav = document.createElement('nav');
  nav.id = 'new-nav';
  nav.style.display = 'none';
  nav.className = 'navmenu collapsed col-xs-12 col-sm-5 col-md-4 collapse in';
  if (headerColor) {
    nav.classList.add(headerColor);
  }
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main Site Navigation Menu');
  nav.setAttribute('aria-expanded', 'true');

  const expand = document.createElement('div');
  expand.className = 'expand';
  expand.id = 'new-au-menu-expand';

  const ul = document.createElement('ul');
  ul.id = 'new-main-menu-accordion';
  ul.className = 'menu';
  ul.style.display = 'block';

  const searchLi = document.createElement('li');
  searchLi.className = 'menu-item';
  searchLi.appendChild(createSearchFindBlock(browseTitle, browseUrl));
  ul.appendChild(searchLi);

  subMenuData.forEach((menuItem, index) => {
    const menuId = `submenu${index + 1}`;
    const li = document.createElement('li');
    li.className = 'menu-item';
    li.id = 'menu-item-expandable';

    const hasChildren = menuItem.expandable
      && Array.isArray(menuItem.children)
      && menuItem.children.length > 0;
    const hasLink = menuItem.link && menuItem.link !== '#';

    const wrapperLink = document.createElement('a');
    wrapperLink.href = hasLink ? menuItem.link : '#';

    if (hasLink) {
      createDataLayerEvent('click', 'click', () => ({
        linkName: menuItem.link,
        linkURL: menuItem.label,
        linkType: 'nav',
        linkRegion: 'header',
        componentName: 'Top Nav',
        componentId: 'topnav',
      }), wrapperLink);
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'menu-item-label';
    labelSpan.textContent = menuItem.label || '#';

    wrapperLink.appendChild(labelSpan);

    if (hasChildren) {
      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'submenu-toggle-icon';
      wrapperLink.appendChild(toggleIcon);

      wrapperLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.toggleSubmenu(menuId);
      });
      createDataLayerEvent('click', 'accordionToggle', () => {
        const expanded = wrapperLink.getAttribute('aria-expanded') === 'true';
        const componentName = 'Header';
        const componentId = 'header';
        const componentTitle = wrapperLink.textContent;
        const state = expanded ? 'expanded' : 'collapsed';
        return {
          componentName,
          componentId,
          componentTitle,
          state,
        };
      }, wrapperLink);

      li.appendChild(wrapperLink);

      const subUl = document.createElement('ul');
      subUl.id = menuId;
      subUl.className = 'submenu';
      subUl.style.display = 'none';

      menuItem.children.forEach((child) => {
        const subLi = document.createElement('li');
        subLi.className = 'submenu-item';

        const childLink = document.createElement('a');
        childLink.href = child.link || '#';
        childLink.textContent = child.label || 'Missing Sub-label';

        createDataLayerEvent('click', 'click', () => ({
          linkName: child.label,
          linkURL: child.link,
          linkType: 'nav',
          linkRegion: 'header',
          componentName: 'Top Nav',
          componentId: 'topnav',
        }), childLink);

        subLi.appendChild(childLink);
        subUl.appendChild(subLi);
      });

      li.appendChild(subUl);
    } else {
      li.appendChild(wrapperLink);
    }

    ul.appendChild(li);
  });

  expand.appendChild(ul);
  nav.appendChild(expand);
  return nav;
}

function loadBootstrapJS() {
  const src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js';
  const exists = Array.from(document.scripts).some((s) => s.src.includes('bootstrap.bundle'));

  if (exists) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  document.body.appendChild(script);
}

function buildSearchBlock() {
  const li = document.createElement('li');
  li.className = 'nav-item search';

  const a = document.createElement('a');
  a.className = 'nav-link';
  a.href = '#mag-search';
  a.setAttribute('data-bs-toggle', 'collapse');
  a.textContent = 'Search';

  li.appendChild(a);

  // Panel OUTSIDE, not inside li
  const panel = document.createElement('div');
  panel.id = 'mag-search';
  panel.className = 'collapse mt-2 mag-search';

  panel.innerHTML = `
    <form id='mag-search-form' method='GET' action='/magazine/search' role='search' class=''>
      <div class='input-group'>
        <input type='search'
          class='form-control'
          placeholder='Search American Magazine'
          name='q' required>
        <button class='btn btn-primary' type='submit' disabled>
          <span class="ion-search"></span>
          <span class="sr-only sr-only-focusable">Go</span>
        </button>
      </div>
    </form>
  `;

  // Enable button when input has text
  const form = panel.querySelector('#mag-search-form');
  const input = form.querySelector('input[name="q"]');
  const button = form.querySelector('button[type="submit"]');
  input.addEventListener('input', () => {
    button.disabled = input.value.trim().length === 0;
  });

  return { li, panel };
}

function buildMagazineNav(menuItems, isSearchEnabled = false) {
  const ul = document.createElement('ul');
  ul.className = 'navbar-nav';

  menuItems.forEach((item) => {
    if (!item) return;

    const li = document.createElement('li');
    const nested = item.nested_menuLinks2CMF || [];
    const hasNested = nested.length > 0;

    // Normal link
    if (!hasNested) {
      li.className = 'nav-item';
      const a = document.createElement('a');
      a.href = cleanAEMUrl(item.navLinkCMF);
      a.className = 'nav-link';
      a.textContent = item.navTitleCMF;
      li.appendChild(a);
      ul.appendChild(li);
      return;
    }

    // Dropdown
    li.className = 'nav-item dropdown';

    const a = document.createElement('a');
    a.className = 'nav-link dropdown-toggle';
    a.href = cleanAEMUrl(item.navLinkCMF);
    a.setAttribute('data-bs-toggle', 'dropdown');
    a.textContent = item.navTitleCMF;
    li.appendChild(a);

    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu';

    nested.forEach((sub) => {
      const liSub = document.createElement('li');
      const subA = document.createElement('a');
      subA.href = cleanAEMUrl(sub.nested_NavLink);
      subA.className = 'dropdown-item';
      subA.textContent = sub.nested_NavTitle;
      liSub.appendChild(subA);
      menu.appendChild(liSub);
    });

    li.appendChild(menu);
    ul.appendChild(li);
  });

  if (isSearchEnabled) {
    const { li, panel } = buildSearchBlock();
    ul.appendChild(li);
    li.appendChild(panel);
  }

  return ul;
}

function buildMagazineNavWrapper(navItems, labeledData, isSearchEnabled = false) {
  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-md navbar-light';
  nav.setAttribute('aria-label', 'Magazine Navigation');

  const container = document.createElement('div');
  container.className = 'container-fluid';

  const bc = document.createElement('nav');
  bc.className = 'breadcrumb';

  const currentPath = window.location.pathname;
  const isMagazinePage = currentPath.startsWith('/magazine') || currentPath.includes('/magazine');

  if (isMagazinePage) {
    // Remove leading and trailing slashes, then split after '/magazine'
    const pathAfterMagazine = currentPath.replace(/^\/|\/$/g, '').split('/').slice(1); // skip 'magazine'
    const crumbs = [];
    let accumulated = '/magazine';
    pathAfterMagazine.forEach((segment, idx) => {
      accumulated += `/${segment}`;
      const isLast = idx === pathAfterMagazine.length - 1;
      crumbs.push(
        `<span class='breadcrumb-item${isLast ? ' active' : ''}'${isLast ? " aria-current='page'" : ''}>${
          isLast
            ? segment.replace(/-/g, ' ')
            : `<a href='${accumulated}/'>${segment.replace(/-/g, ' ')}</a>`
        }</span>`,
      );
    });
    bc.innerHTML = crumbs.join('');
  } else {
    bc.innerHTML = '';
  }

  container.appendChild(bc);

  // brand placeholder (required for correct flex layout)
  const brand = document.createElement('a');
  brand.className = 'navbar-brand d-md-none';
  brand.href = cleanAEMUrl(labeledData.titleLink);
  brand.textContent = labeledData.magazineTitle2;
  const containerMenu = document.createElement('div');
  containerMenu.className = 'd-flex align-items-center magazine-menu-container';
  containerMenu.appendChild(brand);

  // Hamburger
  const btn = document.createElement('button');
  btn.className = 'navbar-toggler collapsed';
  btn.type = 'button';
  btn.setAttribute('data-bs-toggle', 'collapse');
  btn.setAttribute('data-bs-target', '#mag-nav');
  btn.setAttribute('aria-controls', 'mag-nav');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Toggle navigation');

  btn.addEventListener('click', () => {
    if (window.innerWidth < 1023) {
      const mobileHeading = btn.closest('.inside-header-magazine')?.querySelector('.heading-magazine');
      if (mobileHeading) {
        mobileHeading.style.display = mobileHeading.style.display === 'none' ? '' : 'none';
      }
    }
  });

  btn.innerHTML = '<span class="hamburger-icon"></span>';
  containerMenu.appendChild(btn);

  // Collapse container
  const collapse = document.createElement('div');
  collapse.className = 'collapse navbar-collapse';
  collapse.id = 'mag-nav';

  // Build UL using BS nav styles
  const ul = buildMagazineNav(navItems, isSearchEnabled);
  ul.classList.add('ms-auto');

  collapse.appendChild(ul);
  containerMenu.appendChild(collapse);
  container.appendChild(containerMenu);
  nav.appendChild(container);

  return nav;
}

function buildMagazineHeader(title1, title2, titleUrl) {
  const header = document.createElement('div');
  header.className = 'container-fluid py-2 heading-magazine';

  const wrap = document.createElement('div');
  wrap.className = 'align-items-center justify-content-between';

  // LEFT — Logo/title
  const a = document.createElement('a');
  a.href = cleanAEMUrl(titleUrl);
  a.className = 'text-decoration-none';
  a.setAttribute('aria-label', `${title2} - ${title1}`);

  const h1 = document.createElement('h1');
  h1.className = 'masthead';
  h1.innerHTML = `
      <small>${title1}</small>
      ${title2}
  `;
  a.appendChild(h1);

  wrap.appendChild(a);

  // BREADCRUMB
  // const bc = document.createElement('nav');
  // bc.className = 'breadcrumb d-none d-lg-block';
  // bc.className = 'breadcrumb mt-2';

  // bc.innerHTML = `
  //    <span class='breadcrumb-item'><a href='/'>American University</a></span>
  //    <span class='breadcrumb-item'><a href='/magazine/'>American Magazine</a></span>
  //    <span class='breadcrumb-item active' aria-current='page'>
  //       ${title2}: ${title1}
  //    </span>
  // `;

  // wrap.appendChild(bc);

  header.appendChild(wrap);

  return header;
}

function buildMagazineTopNavDOM(navItems, labeledData) {
  if (!navItems || !labeledData) {
    return document.createElement('div'); // Return an empty container to avoid breaking the DOM
  }

  const container = document.createElement('div');
  container.id = 'inside-header-magazine';
  container.className = 'inside-header-magazine';

  const headerBlock = buildMagazineHeader(
    labeledData.magazineTitle1,
    labeledData.magazineTitle2,
    labeledData.titleLink,
  );

  const navBlock = buildMagazineNavWrapper(
    navItems,
    labeledData,
    labeledData.searchEnabled,
  );

  container.appendChild(headerBlock);
  container.appendChild(navBlock);

  return container;
}

function labelMagazineData(data) {
  return {
    magazineTitle1: data[0]?.[0] || null,
    magazineTitle2: data[0]?.[1] || null,
    titleLink: data[0]?.[2] || null,
    searchEnabled: data[1]?.[0] === 'true',
    cfPath: data[2]?.[0] || null,
  };
}

function extractFragmentData(fragment) {
  // 1️⃣ <main>
  const main = fragment.children[0];
  if (!main) return null;

  // 2️⃣ main > div (the first content container)
  const container = main.children[0];
  if (!container) return null;

  // 3️⃣ container > div (wrapper)
  const wrapper = container.children[0];
  if (!wrapper) return null;

  // 5️⃣ headerBlock direct children are 3 <div>s
  return Array.from(wrapper.children).map((blockItem) => {
    // Each blockItem contains an inner <div>
    const inner = blockItem.children[0];

    // Collect all <p> and <a> textual/href values
    return Array.from(inner.children).flatMap((el) => {
      if (el.tagName === 'P') {
        return el.textContent.trim();
      }
      if (el.tagName === 'A') {
        return el.getAttribute('href');
      }
      return null;
    }).filter(Boolean);
  });
}

function extractContentFragment(fragment) {
  const elements = fragment.querySelectorAll('*');
  let path = null;

  elements.forEach((element) => {
    const textContent = element.textContent.trim();
    if (textContent.includes('/content/dam')) {
      path = textContent;
    }
  });

  return path;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath.startsWith('/index.html');
  const isMagazinePage = currentPath.startsWith('/magazine') || currentPath.includes('/magazine');

  /* Extract CF data */
  const isProgramFinder = /^\/(content\/au\/)?programs?(\/|$)/.test(currentPath);
  let pictureTag = '';
  let imageAltText = '';
  if (isProgramFinder) {
    pictureTag = `${window.hlx.codeBasePath}/blocks/header/crest.svg`;
    imageAltText = 'American University Program Finder Logo';
    block.classList.add('program-finder-header');
  } else if (!isHomePage) {
    const imgTag = fragment.querySelector('picture > img');
    pictureTag = imgTag?.src || '';
    const paragraphs = fragment.querySelectorAll('p');
    imageAltText = paragraphs[1]?.textContent.trim() || '';
  } else {
    pictureTag = `${window.hlx.codeBasePath}/blocks/header/crest-logotype.svg`;
    imageAltText = 'Image Alt text';
  }
  const contentFragementPath = extractContentFragment(fragment);
  const item = await fetchTopNavData(contentFragementPath);
  if (!item) return;

  const menuLinks = Array.isArray(item.menuLinksCMF)
    ? item.menuLinksCMF.map((str) => JSON.parse(str))
    : [];
  let globalLinks = [];
  if (isHomePage) {
    globalLinks = Array.isArray(item.globalNavLinkSMF)
      ? item.globalNavLinkSMF.map((str) => JSON.parse(str))
      : [];
  }
  const navItems = [
    ...globalLinks.map((link) => ({
      label: link.globalNavTitleSMF,
      link: link.globalNavUrlSMF,
    })),
    {
      label: 'Menu',
      type: 'hamburger',
      subMenu: menuLinks.map((menu) => {
        const children = Array.isArray(menu.nested_menuLinks2CMF)
          ? menu.nested_menuLinks2CMF.map((sub) => ({
            label: sub.nested_NavTitle,
            link: sub.nested_NavLink || '#',
          }))
          : [];
        return {
          label: menu.navTitleCMF,
          link: menu.navLinkCMF || '#',
          expandable: children.length > 0,
          children,
        };
      }),
    },
  ];

  let browseDepartmentsUrl = '';
  if (item.titleUrl && typeof item.titleUrl === 'object') {
    const { _path: pathValue } = item.titleUrl;
    if (pathValue) {
      browseDepartmentsUrl = pathValue;
    }
  }
  const data = {
    navItems,
    browseDepartmentsTitle: item.title,
    browseDepartmentsUrl,
  };

  if (isMagazinePage) {
    block.classList.add('header-magazine');
    const headerWrapper = block.parentElement;
    if (headerWrapper) {
      headerWrapper.classList.add('affix-top');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
          headerWrapper.classList.remove('affix-top');
          headerWrapper.classList.add('affix');
        } else {
          headerWrapper.classList.add('affix-top');
          headerWrapper.classList.remove('affix');
          if (window.innerWidth >= 1023) {
            const shownCollapse = headerWrapper.querySelector('.navbar-collapse.collapse.show');
            if (shownCollapse) {
              shownCollapse.classList.remove('show');
            }
            const toggler = headerWrapper.querySelector('.navbar-toggler');
            if (toggler) {
              const isExpanded = toggler.getAttribute('aria-expanded') === 'true';
              const hasCollapsed = toggler.classList.contains('collapsed');
              if (isExpanded && !hasCollapsed) {
                toggler.classList.add('collapsed');
                toggler.setAttribute('aria-expanded', 'false');
              }
            }
          }
        }
      });
    }
    block.textContent = '';
    const fragmentData = extractFragmentData(fragment);
    const labeledData = labelMagazineData(fragmentData);
    const magazineDom = buildMagazineTopNavDOM(menuLinks, labeledData);
    block.appendChild(magazineDom);
    loadBootstrapJS();
  } else {
    block.classList.add('header-main');
    const headerColor = globalLinks.length > 0 || isProgramFinder ? 'bg-top-nav-blue' : 'bg-white-color';
    const row = document.createElement('div');
    row.id = 'row-all-logo';
    row.className = 'row row-center';

    const logoCol = appendLogo(pictureTag, imageAltText);
    const navCol = document.createElement('div');
    navCol.className = 'navbar-full col-xs-1 col-sm-6 col-md-8';

    const navLinks = appendNavLinks(data.navItems);
    const hamburgerItem = data.navItems.find((i) => i.type === 'hamburger');

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'navbar-toggle-button';
    if (headerColor) {
      toggleButton.classList.add(headerColor);
    }
    toggleButton.setAttribute('onclick', 'toggleMenu()');
    toggleButton.innerHTML = '<span class="icon-bar">Menu</span><span class="hamburger-icon"></span>';

    const navMenu = createHamburgerNav(
      hamburgerItem.subMenu,
      data.browseDepartmentsTitle,
      data.browseDepartmentsUrl,
      headerColor,
    );

    navCol.appendChild(navLinks);
    navCol.appendChild(toggleButton);
    navCol.appendChild(navMenu);
    row.appendChild(logoCol);
    row.appendChild(navCol);

    block.textContent = '';
    block.classList.add(globalLinks.length > 0 || isProgramFinder ? 'head-home' : 'head-sub');
    block.classList.add(headerColor);

    block.appendChild(row);
  }
}

window.toggleMenu = function toggleMenu() {
  const menu = document.querySelector('#new-nav');
  const isVisible = menu.style.display === 'block';
  menu.style.display = isVisible ? 'none' : 'block';

  const icon = document.querySelector('.navbar-toggle-button .hamburger-icon');
  const iconClose = document.querySelector('.navbar-toggle-button .hamburger-icon-close');
  if (icon) {
    icon.className = isVisible ? 'hamburger-icon' : 'hamburger-icon-close';
  } else if (iconClose) {
    iconClose.className = isVisible ? 'hamburger-icon' : 'hamburger-icon-close';
  }
};

window.toggleSubmenu = function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  const icon = submenu?.parentElement.querySelector('.submenu-toggle-icon');
  const iconClose = submenu?.parentElement.querySelector('.submenu-toggle-icon-close');
  if (submenu) {
    const isVisible = submenu.style.display === 'block';
    submenu.style.display = isVisible ? 'none' : 'block';
    if (icon) {
      icon.className = isVisible ? 'submenu-toggle-icon' : 'submenu-toggle-icon-close';
    } else if (iconClose) {
      iconClose.className = isVisible ? 'submenu-toggle-icon' : 'submenu-toggle-icon-close';
    }
  }
};
