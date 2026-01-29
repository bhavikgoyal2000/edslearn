/* global WebImporter */

import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';

const cssText  = `:root {
  --logo-blue: #004fa4;
  --logo-red: #ed1a3b;
  --red-dark: #5e1b15;
  --red-medium: #961e28;
  --red: #c4122f;
  --blue-dark: #0f2846;
  --blue: #13477d;
  --blue-light: #005099;
  --blue-pale: #c4d1df;
  --taupe: #7e6d5f;
  --taupe-dark: #4d4037;
  --taupe-light: #d0c4b6;
  --taupe-pale: #e2dfdb;
  --slate: #446c73;
  --slate-dark: #324448;
  --slate-light: #aabdbe;
  --slate-pale: #d9e1e3;
  --green: #526a3e;
  --green-dark: #526a3e;
  --green-light: #526a3e;
  --green-pale: #d6e2cf;
  --teal: #008290;
  --teal-dark: #00616c;
  --teal-light: #64c7c7;
  --teal-pale: #d9ecf3;
  --yellow: #eeb137;
  --yellow-dark: #bb7b0f;
  --yellow-light: #f4c74b;
  --yellow-pale: #fcf4e9;
  --warm-blue: #005578;
  --warm-blue-dark: #184359;
  --warm-blue-light: #006796;
  --warm-blue-pale: #d1d9de;
  --grey: #5e6769;
  --grey-dark: #414547;
  --grey-light: #99a3a6;
  --grey-pale: #d9dada;
  --orange: #d46b21;
  --default-border-color: #d2d2d2;
  --default-text: #343434;
  --default-heading: #4d4037;
  --default-subhead: #4d4037;
  --default-topic: #6d6d6d;
  --default-disabled: #8a95a5;
  --default-link: #005099;
  --default-link-hover: #0672b9;
  --default-link-visit: #13477d;
  --hover-collapse-color: #d9dce3;
  --school-primary: #13477d;
}
/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
/* 
	Variables from BRAND campaign:
*/
/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
/* 
	2022 Redesign Variables
*/
:root {
  --default-border-color: #d2d2d2;
  --default-text: #343434;
  --default-heading: #4d4037;
  --default-subhead: #4d4037;
  --default-topic: #6d6d6d;
  --default-disabled: #8a95a5;
  --default-link: #005099;
  --default-link-hover: #0672b9;
  --default-link-visit: #13477d;
  --hover-collapse-color: #d9dce3;
  --school-primary: #0672b9;
}
/* Facts Icon Touts *
===============

See Examples at [Flex: Facts](http://cms.american.edu/cptools/examples/flex-facts.cfm)
 
*/
.el-mini-flex-item .flex-icon {
  text-align: center;
  position: relative;
  padding: 25px;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
      flex-direction: column;
  -ms-flex-pack: center;
      justify-content: center;
}
.el-mini-flex-item .flex-icon.icon-cta {
  background-color: #3c208c !important;
}
.el-mini-flex-item .flex-icon.icon-cta span,
.el-mini-flex-item .flex-icon.icon-cta i {
  color: #fff !important;
}
.el-mini-flex-item .flex-icon.icon-cta-outline {
  background-color: #fff !important;
  border: 3px solid #3c208c !important;
}
.el-mini-flex-item .flex-icon.icon-cta-outline span,
.el-mini-flex-item .flex-icon.icon-cta-outline i {
  color: #3c208c !important;
}
.el-mini-flex-item .flex-icon.icon-cta-outline.active-state {
  border: 3px solid #3c208c !important;
}
.el-mini-flex-item .flex-icon.icon-primary {
  background-color: #005099 !important;
}
.el-mini-flex-item .flex-icon.icon-primary span,
.el-mini-flex-item .flex-icon.icon-primary i {
  color: #fff !important;
}
.el-mini-flex-item .flex-icon.icon-primary-outline {
  background-color: #fff !important;
  border: 3px solid #005099 !important;
}
.el-mini-flex-item .flex-icon.icon-primary-outline span,
.el-mini-flex-item .flex-icon.icon-primary-outline i {
  color: #005099 !important;
}
.el-mini-flex-item .flex-icon.icon-primary-outline.active-state {
  border: 3px solid #005099 !important;
}
.el-mini-flex-item .flex-icon.icon-secondary {
  background-color: #1c7f66 !important;
}
.el-mini-flex-item .flex-icon.icon-secondary span,
.el-mini-flex-item .flex-icon.icon-secondary i {
  color: #fff !important;
}
.el-mini-flex-item .flex-icon.icon-secondary-outline {
  background-color: #fff !important;
  border: 3px solid #1c7f66 !important;
}
.el-mini-flex-item .flex-icon.icon-secondary-outline span,
.el-mini-flex-item .flex-icon.icon-secondary-outline i {
  color: #1c7f66 !important;
}
.el-mini-flex-item .flex-icon.icon-secondary-outline.active-state {
  border: 3px solid #1c7f66 !important;
}
.el-mini-flex-item .flex-icon .flex-center {
  -ms-flex: 0 1 auto;
      flex: 0 1 auto;
  margin: 0;
}
.el-mini-flex-item .flex-icon .icon-focus {
  margin: 10px 0;
  position: relative;
  top: -20px;
  display: block;
}
.el-mini-flex-item .flex-icon .icon-focus i,
.el-mini-flex-item .flex-icon .icon-focus span {
  white-space: nowrap;
}
.el-mini-flex-item .flex-icon .text-below {
  position: absolute;
  top: 80px;
  left: 0;
  width: 100%;
  display: block;
  line-height: 1.7rem;
  font-weight: 700;
  font-size: 1.5rem;
  font-family: "GT Walsheim", Arial, sans-serif;
}
.el-mini-flex-item .flex-icon .fact-attrib {
  margin: 0 auto 0;
  text-align: center;
  font-weight: 700;
  font-family: "GT Walsheim", Arial, sans-serif;
  font-size: 6rem;
}
.el-mini-flex-item .flex-icon .pound,
.el-mini-flex-item .flex-icon .percent,
.el-mini-flex-item .flex-icon .ratio,
.el-mini-flex-item .flex-icon .plus,
.el-mini-flex-item .flex-icon .dollar {
  font-size: 3rem;
  line-height: 1em;
  position: relative;
  color: #1c7f66;
}
.el-mini-flex-item .flex-icon .pound:after,
.el-mini-flex-item .flex-icon .ratio:after,
.el-mini-flex-item .flex-icon .plus:after,
.el-mini-flex-item .flex-icon .dollar:after {
  font-size: 4.5rem;
  line-height: 1em;
  display: inline-block;
  margin: 0 5px;
  content: '';
}
.el-mini-flex-item .flex-icon .percent:after {
  font-size: 5.4rem;
  line-height: 1rem;
  display: inline-block;
  margin: 0 5px;
  content: '';
}
.el-mini-flex-item .flex-icon .pound:after {
  vertical-align: top;
  font-size: 2rem;
  line-height: 1.5em;
  content: '#';
  position: absolute;
  left: -2rem;
  top: -50%;
}
.el-mini-flex-item .flex-icon .percent:after {
  content: '%';
}
.el-mini-flex-item .flex-icon .dollar:after {
  content: '\f353';
  font-family: "Ionicons";
  font-size: 3rem;
}
.el-mini-flex-item .flex-icon .ratio:after {
  content: ':';
}
.el-mini-flex-item .flex-icon .plus:after {
  vertical-align: top;
  font-size: 2rem;
  line-height: 1.5em;
  content: '+';
}
.el-mini-flex-item .flex-icon.fact-big-number .icon-focus {
  font-size: 4.5rem;
  line-height: 0.9em;
}
.el-mini-flex-item .flex-icon.fact-dollar-amount .icon-focus {
  text-transform: lowercase;
  font-size: 4.5rem;
  line-height: 0.9em;
}
.el-mini-flex-item .flex-icon.fact-text-heavy .fact-above,
.el-mini-flex-item .flex-icon.fact-text-heavy .text-below {
  font-size: 3.6rem;
  line-height: 0.5em;
  font-family: "GT Walsheim", Arial, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.el-mini-flex-item .flex-icon.fact-text-heavy .icon-focus {
  line-height: 3.25rem;
  font-size: 2.625rem;
  font-family: "GT Walsheim", Arial, sans-serif;
  font-weight: 400;
  text-transform: none;
  white-space: normal;
  margin: 15px 0;
}
.el-mini-flex-item .flex-icon.link-hover:hover,
.el-mini-flex-item .flex-icon.link-hover:focus {
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 94%, #f4c74b 94%, #f4c74b 100%);
  text-decoration: none;
}
.el-mini-flex-item a.fact-link {
  text-decoration: none !important;
}
.el-mini-flex-item a.fact-link .fact-attrib {
  text-decoration: underline !important;
}
@media (min-width: 768px) {
  .el-mini-flex-item .flex-icon .fact-attrib {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin-bottom: 25px;
  }
}`

function loadColorMap() {
    const myMap = new Map();
    myMap.set('#1c7f66','bg-arboretum-green-color');
    myMap.set('#005099','bg-embassy-blue-color');
    myMap.set('#4918cd','bg-indigo-purple-color');
    myMap.set('#3c208c','bg-indigo-purple-color');
    return myMap;
}
function getColor(elementType, className) {
  let colorMap = loadColorMap();
  if (elementType === 'no-outline') {
    // Now matches icon-primary, icon-secondary, and icon-cta
    const selector = `\\.el-mini-flex-item\\s+\\.flex-icon\\.${className}`;
    const bgColor = getBackgroundColorFromCss(selector);
    if (!bgColor) return undefined;
    for (const [key, value] of colorMap) {
      if (key === bgColor) {
        return value;
      }
    }
    return undefined;
  } else {
    const selector = '\\.el-mini-flex-item\\s+\\.flex-icon\\.icon-(?:primary|secondary)-outline';
    const bgColor = getBackgroundColorFromCssForOutline(selector);
    if (!bgColor) return undefined;
    for (const [key, value] of colorMap) {
      if (key === bgColor) {
        return value;
      }
    }
    return undefined;
  }
}

function getBackgroundColorFromCssForOutline(selector) {
  // Capture only the color code after 'border:', ignoring width, style, !important, etc.
  // Matches: border: 3px solid #1c7f66 !important;
  const regex = new RegExp(
    `${selector}\\s*{[^}]*border:\\s*[^;#]*#([a-fA-F0-9]{6})\\s*(?:!important)?;`,
    'i'
  );
  const match = cssText.match(regex);
  return match ? `#${match[1]}` : undefined;
}

function getBackgroundColorFromCss(selector) {
  // Capture color code, ignore !important and spaces
  const regex = new RegExp(
    `${selector}\\s*{[^}]*background-color:\\s*(#[a-fA-F0-9]{6})\\s*(?:!important)?;`,
    'i'
  );
  const match = cssText.match(regex);
  return match ? match[1].trim() : undefined;
}

const mkP = (text = '', fieldName, className) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    if (className) {
      p.className = className;
    }
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(text);
    div.appendChild(p);
    }
    return div;
  };

const createItem = (flexIconMiniParent, document, params) => {
    let flexIconMiniItem = [];
    const { originalURL } = params;
    let ctaLinkElement = flexIconMiniParent.closest('a.fact-link') || '';
    let classes = flexIconMiniParent.classList;
    let flexIconMiniType = '';
    let color;
    if (classes.contains('icon-secondary') || classes.contains('icon-primary') || classes.contains('icon-cta')) {
      let classList = [...classes];
      color = getColor('no-outline', classList[classList.length-1]);
      if (color) {
        flexIconMiniType = 'size-mini-bg';
      }
    } else if (classes.contains('icon-primary-outline') || classes.contains('icon-secondary-outline')) {
      color = getColor('outline');
      if (color) {
        flexIconMiniType = 'size-mini-outline';
      }
    }
    const flexIconMiniPTags = flexIconMiniParent.querySelector(':scope > .flex-center');
    let iconFocus = flexIconMiniPTags?.querySelector('.icon-focus > i');
    let iconClassString = '';
    if (iconFocus) {
      let iconClasses = [...iconFocus.classList];
      iconClassString = iconClasses.slice(0, 2).join(' ');
    }
    
  const flexIconMiniBelow = flexIconMiniParent.querySelector('.text-below')?.textContent || '';

  const firstDiv = document.createElement('div');
  firstDiv.append(mkP(flexIconMiniType,'flexIcon_elementSize')); 
  firstDiv.append(mkP(iconClassString,'flexIcon_iconMini'));
  firstDiv.append(mkP(color,'flexIcon_BackgroundColor'));              
  firstDiv.append(mkP(flexIconMiniBelow, 'flexIcon_textbelowFocus'))
  
  let linkWrap;
  if (ctaLinkElement) {
    const a = document.createElement('a');
    a.href = removeCfm(ctaLinkElement.getAttribute('href')) || '';
    a.textContent = ctaLinkElement.textContent || '';
    linkWrap = mkP(a,'flexIcon_attributionUrl','button-container');
  }
  firstDiv.append(linkWrap);  

  if (firstDiv.textContent.trim() !== '') {
    flexIconMiniItem.push([firstDiv]);
    return flexIconMiniItem;
  }

    return undefined; // Return undefined if no valid content is found
};

export default createItem;