import createDataLayerEvent from '../../scripts/analytics-util.js';
import { fetchComponentData } from '../../scripts/graphql-api.js';
import { cleanAEMUrl } from '../../scripts/util.js';

const MOBILE_MAX = 600;
const isMobile = () => window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;

function loadSideNavMobileCSS() {
  if (!document.querySelector('link[data-sidenav-mobile]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${window.hlx.codeBasePath}/blocks/side-nav/side-nav-mobile.css`;
    link.setAttribute('data-sidenav-mobile', 'true');
    document.head.appendChild(link);
  }
}

export default async function decorate(block) {
  const contentFragmentPath = block.querySelector('p')?.textContent.trim() || null;
  const contentFragmentJson = await fetchComponentData('SideNav-GraphQL-Query', contentFragmentPath);
  const sections = contentFragmentJson.sideNavFragmentByPath.item;
  const nav = document.createElement('nav');
  nav.id = 'left-navigation';
  nav.className = 'accordion_content panel-collapse collapse';
  nav.setAttribute('aria-label', 'Left Navigation: Go deeper into this section of the site.');

  if (isMobile()) {
    loadSideNavMobileCSS();
    nav.style.display = 'none';
    nav.setAttribute('aria-hidden', 'true');
  } else {
    nav.style.display = 'block';
    nav.setAttribute('aria-hidden', 'false');
  }
  const ul = document.createElement('ul');
  ul.id = 'nav-accordion-holder';
  ul.className = 'sideAccordion content-navigation';

  sections.sidenavLinksCMF.forEach((sectionArray, index) => {
    const section = JSON.parse(sectionArray);

    // No nested links, valid href (not "#")
    if (
      Array.isArray(section.nested_sideNavLinks2CMF)
      && section.nested_sideNavLinks2CMF.length === 0
      && section.sideNavLinkCMF
      && section.sideNavLinkCMF !== '#'
    ) {
      const li = document.createElement('li');
      const p = document.createElement('p');
      const a = document.createElement('a');

      a.href = cleanAEMUrl(section.sideNavLinkCMF);
      a.textContent = section.sideNavTitleCMF;

      createDataLayerEvent('click', 'click', () => ({
        linkName: section.sideNavLinkCMF,
        linkURL: section.sideNavTitleCMF,
        linkType: 'nav',
        linkRegion: 'sidebar',
        componentName: 'Side Nav',
        componentId: 'side-nav',
      }), a);

      p.appendChild(a);
      li.appendChild(p);
      ul.appendChild(li);
      return;
    }

    // Has nested links or "#" as main link → set accordion logic
    const li = document.createElement('li');
    const p = document.createElement('p');

    const sectionId = `nav${index + 1}`;
    const link = document.createElement('a');
    link.href = `#${sectionId}`;
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', sectionId);
    link.id = `ctl${sectionId}`;
    link.className = 'collapsed';
    link.textContent = section.sideNavTitleCMF;

    // Create sublist
    let isSubList = false;
    const subUl = document.createElement('ul');
    subUl.id = sectionId;
    subUl.className = 'accordion_content panel-collapse collapse';
    subUl.setAttribute('aria-labelledby', link.id);
    subUl.setAttribute('aria-expanded', 'false');
    subUl.style.display = 'none'; // initially hidden

    section.nested_sideNavLinks2CMF.forEach((item) => {
      const subLi = document.createElement('li');
      const a = document.createElement('a');
      a.href = cleanAEMUrl(item.nested_sideNavLink);
      a.textContent = item.nested_sideNavTitle;

      createDataLayerEvent('click', 'click', () => ({
        linkName: item.nested_sideNavLink,
        linkURL: item.nested_sideNavTitle,
        linkType: 'nav',
        linkRegion: 'header',
        componentName: 'Top Nav',
        componentId: 'topnav',
      }), a);

      subLi.appendChild(a);
      subUl.appendChild(subLi);
      isSubList = true;
    });
    // Add toggle behavior
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = link.getAttribute('aria-expanded') === 'true';
      link.setAttribute('aria-expanded', String(!expanded));
      link.classList.toggle('collapsed', expanded);
      subUl.classList.toggle('collapse', expanded);
      subUl.style.display = expanded ? 'none' : 'block';
    });
    createDataLayerEvent('click', 'accordionToggle', () => {
      const expanded = link.getAttribute('aria-expanded') === 'true';
      const componentName = 'Side Navigation';
      const componentId = 'side-nav';
      const componentTitle = link.textContent;
      const state = expanded ? 'expanded' : 'collapsed';
      return {
        componentName,
        componentId,
        componentTitle,
        state,
      };
    }, link);

    p.appendChild(link);
    li.appendChild(p);
    if (isSubList) {
      li.appendChild(subUl);
      li.classList.add('has-submenu');
    }
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  block.textContent = '';
  block.appendChild(nav);
}
