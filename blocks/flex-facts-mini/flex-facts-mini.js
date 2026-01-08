import { moveInstrumentation } from '../../scripts/scripts.js';
import { addMiniFlexParentClasses } from '../../scripts/util.js';

function fetchFactData(item) {
  const paragraphs = Array.from(item.querySelectorAll('p'));
  const values = {
    elementSize: '',
    layoutStyle: '',
    backgroundColor: '',
    textAboveFocus: '',
    factFocalText: '',
    textBelowFocus: '',
    attributionUrl: '',
    attributionText: '',
    attributionTextCite: false,
  };

  if (paragraphs.length === 0) return values;

  let currentIndex = 0;

  // Step 1: elementSize (always first)
  const sizeText = paragraphs[currentIndex]?.textContent.trim();
  if (!sizeText.startsWith('size-')) return values;
  values.elementSize = sizeText;
  currentIndex += 1;

  // Step 2: Check if this is layoutStyle or textAboveFocus
  let possibleText = paragraphs[currentIndex]?.textContent.trim();
  if (!possibleText) return values;

  if (possibleText.startsWith('ls-')) {
    // This is layoutStyle
    values.layoutStyle = possibleText.replace('ls-', 'fact-');
    currentIndex += 1;
  } else {
    // This is textAboveFocus
    values.textAboveFocus = possibleText;
    currentIndex += 1;

    // Now next must be layoutStyle
    possibleText = paragraphs[currentIndex]?.textContent.trim();
    if (possibleText?.startsWith('ls-')) {
      values.layoutStyle = possibleText.replace('ls-', 'fact-');
      currentIndex += 1;
    } else {
      // Invalid structure, layoutStyle is required
      return values;
    }
  }

  // Step 3: If mini, check for backgroundColor
  const isMini = values.elementSize === 'size-mini-bg' || values.elementSize === 'size-mini-outline';
  if (isMini) {
    const bgText = paragraphs[currentIndex]?.textContent.trim();
    if (bgText?.startsWith('bg-') || bgText?.startsWith('outline-')) {
      values.backgroundColor = bgText;
      currentIndex += 1;
    }
  }

  // Step 4: factFocalText (always required after layoutStyle [+ bg if mini])
  const focalText = paragraphs[currentIndex]?.textContent.trim();
  if (focalText) {
    values.factFocalText = focalText;
    currentIndex += 1;
  }

  // Step 5: Remaining paragraphs
  const remainingParas = paragraphs.slice(currentIndex);

  // Step 6: Find and extract footer flag para
  let footerFlagPara = null;
  let footerFlags = [];

  remainingParas.forEach((p) => {
    const text = p.textContent.trim().toLowerCase();
    if (text.includes('footnote')) {
      footerFlagPara = p;
      footerFlags = text.split(',').map((f) => f.trim());
    }
  });

  const hasAttributionFlag = footerFlags.includes('footnote') || footerFlags.includes('footer note attribution text');
  const hasCiteFlag = footerFlags.includes('cite');

  // Step 7: Find attribution URL
  const linkPara = paragraphs.find((p) => p.querySelector('a'));
  const linkEl = linkPara?.querySelector('a');
  if (linkEl) {
    values.attributionUrl = linkEl.getAttribute('href') || '';
  }

  // Step 8: Clean usable paragraphs
  const cleanParas = remainingParas.filter((p) => p !== footerFlagPara && p !== linkPara && !['true', 'false'].includes(p.textContent.trim().toLowerCase()) && !p.textContent.trim().toLowerCase().includes('footnote') && !p.textContent.trim().toLowerCase().includes('cite'));

  const paraCount = cleanParas.length;

  // Step 9: Assign textBelowFocus and attributionText
  if (paraCount === 1) {
    const onlyText = cleanParas[0].textContent.trim();
    if (hasAttributionFlag) {
      values.attributionText = onlyText;
    } else {
      values.textBelowFocus = onlyText;
    }
  } else if (paraCount >= 2) {
    values.textBelowFocus = cleanParas[0].textContent.trim();
    values.attributionText = cleanParas[1].textContent.trim();
  }

  // Step 10: Set citation flag
  values.attributionTextCite = hasCiteFlag;

  return values;
}

function createSpan(className, text = '') {
  const span = document.createElement('span');
  span.className = className;
  if (text) span.textContent = text;
  return span;
}

function createFactFocus(layoutStyle, factFocalText) {
  const focus = createSpan('fact-focus');
  const safeText = factFocalText || '';

  switch (layoutStyle) {
    case 'fact-ranking':
      focus.appendChild(createSpan('pound'));
      focus.appendChild(createSpan('sr-only', 'number '));
      focus.appendChild(document.createTextNode(safeText));
      break;

    case 'fact-percentage':
      focus.appendChild(document.createTextNode(safeText));
      focus.appendChild(createSpan('percent'));
      focus.appendChild(createSpan('sr-only', ' percent'));
      break;

    case 'fact-ratio': {
      const [left, right = '1'] = factFocalText.split(':');
      focus.appendChild(document.createTextNode(left));
      focus.appendChild(createSpan('ratio'));
      focus.appendChild(createSpan('sr-only', ' to '));
      focus.appendChild(document.createTextNode(right));
      break;
    }

    case 'fact-number-plus':
      focus.appendChild(document.createTextNode(safeText));
      focus.appendChild(createSpan('plus'));
      focus.appendChild(createSpan('sr-only', ' plus'));
      break;

    case 'fact-dollar-amount':
      focus.appendChild(createSpan('dollar'));
      focus.appendChild(createSpan('sr-only', ' $'));
      focus.appendChild(createSpan('dollar-val', safeText));
      break;

    default:
      focus.textContent = safeText;
  }

  return focus;
}

function createAttribution(attributionText, citationRequired) {
  const p = document.createElement('p');
  p.className = 'fact-attrib';
  if (citationRequired) {
    const cite = document.createElement('cite');
    cite.textContent = attributionText;
    p.appendChild(cite);
  } else {
    p.textContent = attributionText;
  }
  return p;
}

function buildFactItem({
  elementSize,
  layoutStyle,
  backgroundColor,
  textAboveFocus,
  factFocalText,
  textBelowFocus,
  attributionUrl,
  attributionText,
  attributionTextCite,
}) {
  const isMini = elementSize === 'size-mini-bg' || elementSize === 'size-mini-outline';
  const isStandard = elementSize === 'size-standard';
  const article = document.createElement('article');
  article.className = isMini
    ? 'el-mini-flex-item'
    : 'el-flex-item flex-left no-bs-padding';

  const anchor = document.createElement('a');
  anchor.className = 'fact-link';
  if (attributionUrl) anchor.href = attributionUrl;

  const wrapper = document.createElement('div');
  wrapper.className = 'flex-fact tt';
  if (isStandard) {
    wrapper.classList.add(elementSize.replace('size-', ''));
  }
  wrapper.classList.add(layoutStyle);
  if (isMini && backgroundColor) {
    wrapper.classList.add(backgroundColor);
    wrapper.classList.add(elementSize.replace('size-', ''));
  }

  const topP = document.createElement('p');
  topP.className = 'flex-center';

  if (isMini) {
    // Mini layout: Only render focal and below
    topP.appendChild(createFactFocus(layoutStyle, factFocalText));
    wrapper.appendChild(topP);

    const belowSpan = createSpan('fact-below');
    if (textBelowFocus) belowSpan.textContent = textBelowFocus;
    wrapper.appendChild(belowSpan);
  } else {
    const isTextHeavy = layoutStyle === 'fact-text-heavy';

    if (isTextHeavy) {
      topP.appendChild(createSpan('fact-above', textAboveFocus));
      topP.appendChild(createSpan('fact-focus', factFocalText));
      topP.appendChild(createSpan('fact-below', textBelowFocus));
      wrapper.appendChild(topP);

      const ombre = document.createElement('div');
      ombre.className = 'below-below-ombre no-attrib with-fact-below';
      wrapper.appendChild(ombre);
      wrapper.appendChild(document.createElement('p')); // empty <p>
    } else {
      topP.appendChild(createSpan('fact-above', textAboveFocus));
      topP.appendChild(createFactFocus(layoutStyle, factFocalText));
      wrapper.appendChild(topP);

      const ombre = document.createElement('div');
      ombre.className = 'below-focus-ombre';
      wrapper.appendChild(ombre);

      const belowSpan = createSpan('fact-below');
      if (textBelowFocus) belowSpan.textContent = textBelowFocus;
      wrapper.appendChild(belowSpan);
    }

    // Only append attribution in non-mini
    wrapper.appendChild(createAttribution(attributionText, attributionTextCite));
  }

  if (attributionUrl) {
    anchor.appendChild(wrapper);
    article.appendChild(anchor);
  } else {
    article.appendChild(wrapper);
  }

  return article;
}

function isOverflowing(el) {
  return el.scrollWidth > el.clientWidth;
}

function applyDollarFontFixes() {
  const miniFacts = document.querySelectorAll('.el-mini-flex-item .fact-dollar-amount .fact-focus');
  miniFacts.forEach((focusEl) => {
    if (isOverflowing(focusEl)) {
      focusEl.classList.add('mini-dollar-amt', 'smaller-dollar-font');
    }
  });
}

export default function decorate(block) {
  const allDivs = Array.from(block.querySelectorAll(':scope > div'));

  if (allDivs.length === 0) return;

  // mark parent divs
  const factItemsParent = allDivs.slice(1);
  factItemsParent.forEach((parent) => {
    parent.classList.add('flex-facts-article');
  });

  const wrapper = document.createElement('section');
  wrapper.classList.add('el-flex-grid');

  const iconDivs = allDivs.slice(1);
  addMiniFlexParentClasses(block, iconDivs.length);

  iconDivs.forEach((item) => {
    const values = fetchFactData(item);
    let flexFactsElement;
    if (!values.elementSize && !values.factFocalText && !values.attributionUrl) {
      // case: new/empty item → render placeholder so it’s still selectable
      flexFactsElement = document.createElement('article');
      flexFactsElement.className = 'el-flex-item placeholder';
      flexFactsElement.innerHTML = `
        <div class="flex-fact placeholder-content">
          <p class="flex-center">
            <span class="fact-focal">Add icon</span>
          </p>
        </div>
      `;
    } else {
      // normal case
      flexFactsElement = buildFactItem(values);
    }
    // Preserve instrumentation for authoring support
    moveInstrumentation(item, flexFactsElement);

    wrapper.appendChild(flexFactsElement);
  });
  window.requestAnimationFrame(() => {
    applyDollarFontFixes();
  });

  block.textContent = '';
  block.appendChild(wrapper);
}
