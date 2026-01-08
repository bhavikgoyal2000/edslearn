import { createDomElement } from '../../scripts/util.js';
import createBreadcrumbs, {
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

const chatChannelMap = {
  SOE: 'https://alive5.com/chat_window_wrap.html?wid=4387c7ed-ae2d-4606-b022-04d9ae2ab50c&thread_crm_id=ae27db13-57f4-3a27-e335-c886f61667eb|cb0f60cf-2c4e-a105-85a0-05b2310cd40f',
  CAS: 'https://alive5.com/chat_window_wrap.html?wid=68f793d4-6f89-4771-8e28-e5e569accc34&thread_crm_id=44235f3d-2831-9687-2eb4-4c370c6759b8|e6082058-5f37-30e6-a514-e8ed7f0fa0b3',
  KSB: 'https://alive5.com/chat_window_wrap.html?wid=eecb2be8-4fcb-4351-b5af-d07ae4e30b6c&thread_crm_id=62150d38-b7fd-0d88-e22a-7578d731d0ee|946b8349-8a6c-4427-110f-a2a54f46a595',
  SOC: 'https://alive5.com/chat_window_wrap.html?wid=24510386-b262-4c46-84bf-a6cd760ac20c&thread_crm_id=c1453d6f-effb-97a4-0b71-8826c3478d58|2a9d9e0f-8cc7-2df1-cdc4-05b53189cb5b',
  SIS: 'https://alive5.com/chat_window_wrap.html?wid=1ebc348b-9269-42f8-8400-a0625ee88d49&thread_crm_id=2d1e6e41-57d4-64f1-9d94-c3005d043838|1ae9a0a6-e63d-d6ef-ad8a-df92ac01af85',
  SPA: 'https://alive5.com/chat_window_wrap.html?wid=699d0c60-2f67-4884-8742-21958e2be5f6&thread_crm_id=84336bab-0688-d967-08db-e408d681ef75|17959a91-2f36-0d2b-e753-2258e08d72f5',
  UC: 'https://alive5.com/chat_window_wrap.html?wid=128c369f-a6c4-4a8d-b377-55f04aa1c6f2&thread_crm_id=0177dc1a-30f9-8651-66bf-a163b311e1ee|0de0731f-a23d-5a1d-8004-17a187402b09',
  'CAS-Advising':
    'https://alive5.com/chat_window_wrap.html?wid=b3220c08-6d56-4ef4-8490-975fb2d3ceeb&thread_crm_id=c93745d5-697c-c416-a30c-a96ad0bdf802|4ae66f07-380c-7bc9-cd12-b388c33781fd',
  'it-helpdesk':
    'https://alive5.com/chat_window_wrap.html?wid=b3220c08-6d56-4ef4-8490-975fb2d3ceeb&thread_crm_id=c93745d5-697c-c416-a30c-a96ad0bdf802|4ae66f07-380c-7bc9-cd12-b388c33781fd',
};

function loadScript(src, widValue) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = 'a5widget';
    script.setAttribute('data-widget_code_id', widValue);
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function fetchCtaContent(div) {
  let link = null;
  let textContent = null;
  const linkElem = div?.querySelector('p a');
  if (linkElem) {
    link = linkElem.getAttribute('href');
    // fallback to link text if title is not authored
    textContent = linkElem.getAttribute('title') || (linkElem.textContent || '').trim();
  }
  return { link, textContent };
}

window.addEventListener('scroll', () => {
  if (!subNavBlock) return;
  const scrolled = (window.pageYOffset || document.documentElement.scrollTop) > 0;
  subNavBlock.classList.toggle('affix', scrolled);
  subNavBlock.classList.toggle('affix-top', !scrolled);
});

function createSeeMoreModalFromProvidedDOM(btn1, btn2, btn3) {
  const authored = [];

  const c1 = btn1 ? fetchCtaContent(btn1) : null;
  if (c1?.link && c1?.textContent) authored.push({ type: 'link', href: c1.link, label: c1.textContent });

  const c2 = btn2 ? fetchCtaContent(btn2) : null;
  if (c2?.link && c2?.textContent) authored.push({ type: 'link', href: c2.link, label: c2.textContent });

  const chatP = btn3 && btn3.querySelector ? btn3.querySelector('p') : null;
  if (chatP) authored.push({ type: 'chat', channelText: chatP.textContent.trim() });

  // Only first two items for mobile
  const items = authored.slice(0, 2);
  if (!items.length) return;

  const mainElement = document.querySelector('main#main-container') || document.querySelector('#main-container');
  if (!mainElement) return;

  mainElement.querySelector('ul.tier-3-cta.fixed-bottom')?.remove();

  const ul = document.createElement('ul');
  ul.className = 'tier-3-cta fixed-bottom';
  if (items.length === 1) ul.classList.add('single');

  items.forEach((it) => {
    const li = document.createElement('li');

    if (it.type === 'chat') {
      const aTag = createDomElement('a', 'btn,btn-cta,btn-school,single-line,alive-chat', '', {
        href: '#',
      });
      const iTag = createDomElement('i', 'ion-ios-chatboxes,ion-lg', '', {
        'aria-hidden': 'true',
      });
      aTag.append(iTag, document.createTextNode(' Chat'));
      aTag.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.A5_WIDGET_ACTIONS?.showWidget) window.A5_WIDGET_ACTIONS.showWidget();
      });
      li.appendChild(aTag);
      ul.appendChild(li);

      const channelKey = it.channelText || 'SOE';
      const chatChannelUrl = chatChannelMap[channelKey] || channelKey;
      const widMatch = chatChannelUrl.match(/wid=([^&]+)&thread/);
      const widValue = widMatch ? widMatch[1] : '';
      loadScript('https://alive5.com/js/a5app.js', widValue);
    } else {
      const a = createDomElement(
        'a',
        'btn,btn-cta,btn-school,single-line',
        it.label,
        {
          href: it.href,
          'data-track-gtm': `tier3-cta|${it.label}|${it.href}`,
        },
      );
      li.appendChild(a);
      ul.appendChild(li);
    }
  });

  mainElement.appendChild(ul);
}
function createCTA(CTA1Obj, CTA2Obj, chatBtnObj) {
  const ulTag = createDomElement('ul', 'tier-3-cta');
  let isCTAPresent = false;
  if (CTA1Obj && CTA1Obj.querySelector('p a')) {
    const liTag = createDomElement('li', '');
    const singleLineClass = 'btn,btn-cta,btn-school,single-line';
    const { link, textContent } = fetchCtaContent(CTA1Obj);
    const aTag = createDomElement('a', singleLineClass, textContent, { href: link });
    liTag.append(aTag);
    ulTag.append(liTag);
    isCTAPresent = true;
  }

  if (CTA2Obj && CTA2Obj.querySelector('p a')) {
    const liTag = createDomElement('li', '');
    const singleLineClass = 'btn,btn-cta,btn-school,single-line';
    const { link, textContent } = fetchCtaContent(CTA2Obj);
    const aTag = createDomElement('a', singleLineClass, textContent, { href: link });
    liTag.append(aTag);
    ulTag.append(liTag);
    isCTAPresent = true;
  }

  if (chatBtnObj && chatBtnObj.querySelector('p')) {
    const liTag = createDomElement('li', '');
    const classes = 'btn,btn-cta,btn-school,single-line,alive-chat';
    const aTag = createDomElement('a', classes, '', { href: '#' }); // no-script-url
    const iTag = createDomElement('i', 'ion-ios-chatboxes,ion-lg', '', { 'aria-hidden': 'true' });

    // icon first, then text
    aTag.append(iTag, document.createTextNode(' Chat'));

    // wire click (no inline JS)
    aTag.addEventListener('click', (e) => {
      e.preventDefault();
      // eslint-disable-next-line no-undef
      if (window.A5_WIDGET_ACTIONS?.showWidget) window.A5_WIDGET_ACTIONS.showWidget();
    });

    liTag.append(aTag);
    ulTag.append(liTag);
    isCTAPresent = true;
    const chatChannel = chatBtnObj.querySelector('p')?.textContent.trim() || 'SOE';

    const chatChannelUrl = chatChannelMap[chatChannel] || chatChannel;
    const widMatch = chatChannelUrl.match(/wid=([^&]+)&thread/);
    const widValue = widMatch ? widMatch[1] : '';
    loadScript('https://alive5.com/js/a5app.js', widValue);
  }

  return isCTAPresent ? ulTag : null;
}

export default async function decorate(block) {
  const blockChildren = Array.from(block.children).slice(1);
  const pathTitleMap = await fetchPathsAndTitles();
  let breadcrumbItems;
  // First it will check the query-index.json file and if not present will read sitemap.xml
  // and fetch the page titles from the URLs in the sitemap.
  if (pathTitleMap && pathTitleMap.size > 0) {
    breadcrumbItems = buildBreadcrumbs(pathTitleMap);
  } else {
    breadcrumbItems = await buildBreadcrumbsFromSitemap();
  }

  // remove unused variable
  const [titleObj, isMarketingPageObj, showBreadCrumbOnMarketingPageObj, CTA1Obj,
    CTA2Obj, chatBtnObj] = blockChildren;

  if (isMobileView()) {
    waitForHeaderBlock()
      .then((header) => {
        ensureMobileHeader({
          breadcrumbItems,
          pageTitle: titleObj.querySelector('p')?.textContent,
          header: header.parentElement,
          cssHref: `${window.hlx.codeBasePath}/blocks/tier3header/tier3header-mobile.css`,
        });
        wireMobileNavbarToggle(header.parentElement, header.parentElement.parentElement);
        watchMobileHeaderOffset(header.parentElement);
        // Build CTAs and attach mobile-only fixed-bottom bar
        createSeeMoreModalFromProvidedDOM(CTA1Obj, CTA2Obj, chatBtnObj);
        block.textContent = '';
      })
      .catch(() => {});
  } else if (blockChildren) {
    subNavBlock = block;
    block.classList.add('affix-top');
    const ombreDiv = createDomElement('div', 'tier-3-header-ombre');
    const subNavDivContainer = createDomElement('div', 'sub-header,row,row-center');
    const element = block.parentElement;

    breadcrumbContainer = await createBreadcrumbs(
      breadcrumbItems,
      titleObj?.querySelector('p')?.textContent,
      isMarketingPageObj?.querySelector('p')?.textContent,
      showBreadCrumbOnMarketingPageObj?.querySelector('p')?.textContent,
    );
    subNavBlock.classList.add('affix-top');
    subNavBlock.classList.add('bg-school-primary');
    if (element && element.classList.contains('subnav-wrapper')) {
      element.classList.add('subnav-wrapper-full-width');
    }

    const overlayDiv = createDomElement('div', 'overlay');
    const ulTag = createCTA(CTA1Obj, CTA2Obj, chatBtnObj);
    const ctaDivContainer = createDomElement('div', 'cta-container');
    if (ulTag) {
      ctaDivContainer.append(ulTag);
    }
    overlayDiv.append(breadcrumbContainer);
    overlayDiv.append(ctaDivContainer);
    subNavDivContainer.append(overlayDiv);

    block.textContent = '';
    block.append(ombreDiv);
    block.append(subNavDivContainer);
  }
}
