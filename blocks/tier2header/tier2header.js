import { createDomElement } from '../../scripts/util.js';
import {
  createBreadcrumbsForTier2Header,
  fetchPathsAndTitles,
  buildBreadcrumbs,
  buildBreadcrumbsFromSitemap,
} from '../../scripts/createbreadcrumb.js';
import {
  isMobile as isMobileView,
  waitForHeaderBlock,
  ensureMobileHeader,
  wireNavbarToggle as wireMobileNavbarToggle,
  watchHeaderOffset as watchMobileHeaderOffset,
} from '../../scripts/mobile-nav.js';

let subNavBlock;
let breadcrumbContainer;

let image;
let title;
let schoolName;
let btn1;
let hasSubCTA1;
let btn1subCTA1;
let btn1subCTA2;
let btn2;
let hasSubCTA2;
let btn2subCTA1;
let btn2subCTA2;
let btn3;
let hasSubCTA3;
let btn3subCTA1;
let btn3subCTA2;
let subNavTitle1;
let subNavTitle2;
let subNavTitle3;

function trimWithEllipsis(str, strVal, maxLen = 24) {
  if (!str) return strVal;
  return str.length > maxLen ? `${str.slice(0, maxLen - 3)}...` : str;
}

function setFields(fields) {
  // Helper to coerce "true"/"false" (empty/undefined -> false)
  const toBool = (el) => {
    const v = el?.querySelector('p')?.textContent?.trim()?.toLowerCase() || '';
    return v === 'true' || v === 'yes' || v === '1';
  };

  // Build a <p class="button-container"><a ... title="label"></a></p> from label + link <p>
  const makeSubCtaP = (labelP, linkP) => {
    const a = linkP?.querySelector('a');
    if (!a) return null;
    const p = document.createElement('p');
    p.className = 'button-container';
    const cloned = a.cloneNode(false);
    cloned.setAttribute('href', a.getAttribute('href') || '#');
    cloned.setAttribute('title', (labelP?.textContent || a.getAttribute('title') || '').trim());
    p.appendChild(cloned);
    return p;
  };

  // Parse a sub-CTA group container:
  // [Heading P], [Label1 P], [Link1 P], [Label2 P], [Link2 P]
  const parseSubGroup = (containerDiv) => {
    const ps = Array.from(containerDiv?.querySelectorAll('p') || []);
    const headingP = ps[0] || null;
    const label1P = ps[1] || null;
    const link1P = ps[2] || null;
    const label2P = ps[3] || null;
    const link2P = ps[4] || null;

    return {
      headingText: (headingP?.textContent || '').trim(),
      sub1: makeSubCtaP(label1P, link1P),
      sub2: makeSubCtaP(label2P, link2P),
    };
  };

  // New DOM slots (top-level children of the block)
  // 0: empty, 1: school name, 2: image, 3: main CTAs,
  // 4: hasSubCTA1, 5: subGroup1, 6: hasSubCTA2, 7: subGroup2, 8: hasSubCTA3, 9: subGroup3
  const titleWrap = fields?.[0];
  const schoolNameWrap = fields?.[1];
  const imageWrap = fields?.[2];
  const ctaBtnWrap = fields?.[3];
  const has1Wrap = fields?.[4];
  const subGroup1Wrap = fields?.[5];
  const has2Wrap = fields?.[6];
  const subGroup2Wrap = fields?.[7];
  const has3Wrap = fields?.[8];
  const subGroup3Wrap = fields?.[9];

  // Title
  title = (titleWrap?.querySelector('p')?.textContent || '').trim();

  // School name
  schoolName = (schoolNameWrap?.querySelector('p')?.textContent || '').trim();

  // Background image div (downstream expects .querySelector('picture'))
  image = imageWrap?.querySelector('div') || imageWrap || null;

  // Main CTA buttons (three <p class="button-container"><a ...>)
  const ctaBtnContainer = ctaBtnWrap?.querySelector('div') || ctaBtnWrap || null;
  [btn1, btn2, btn3] = ctaBtnContainer ? Array.from(ctaBtnContainer.querySelectorAll('p')).slice(0, 3) : [null, null, null];

  // Booleans
  hasSubCTA1 = toBool(has1Wrap);
  hasSubCTA2 = toBool(has2Wrap);
  hasSubCTA3 = toBool(has3Wrap);

  // Sub-CTA groups
  const g1 = parseSubGroup(subGroup1Wrap?.querySelector('div') || subGroup1Wrap || null);
  const g2 = parseSubGroup(subGroup2Wrap?.querySelector('div') || subGroup2Wrap || null);
  const g3 = parseSubGroup(subGroup3Wrap?.querySelector('div') || subGroup3Wrap || null);

  // Assign sub-CTA <p> nodes used downstream
  btn1subCTA1 = g1.sub1;
  btn1subCTA2 = g1.sub2;
  btn2subCTA1 = g2.sub1;
  btn2subCTA2 = g2.sub2;
  btn3subCTA1 = g3.sub1;
  btn3subCTA2 = g3.sub2;

  const defaultPrompt = 'Are you interested in...';

  // Sub-CTA headings for prompts (trimmed)
  subNavTitle1 = hasSubCTA1 ? trimWithEllipsis(g1.headingText, defaultPrompt) : '';
  subNavTitle2 = hasSubCTA2 ? trimWithEllipsis(g2.headingText, defaultPrompt) : '';
  subNavTitle3 = hasSubCTA3 ? trimWithEllipsis(g3.headingText, defaultPrompt) : '';
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8;
    return v.toString(16);
  });
}

function fetchCtaContent(div) {
  // Accept either a <p> wrapper or a container with a descendant <a>
  const linkElem = div?.querySelector('a') || div?.querySelector('p a');
  const link = linkElem?.getAttribute('href') || '#';
  const textContent = linkElem?.getAttribute('title') || (linkElem?.textContent || '').trim();
  return { link, textContent };
}

function createSubCTA(liTag, btn, hasSubCTA, btnsubCTA1, btnsubCTA2, subNavTitle) {
  if (!liTag || !btn) return liTag || document.createElement('li');

  const uuid = `#cta-${generateUUID()}`;
  const { link, textContent } = fetchCtaContent(btn);

  let singleLineClass = 'btn,btn-cta,collapsed';
  if (textContent && textContent.split(' ').length <= 1) {
    singleLineClass = `${singleLineClass},single-line`;
  }

  const aTag = createDomElement('a', singleLineClass, textContent || '', {
    href: hasSubCTA ? uuid : link || '#',
  });

  const subCTAContainer = createDomElement('div', 'cta-content,bg-school-primary,collapse');

  if (hasSubCTA) {
    const { link: subCTALink1, textContent: subCTATitle1 } = fetchCtaContent(btnsubCTA1);
    const { link: subCTALink2, textContent: subCTATitle2 } = fetchCtaContent(btnsubCTA2);

    const subCTATitleTag = createDomElement('h2', '', subNavTitle || '');
    const subCTALink1Tag = createDomElement('a', 'btn,btn-outline', subCTATitle1 || '', { href: subCTALink1 || '#' });
    const subCTALink2Tag = createDomElement('a', 'btn,btn-outline', subCTATitle2 || '', { href: subCTALink2 || '#' });

    subCTAContainer.append(subCTATitleTag);
    subCTAContainer.append(subCTALink1Tag);
    subCTAContainer.append(subCTALink2Tag);

    aTag.addEventListener('click', (e) => {
      e.preventDefault();

      // Close all other open subCTAContainers
      document.querySelectorAll('.cta-content.bg-school-primary.collapse.in').forEach((openContainer) => {
        if (openContainer !== subCTAContainer) openContainer.classList.remove('in');
      });

      // Add 'collapsed' to all other aTags (only those rendered by this block)
      liTag.parentElement?.querySelectorAll('a.btn.btn-cta.single-line, a.btn.btn-cta').forEach((btnEl) => {
        if (btnEl !== aTag) btnEl.classList.add('collapsed');
      });

      // Toggle current
      subCTAContainer.classList.toggle('in');
      aTag.classList.toggle('collapsed');
    });
  }

  if (hasSubCTA) {
    // Keep current behavior (id uses the same value used in href)
    subCTAContainer.setAttribute('id', uuid);
  }

  liTag.append(aTag);
  liTag.append(subCTAContainer);
  return liTag;
}

// Scroll handler (removed unused lastScrollTop)
window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const imgHeight = document.querySelector('.sub-header').offsetHeight;
  if (scrollTop > imgHeight) {
    // User has scrolled down from the top
    subNavBlock.classList.remove('affix-top');
    subNavBlock.classList.add('affix');
  } else {
    // User is at the top of the page
    subNavBlock.classList.remove('affix');
    subNavBlock.classList.add('affix-top');
  }
}, { passive: true });
function setMobileHeaderOffsetVar(root = document) {
  const header = root.querySelector('#row-mobile-header') || document.getElementById('row-mobile-header');
  const h = header ? Math.ceil(header.getBoundingClientRect().height) : 85;
  document.documentElement.style.setProperty('--mobile-header-h', `${h}px`);
}

function createSeeMoreModalFromProvidedDOM() {
  // Build dynamic values from authored CTAs when available
  const get = (p) => (p ? fetchCtaContent(p) : { link: '#', textContent: '' });

  const { textContent: b1 } = get(btn1);
  const { link: b1aLink, textContent: b1a } = get(btn1subCTA1);
  const { link: b1bLink, textContent: b1b } = get(btn1subCTA2);

  const { textContent: b2 } = get(btn2);
  const { link: b2aLink, textContent: b2a } = get(btn2subCTA1);
  const { link: b2bLink, textContent: b2b } = get(btn2subCTA2);

  const { textContent: b3 } = get(btn3);
  const { link: b3aLink, textContent: b3a } = get(btn3subCTA1);
  const { link: b3bLink, textContent: b3b } = get(btn3subCTA2);

  const p1 = subNavTitle1 || 'Are you interested in...';
  const p2 = subNavTitle2 || 'Are you interested in...';
  const p3 = subNavTitle3 || 'Are you interested in...';

  // Overlay to capture outside clicks
  const overlay = document.createElement('div');
  overlay.className = 'see-more-block';
  overlay.setAttribute('hidden', '');

  // Exact inner DOM you shared (minor: removed inline onclick, we wire in JS)
  overlay.innerHTML = `
      <div class="close" id="close"><i class="fa fa-times" aria-hidden="true"></i></div>
      <h3>Explore More</h3>
      <ul>
        <li>
          <div class="dropdown-submenu button-1">${b1 || 'Apply'}</div>
          <ul class="sub-menu sub-1">
            <p class="text-left">${p1}</p>
            <li><a href="${b1aLink || '#'}">${b1a || 'Undergraduate'}</a></li>
            <li><a href="${b1bLink || '#'}">${b1b || 'Graduate'}</a></li>
          </ul>
        </li>
        <li>
          <div class="dropdown-submenu button-2">${b2 || 'Request Info'}</div>
          <ul class="sub-menu sub-2">
            <p class="text-left">${p2}</p>
            <li><a href="${b2aLink || '#'}">${b2a || 'Undergrad Info'}</a></li>
            <li><a href="${b2bLink || '#'}">${b2b || 'Graduate Info'}</a></li>
          </ul>
        </li>
        <li>
          <div class="dropdown-submenu button-3">${b3 || 'Explore'}</div>
          <ul class="sub-menu sub-3">
            <p class="text-left">${p3}</p>
            <li><a href="${b3aLink || '#'}">${b3a || 'Video Tour'}</a></li>
            <li><a href="${b3bLink || '#'}">${b3b || 'Online Events'}</a></li>
          </ul>
        </li>
      </ul>
  `;

  document.body.appendChild(overlay);

  // Wiring
  const dialog = overlay; // was: overlay.querySelector('#seeMoreBlock')

  // Toggle sub-menus (button-1 -> sub-1, etc.)
  dialog.addEventListener('click', (e) => {
    const btn = e.target.closest('.dropdown-submenu');
    if (!btn || !dialog.contains(btn)) return;

    // get index from class "button-<n>"
    const m = btn.className.match(/\bbutton-(\d+)\b/);
    if (!m) return;
    const idx = m[1];

    const target = dialog.querySelector(`.sub-menu.sub-${idx}`);
    if (!target) return;

    const isActive = target.classList.contains('active');

    // close all
    dialog.querySelectorAll('.sub-menu').forEach((ul) => ul.classList.remove('active'));

    // reopen only if it was not already open (toggle)
    if (!isActive) target.classList.add('active');
  });

  const closeBtn = overlay.querySelector('#close');

  const api = {
    root: overlay,
    open() {
      setMobileHeaderOffsetVar();
      overlay.classList.add('active'); // add active on open
      overlay.removeAttribute('hidden');
      document.body.classList.add('eds-modal-open');
    },
    close() {
      overlay.classList.remove('active'); // remove active on close
      overlay.setAttribute('hidden', '');
      document.body.classList.remove('eds-modal-open');
    },
  };

  // Wire close actions
  closeBtn?.addEventListener('click', api.close);
  // Close when any link is clicked
  dialog.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', api.close));

  return api;
}

// Sticky "See More" button (mobile only)
function ensureMobileSeeMoreButton(modalApi) {
  let bar = document.querySelector('.eds-see-more');
  if (!bar) {
    bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'eds-see-more';
    bar.innerHTML = '<span class="eds-see-more__label">See More</span> <span class="eds-see-more__chev">▲</span>';
    document.body.appendChild(bar);
  }
  bar.addEventListener('click', () => {
    const isOpen = modalApi.root.classList.contains('active');
    if (isOpen) {
      modalApi.close();
      bar.querySelector('.eds-see-more__chev').textContent = '▲';
      bar.setAttribute('aria-expanded', 'false');
    } else {
      modalApi.open();
      bar.querySelector('.eds-see-more__chev').textContent = '▼';
      bar.setAttribute('aria-expanded', 'true');
    }
  });
  return bar;
}

function createCTA() {
  const ctaDivContainer = createDomElement('div', 'cta-container');
  const ulTag = createDomElement('ul', 'tier-2-cta');
  let hasCTA = false;
  if (btn1) {
    let liTag = createDomElement('li', '');
    liTag = createSubCTA(liTag, btn1, hasSubCTA1, btn1subCTA1, btn1subCTA2, subNavTitle1);
    ulTag.append(liTag);
    hasCTA = true;
  }
  if (btn2) {
    let liTag = createDomElement('li', '');
    liTag = createSubCTA(liTag, btn2, hasSubCTA2, btn2subCTA1, btn2subCTA2, subNavTitle2);
    ulTag.append(liTag);
    hasCTA = true;
  }
  if (btn3) {
    let liTag = createDomElement('li', '');
    liTag = createSubCTA(liTag, btn3, hasSubCTA3, btn3subCTA1, btn3subCTA2, subNavTitle3);
    ulTag.append(liTag);
    hasCTA = true;
  }
  return { ctaDivContainer, ulTag: hasCTA ? ulTag : null };
}

function getInnerLayDiv(bc) {
  const innerlayDiv = createDomElement('div', 'innerlay');
  if (schoolName && schoolName.length > 0) {
    const headingTag = createDomElement('h1', 't2-page-header');
    const spanTag = createDomElement('span', 'child,you-are-here');
    spanTag.textContent = schoolName;
    headingTag.append(spanTag);
    const titleTag = createDomElement('div', 'schoolDeptTitle');
    titleTag.textContent = schoolName;
    innerlayDiv.append(headingTag);
    innerlayDiv.append(titleTag);
  } else if (bc) {
    innerlayDiv.append(bc);
  }
  const { ctaDivContainer, ulTag } = createCTA();
  if (ulTag) {
    ctaDivContainer.append(ulTag);
  }
  innerlayDiv.append(ctaDivContainer);
  return innerlayDiv;
}

export default async function decorate(block) {
  const blockChildren = Array.from(block?.children || []).slice(1);
  const pathTitleMap = await fetchPathsAndTitles().catch(() => null);
  let breadcrumbItems;

  // First it will check the query-index.json file and if not present will read sitemap.xml
  // and fetch the page titles from the URLs in the sitemap.
  if (pathTitleMap && pathTitleMap.size > 0) {
    breadcrumbItems = buildBreadcrumbs(pathTitleMap);
  } else {
    breadcrumbItems = await buildBreadcrumbsFromSitemap();
  }

  if (isMobileView()) {
    waitForHeaderBlock()
      .then((header) => {
        if (!header) return;
        setFields(blockChildren);
        ensureMobileHeader({
          breadcrumbItems,
          pageTitle: title || schoolName || '',
          header: header.parentElement || document.body,
          cssHref: `${window.hlx.codeBasePath}/blocks/tier2header/tier2header-mobile.css`,
        });
        wireMobileNavbarToggle(header.parentElement
          || document, header.parentElement?.parentElement || document);
        watchMobileHeaderOffset(header.parentElement || document);

        // Mobile-only "See More" modal
        const modalApi = createSeeMoreModalFromProvidedDOM();
        ensureMobileSeeMoreButton(modalApi);

        block.textContent = '';
      })
      .catch(() => {});
  } else if (blockChildren) {
    setFields(blockChildren);
    subNavBlock = block;
    block.classList.add('affix-top');

    if (schoolName && schoolName.length > 0) {
      subNavBlock.classList.add('has-school');
      breadcrumbContainer = await createBreadcrumbsForTier2Header(breadcrumbItems, schoolName);
    } else if (title && title.length > 0) {
      subNavBlock.classList.add('no-school');
      breadcrumbContainer = await createBreadcrumbsForTier2Header(breadcrumbItems, title);
    }

    const ombreDiv = createDomElement('div', 'header-ombre');
    const subNavDivContainer = createDomElement('div', 'sub-header,row,row-center');

    const imgEl = image?.querySelector?.('picture img');
    subNavDivContainer.style.backgroundImage = imgEl?.src ? `url(${imgEl.src})` : '';

    const element = block.parentElement;

    if (imgEl?.src) {
      subNavBlock.classList.add('has-image');
    } else {
      subNavBlock.classList.add('affix-top');
      subNavBlock.classList.add('no-image');
    }

    if (element && element.classList.contains('subnav-wrapper')) {
      element.classList.add('subnav-wrapper-full-width');
    }

    const overlayDiv = createDomElement('div', 'overlay');
    const innerlayDiv = getInnerLayDiv(breadcrumbContainer);
    overlayDiv.append(innerlayDiv);
    subNavDivContainer.append(overlayDiv);

    block.textContent = '';
    block.append(ombreDiv);
    block.append(subNavDivContainer);
  }
}
