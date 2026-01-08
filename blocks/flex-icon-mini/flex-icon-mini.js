import createDataLayerEvent from '../../scripts/analytics-util.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { addMiniFlexParentClasses } from '../../scripts/util.js';

function fetchMiniIconData(item) {
  const paragraphs = Array.from(item.querySelectorAll('p'));
  const values = {
    icon: '',
    attributionUrl: '',
    textBelow: '',
    backgroundColor: '',
    style: '',
  };

  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    const link = p.querySelector('a[href]');
    const href = link?.getAttribute('href')?.trim() || '';

    // Rule 1: style
    if (text.startsWith('size-') && !values.style) {
      values.style = text.replace('size-', '');
      return;
    }

    // Rule 2: background color
    if (text.startsWith('bg-') && !values.backgroundColor) {
      values.backgroundColor = text;
      return;
    }

    // Rule 3: attributionUrl (via <a> or URL-looking text)
    if ((link && href)) {
      values.attributionUrl = href || text;
      return;
    }

    // Rule 4: icon (first unmatched "normal" text not size-/bg-/URL)
    if (!values.icon && text) {
      values.icon = text;
      return;
    }

    // Rule 5: fallback to textBelow
    if (!values.textBelow && text) {
      values.textBelow = text;
    }
  });

  return values;
}

function buildMiniIconItem({
  icon,
  attributionUrl,
  textBelow,
  backgroundColor,
  style,
}) {
  const article = document.createElement('article');
  article.className = 'el-mini-flex-item';

  const anchor = document.createElement('a');
  anchor.className = 'icon-link';
  if (attributionUrl) anchor.href = attributionUrl;

  const wrapper = document.createElement('div');
  if (attributionUrl) {
    wrapper.className = `flex-icon link-hover ${backgroundColor} ${style}`.trim();
  } else {
    wrapper.className = `flex-icon ${backgroundColor} ${style}`.trim();
  }

  const p = document.createElement('p');
  p.className = 'flex-center';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon-focus';
  const iconElem = document.createElement('i');
  iconElem.className = `${icon} fa-2x`;
  iconElem.setAttribute('aria-hidden', 'true');
  iconSpan.appendChild(iconElem);

  const textBelowSpan = document.createElement('span');
  textBelowSpan.className = 'text-below';
  textBelowSpan.textContent = textBelow || '';

  p.append(iconSpan, textBelowSpan);
  wrapper.appendChild(p);
  anchor.appendChild(wrapper);
  article.appendChild(anchor);

  return article;
}

export default function decorate(block) {
  const allDivs = Array.from(block.querySelectorAll(':scope > div'));

  if (allDivs.length === 0) return;

  // mark parent divs
  const iconItemsParent = allDivs.slice(1);
  iconItemsParent.forEach((parent) => {
    parent.classList.add('flex-icons-article');
  });

  const wrapper = document.createElement('section');
  wrapper.classList.add('el-flex-grid');

  // get all icon item divs (skipping the first paragraph div)
  const iconDivs = allDivs.slice(1);
  addMiniFlexParentClasses(block, iconDivs.length);

  iconDivs.forEach((item) => {
    const values = fetchMiniIconData(item);

    let miniIconElement;

    if (!values.icon && !values.textBelow && !values.attributionUrl) {
      // case: new/empty item → render placeholder so it’s still selectable
      miniIconElement = document.createElement('article');
      miniIconElement.className = 'el-mini-flex-item placeholder';
      miniIconElement.innerHTML = `
        <div class="flex-icon placeholder-content">
          <p class="flex-center">
            <span class="text-below">Add icon</span>
          </p>
        </div>
      `;
    } else {
      // normal case
      miniIconElement = buildMiniIconItem(values);
      createDataLayerEvent('click', 'Flex:IconClick', () => ({
        linkName: values.textBelow || 'icon',
        linkURL: values.attributionUrl || '',
        linkType: 'cta',
        linkRegion: 'content',
        componentName: 'Flex Icon Mini',
        componentId: 'flex-icon-mini',
      }), miniIconElement);
    }

    // preserve authoring instrumentation
    moveInstrumentation(item, miniIconElement);

    wrapper.appendChild(miniIconElement);
  });

  block.textContent = '';
  block.appendChild(wrapper);
}
