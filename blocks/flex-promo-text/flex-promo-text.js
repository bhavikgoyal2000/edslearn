import { moveInstrumentation } from '../../scripts/scripts.js';
import { addFlexParentClasses } from '../../scripts/util.js';

function createTitleDOM(title, titleUrl = '', buttonStyle = 'cta_button', color = '', flexVariation = 'solidBg') {
  const container = document.createElement('div');
  container.className = 'promo-title-text';

  const heading = document.createElement('h2');
  if (color) {
    const textColorClass = color.replace('bg-', 'txt-');
    if (flexVariation === 'outline') {
      heading.classList.add(textColorClass);
    } else {
      heading.classList.add('txt-color');
    }
  }
  if (titleUrl && buttonStyle === 'title_link') {
    const link = document.createElement('a');
    link.href = titleUrl;
    link.textContent = title;
    link.setAttribute('title', title);
    link.setAttribute('aria-label', `More about ${title}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    heading.appendChild(link);
  } else {
    heading.textContent = title;
  }

  container.appendChild(heading);
  return container;
}

function createCTADOM({
  cta1, title, flexVariation, color,
}) {
  if (!Array.isArray(cta1) || cta1.length !== 2) {
    return null;
  }

  const [ctaText, ctaUrl] = cta1;

  const a = document.createElement('a');
  a.href = ctaUrl;
  a.title = title;
  a.textContent = ctaText;
  a.setAttribute('aria-label', `Read more about ${title}`);

  if (flexVariation === 'outline' && color) {
    a.classList.add('btn', 'btn-colorbg', color);
  } else {
    a.classList.add('btn', 'btn-whitebg');
  }
  const promo = document.createElement('p');
  promo.className = 'promo-cta';
  promo.appendChild(a);

  return promo;
}

function createArticleDOM(data, blockElement) {
  const article = document.createElement('article');
  article.className = 'el-flex-item';
  moveInstrumentation(blockElement, article);
  const flexDiv = document.createElement('div');
  flexDiv.className = 'flex-promo-text';
  flexDiv.setAttribute('data-analytics-label', data.title || '');

  if (data.flexVariation === 'solidBg') {
    flexDiv.classList.add('solid');
    if (data.flexDisplay === 'xl') {
      flexDiv.classList.add('xl');
    }
    if (data.color) {
      flexDiv.classList.add(data.color);
    }

    if (data.title) {
      const titleDiv = createTitleDOM(data.title, data.cta1 ? data.cta1[1] : '', data.buttonStyle, data.color, data.flexVariation);
      flexDiv.appendChild(titleDiv);
    }
    if (data.content) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'promo-content';
      contentDiv.innerHTML += data.content;
      flexDiv.appendChild(contentDiv);
    }

    if (data.cta1 && data.buttonStyle === 'cta_button') {
      const ctaDOM = createCTADOM({
        cta1: data.cta1,
        title: data.title,
        flexVariation: data.flexVariation,
        color: data.color,
      });
      if (ctaDOM) {
        flexDiv.appendChild(ctaDOM);
      }
    }
  } else if (data.flexVariation === 'outline') {
    flexDiv.classList.add('outline');
    if (data.flexDisplay === 'xl') {
      flexDiv.classList.add('xl');
    }
    if (data.color) {
      flexDiv.classList.add(data.color);
    }
    if (data.title) {
      const titleDiv = createTitleDOM(data.title, data.cta1 ? data.cta1[1] : '', data.buttonStyle, data.color, data.flexVariation);
      flexDiv.appendChild(titleDiv);
    }

    if (data.content) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'promo-content';
      if (data.color) {
        const textColor = data.color ? data.color.replace('bg-', 'txt-') : '';
        contentDiv.classList.add(textColor);
      }
      contentDiv.innerHTML += data.content;
      flexDiv.appendChild(contentDiv);
    }
    if (data.cta1 && data.buttonStyle === 'cta_button') {
      const ctaDOM = createCTADOM({
        cta1: data.cta1,
        title: data.title,
        flexVariation: data.flexVariation,
        color: data.color,
      });
      if (ctaDOM) {
        flexDiv.appendChild(ctaDOM);
      }
    }
  }
  article.appendChild(flexDiv);
  return article;
}

function labelFlexData(dataArray, displayStyle = ' ') {
  return {
    flexDisplay: displayStyle,
    flexVariation: dataArray[0] || null,
    color: dataArray[1] || null,
    title: dataArray[2] || null,
    content: dataArray[3] || null,
    buttonStyle: dataArray[4] || null,
    cta1: dataArray[5] || null,
  };
}

function extractFlexContainerData(containerElement) {
  const children = Array.from(containerElement.children);

  const flexData = children.map((child, index) => {
    if (index === 3) {
      return child.innerHTML.trim();
    }
    const ps = child.querySelectorAll('p');
    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }
    return null;
  });
  return { flexData };
}

export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const firstBlock = parentBlock[0];
  const firstExtractedData = extractFlexContainerData(firstBlock);
  const displayStyle = firstExtractedData.flexData[0] || '';

  const section = document.createElement('section');
  section.className = 'el-flex-grid row-center';
  parentBlock.slice(1).forEach((childBlock) => {
    const extractedData = extractFlexContainerData(childBlock);
    const labeledData = labelFlexData(extractedData.flexData, displayStyle);
    const article = createArticleDOM(labeledData, childBlock);
    section.appendChild(article);
  });
  addFlexParentClasses(block, parentBlock.length - 2);
  block.textContent = '';
  block.appendChild(section);
}
