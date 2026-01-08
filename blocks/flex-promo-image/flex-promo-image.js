import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { addFlexParentClasses } from '../../scripts/util.js';

function createTitleDOM(title, titleUrl = '', variation = 'standard') {
  const container = document.createElement('div');
  container.className = 'title-wrapper';

  const headingTag = (variation === 'legacy') ? 'h2' : 'h1';
  const heading = document.createElement(headingTag);

  if (titleUrl) {
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
  cta1, cta2, title, buttonStyle,
}) {
  if (buttonStyle !== 'cta_button' && buttonStyle !== 'cta_bullet') {
    return null;
  }

  function isValidCTA(cta) {
    return Array.isArray(cta) && cta.length === 2 && typeof cta[0] === 'string' && typeof cta[1] === 'string';
  }

  const createCTA = (ctaText, ctaUrl, className = '') => {
    const a = document.createElement('a');
    a.href = ctaUrl;
    a.title = title;
    a.textContent = ctaText;

    if (buttonStyle === 'cta_button') {
      a.className = `btn ${className}`.trim();
    }

    return a;
  };

  let promo;

  if (buttonStyle === 'cta_button') {
    promo = document.createElement('p');
    promo.className = 'promo-cta';

    [cta1, cta2].forEach((cta) => {
      if (isValidCTA(cta)) {
        promo.appendChild(createCTA(cta[0], cta[1], 'btn-cta'));
      }
    });
  } else {
    promo = document.createElement('ul');
    promo.className = 'promo-cta compact extra';

    [cta1, cta2].forEach((cta) => {
      if (isValidCTA(cta)) {
        const listItem = document.createElement('li');
        listItem.appendChild(createCTA(cta[0], cta[1]));
        promo.appendChild(listItem);
      }
    });
  }

  return promo;
}

function createArticleDOM(data, blockElement) {
  const article = document.createElement('article');
  article.className = 'el-flex-item';
  moveInstrumentation(blockElement, article);
  const flexEventDiv = document.createElement('div');
  flexEventDiv.className = 'flex-promo-image';
  flexEventDiv.setAttribute('data-analytics-label', data.title || '');

  if (data.flexVariation === 'standard') {
    if (data.flexDisplay === 'xl') {
      flexEventDiv.classList.add('xl');
    }
    if (data.color) {
      flexEventDiv.classList.add(data.color);
    }
    const imageDiv = document.createElement('div');
    imageDiv.className = 'promo-photo';
    if (data.image) {
      const img = createOptimizedPicture(data.image.src, data.image.alt, false, [{ width: '750' }]);
      img.className = 'bg-img';
      imageDiv.appendChild(img);
    }

    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'promo-text';

    if (data.color) {
      overlayDiv.classList.add(data.color);
    }
    if (data.title) {
      const titleDiv = createTitleDOM(data.title, data.cta1 ? data.cta1[1] : '', data.flexVariation);
      overlayDiv.appendChild(titleDiv);
    }
    if (data.content) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'promo-content';
      contentDiv.textContent = data.content;
      overlayDiv.appendChild(contentDiv);
    }

    if (data.imageLayout === 'bottom') {
      flexEventDiv.classList.add('image-bottom');
      flexEventDiv.appendChild(overlayDiv);
      flexEventDiv.appendChild(imageDiv);
    } else {
      flexEventDiv.classList.add('image-top');
      flexEventDiv.appendChild(imageDiv);
      flexEventDiv.appendChild(overlayDiv);
    }
  } else if (data.flexVariation === 'legacy') {
    flexEventDiv.classList.add('legacy');
    flexEventDiv.classList.add('with-cta');

    const imagDiv = document.createElement('div');
    imagDiv.className = 'promo-photo';
    if (data.image) {
      const imgWrapper = createOptimizedPicture(data.image.src, data.image.alt, false, [{ width: '750' }]);
      imagDiv.appendChild(imgWrapper);
      flexEventDiv.appendChild(imagDiv);
    }

    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'promo-text';

    if (data.color) {
      overlayDiv.classList.add(data.color);
    }
    if (data.title) {
      const titleDiv = createTitleDOM(data.title, '', data.flexVariation);
      overlayDiv.appendChild(titleDiv);
    }
    if (data.content) {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'promo-content';
      contentDiv.textContent = data.content;
      overlayDiv.appendChild(contentDiv);
    }
    if (data.cta1 || data.cta2) {
      const ctaDOM = createCTADOM({
        cta1: data.cta1,
        cta2: data.cta2,
        title: data.title,
        buttonStyle: data.buttonStyle,
      });
      if (ctaDOM) {
        overlayDiv.appendChild(ctaDOM);
      }
    }
    if (data.imageLayout === 'bottom') {
      flexEventDiv.appendChild(overlayDiv);
      flexEventDiv.appendChild(imagDiv);
    } else {
      flexEventDiv.appendChild(imagDiv);
      flexEventDiv.appendChild(overlayDiv);
    }
  }
  article.appendChild(flexEventDiv);
  return article;
}

function labelFlexData(dataArray, displayStyle = ' ') {
  return {
    flexDisplay: displayStyle,
    flexVariation: dataArray[0] || null,
    color: dataArray[1] || null,
    buttonStyle: dataArray[2] || null,
    title: dataArray[3] || null,
    content: dataArray[4] || null,
    image: dataArray[5] || null,
    imageLayout: dataArray[6] || null,
    cta1: dataArray[7] || null,
    cta2: dataArray[8] || null,
  };
}

function extractFlexContainerData(containerElement) {
  const children = Array.from(containerElement.children);

  const flexData = children.map((child) => {
    const ps = child.querySelectorAll('p');
    const img = child.querySelector('picture img');

    if (img) {
      return {
        type: 'image',
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
      };
    }

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
  addFlexParentClasses(block, parentBlock.length - 1);
  const firstBlock = parentBlock[0];
  const firstExtractedData = extractFlexContainerData(firstBlock);
  const displayStyle = firstExtractedData.flexData[0] || '';

  const section = document.createElement('section');
  section.className = 'el-flex-grid';
  parentBlock.slice(1).forEach((childBlock) => {
    const extractedData = extractFlexContainerData(childBlock);
    const labeledData = labelFlexData(extractedData.flexData, displayStyle);
    const article = createArticleDOM(labeledData, childBlock);
    section.appendChild(article);
  });
  block.textContent = '';
  block.appendChild(section);
}
