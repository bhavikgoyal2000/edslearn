import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { fetchFooterData } from '../../scripts/graphql-api.js';

function appendAddress(addressTextLine1, addressTextLine2) {
  const addAddresss = document.createElement('address');
  addAddresss.innerHTML = `${addressTextLine1}<br>${addressTextLine2}`;

  return addAddresss;
}

function addNavLinks(linkArray) {
  const linkList = document.createElement('ul');
  linkList.className = 'clearfix';

  linkArray.forEach((link) => {
    const linkJSON = JSON.parse(link);
    const listItem = document.createElement('li');
    const linkElement = document.createElement('a');
    linkElement.href = linkJSON.footerNavUrlSMF;
    linkElement.textContent = linkJSON.footerNavTitleSMF;
    listItem.appendChild(linkElement);
    linkList.appendChild(listItem);
  });

  return linkList;
}

function addMagazineNavLinks(linkArray) {
  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = 'clearfix';
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row-center';
  wrapperDiv.appendChild(rowDiv);

  const linkList = document.createElement('ul');

  linkArray.forEach((link, index) => {
    const linkJSON = JSON.parse(link);
    const listItem = document.createElement('li');
    const linkElement = document.createElement('a');
    linkElement.href = linkJSON.footerNavUrlSMF;
    linkElement.textContent = linkJSON.footerNavTitleSMF;

    // Add forward icon only in the last item
    if (index === linkArray.length - 1) {
      linkElement.innerHTML += '<span class=\'ion-ios-arrow-forward\'></span><span class=\'ion-ios-arrow-forward\'></span><span class=\'sr-only\'> External Link</span>';
    }

    listItem.appendChild(linkElement);
    linkList.appendChild(listItem);
  });

  rowDiv.appendChild(linkList);
  return wrapperDiv;
}

function addPolicyLinks(linkArray) {
  const linkList = document.createElement('ul');
  linkList.className = 'clearfix';

  linkArray.forEach((link) => {
    const linkJSON = JSON.parse(link);
    const listItem = document.createElement('li');
    const linkElement = document.createElement('a');
    linkElement.href = linkJSON.footerPolicyNavUrl;
    linkElement.textContent = linkJSON.footerPolicyNavTitle;
    listItem.appendChild(linkElement);
    linkList.appendChild(listItem);
  });

  return linkList;
}

function addCopyText(copyrightText) {
  const copyText = document.createElement('p');
  copyText.textContent = copyrightText.plaintext;

  return copyText;
}

function getSocialIconClassAndName(social) {
  let className = 'fab';
  let name = '';
  switch (true) {
    case social.socialMediaLink.includes('facebook'):
      className = 'fab fa-facebook-f';
      name = 'Facebook';
      break;
    case social.socialMediaLink.includes('twitter'):
      className = 'fa-brands fa-x-twitter';
      name = 'Twitter';
      break;
    case social.socialMediaLink.includes('youtube'):
      className = 'fab fa-youtube';
      name = 'YouTube';
      break;
    case social.socialMediaLink.includes('linkedin'):
      className = 'fab fa-linkedin-in';
      name = 'LinkedIn';
      break;
    case social.socialMediaLink.includes('instagram'):
      className = 'fab fa-instagram';
      name = 'Instagram';
      break;
    default:
      name = 'Social';
      break;
  }
  return { className, name };
}

function appendSocialLinks(socialLinks) {
  const socialLinkList = document.createElement('div');
  socialLinkList.className = 'social';
  const ulTag = document.createElement('ul');
  socialLinks.forEach((social) => {
    const socialJSON = JSON.parse(social);
    const socialList = document.createElement('li');
    const socialLink = document.createElement('a');
    socialLink.href = socialJSON.socialMediaLink;

    const { className, name } = getSocialIconClassAndName(socialJSON);
    const i = document.createElement('i');
    const s = document.createElement('span');
    s.className = 'sr-only';
    i.className = className;
    i.setAttribute('aria-hidden', 'true');
    s.textContent = name;
    socialLink.appendChild(i);
    socialLink.appendChild(s);
    socialList.appendChild(socialLink);
    ulTag.appendChild(socialList);
  });
  socialLinkList.append(ulTag);
  return socialLinkList;
}

function appendLogo(pictureTag) {
  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.className = 'logo';
  const logoPic = createOptimizedPicture(pictureTag.src, pictureTag.alt, false, [{ width: '750' }]);
  const s = document.createElement('span');
  s.className = 'sr-only';
  s.textContent = 'Homepage';
  logoLink.appendChild(logoPic);
  logoLink.appendChild(s);

  return logoLink;
}

function buildGlobalFooter(data, pictureTag, bgColor, isHomePage) {
  const footer = document.createElement('footer');
  footer.className = 'footer-container';
  footer.id = 'site-footer';
  footer.setAttribute('role', 'contentinfo');
  if (bgColor.bgColorClass === 'bg-custom-color' && bgColor.customColorCode) {
    footer.style.backgroundColor = bgColor.customColorCode.textContent.trim();
  } else if (bgColor.bgColorClass && !isHomePage) {
    footer.classList.add(bgColor.bgColorClass);
  } else {
    footer.classList.add('bg-footer-grey-color');
  }

  if (!isHomePage) {
    footer.classList.add('inner-footer');
  }

  const row = document.createElement('div');
  row.id = 'ftr-flex-context';
  row.className = 'row row-center';

  const col1 = document.createElement('div');
  col1.className = 'col-md-4 col-sm-12 col-xs-12 no-bs-padding';
  col1.id = 'ftr-address-policies';

  const col2 = document.createElement('div');
  col2.className = 'col-lg-4 col-md-4 col-sm-12 col-xs-12 no-bs-padding';
  col2.id = 'ftr-social-blogs';

  const col3 = document.createElement('div');
  col3.className = 'col-md-4 col-sm-12 col-xs-12 no-bs-padding';
  col3.id = 'ftr-logo-home';

  const addAddresss = appendAddress(data.footerAddressLine1, data.footerAddressLine2);
  const links = data.footerNavLinkSMF ? addNavLinks(data.footerNavLinkSMF) : document.createElement('ul');
  const policyDiv = document.createElement('div');
  policyDiv.className = 'policies';
  const copyText = data.footerCopyrightText ? addCopyText(data.footerCopyrightText) : document.createElement('p');
  const policyLinks = data.footerPolicyLinkSMF ? addPolicyLinks(data.footerPolicyLinkSMF) : document.createElement('ul');

  const socialLinks = data.footerSocialLinkSMF ? appendSocialLinks(data.footerSocialLinkSMF) : document.createElement('div');

  const logo = appendLogo(pictureTag);

  // append dom in col1
  copyText.appendChild(policyLinks);
  policyDiv.appendChild(copyText);
  col1.appendChild(addAddresss);
  col1.appendChild(links);
  col1.appendChild(policyDiv);

  // append dom in col2
  col2.appendChild(socialLinks);

  // append dom in col3
  col3.appendChild(logo);

  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  // Add footer-based back-to-top button
  const backToTopAlt = document.createElement('a');
  backToTopAlt.href = '#main-container';
  backToTopAlt.title = 'Back to top';
  backToTopAlt.className = 'button back-to-top-footer';

  backToTopAlt.innerText = 'Back to top';

  const icon = document.createElement('span');
  icon.className = 'ion-chevron-up';
  backToTopAlt.appendChild(icon);

  row.appendChild(backToTopAlt);
  footer.appendChild(row);
  return footer;
}

function buildMagazineFooter(data, pictureTag, bgColor, isHomePage) {
  const footerDiv = document.createElement('div');
  footerDiv.classList.add('magazine-footer', 'container-fluid');
  footerDiv.id = 'magazine-footer';
  footerDiv.setAttribute('role', 'magazineinfo');

  const footerStrip = '<div class=\'stripe-bar bg-vertical-gray\'></div>';
  footerDiv.innerHTML = footerStrip;

  const links = data.footerNavLinkSMF ? addMagazineNavLinks(data.footerNavLinkSMF) : document.createElement('ul');
  footerDiv.appendChild(links);

  const logoAddressDiv = document.createElement('div');
  logoAddressDiv.className = 'clearfix';
  logoAddressDiv.id = 'logo-address';
  if (bgColor.bgColorClass === 'bg-custom-color' && bgColor.customColorCode) {
    logoAddressDiv.style.backgroundColor = bgColor.customColorCode.textContent.trim();
  } else if (bgColor.bgColorClass && !isHomePage) {
    logoAddressDiv.classList.add(bgColor.bgColorClass);
  } else {
    logoAddressDiv.classList.add('bg-black-color');
  }

  const rowDiv = document.createElement('div');
  rowDiv.className = 'row row-center';
  const col1 = document.createElement('div');
  col1.className = 'col-12 col-sm-6';
  const logo = appendLogo(pictureTag);
  col1.appendChild(logo);

  const col2 = document.createElement('div');
  col2.className = 'col-sm-2 col-md-2 col-lg-3';

  const col3 = document.createElement('div');
  col3.className = 'col-12 col-sm-4 col-md-4 col-lg-3';
  const addAddresss = data.footerAddressLine1 ? appendAddress(data.footerAddressLine1, data.footerAddressLine2) : document.createElement('address');
  const copyText = data.footerCopyrightText ? addCopyText(data.footerCopyrightText) : document.createElement('p');
  const policyLinks = data.footerPolicyLinkSMF ? addPolicyLinks(data.footerPolicyLinkSMF) : document.createElement('ul');
  col3.appendChild(addAddresss);
  col3.appendChild(copyText);
  col3.appendChild(policyLinks);

  rowDiv.appendChild(col1);
  rowDiv.appendChild(col2);
  rowDiv.appendChild(col3);
  logoAddressDiv.appendChild(rowDiv);
  footerDiv.appendChild(logoAddressDiv);

  return footerDiv;
}

function extractBgColor(container) {
  const elements = container.querySelectorAll('*');
  let bgColorClass = null;
  let customColorCode = null;

  elements.forEach((element) => {
    const textContent = element.textContent.trim();
    if (textContent.includes('bg-')) {
      bgColorClass = textContent;
    }
  });

  if (bgColorClass === 'bg-custom-color') {
    const aTags = container.querySelectorAll('a');
    customColorCode = Array.from(aTags).find((a) => a.textContent.trim().startsWith('#'));
  }

  return { bgColorClass, customColorCode };
}

function extractContentFragment(container) {
  const elements = container.querySelectorAll('*');
  let path = null;

  elements.forEach((element) => {
    const textContent = element.textContent.trim();
    if (textContent.includes('/content/dam')) {
      path = textContent;
    }
  });

  return path;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const pictureTag = fragment.firstElementChild.querySelector('picture > img');
  const bgColor = extractBgColor(fragment);
  const contentFragementPath = extractContentFragment(fragment);

  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath.startsWith('/index.html') || currentPath.endsWith('/content/au/index.html');
  const isMagazinePage = currentPath.startsWith('/magazine') || currentPath.includes('/magazine/');

  block.textContent = '';

  const data = await fetchFooterData(contentFragementPath);
  let footerDom;
  if (!isMagazinePage) {
    block.classList.add('global-footer');
    footerDom = buildGlobalFooter(data, pictureTag, bgColor, isHomePage);
  } else {
    block.classList.add('magazine-footer');
    footerDom = buildMagazineFooter(data, pictureTag, bgColor, isHomePage);
  }

  block.appendChild(footerDom);
}
