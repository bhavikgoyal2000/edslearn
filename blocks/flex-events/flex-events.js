import createDataLayerEvent from '../../scripts/analytics-util.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { addFlexParentClasses } from '../../scripts/util.js';

function createTitleDOM(title, titleUrl = '') {
  const container = document.createElement('div');
  container.className = 'title-wrapper';
  const h1 = document.createElement('h1');

  if (titleUrl) {
    const link = document.createElement('a');
    link.href = titleUrl;
    link.textContent = title;
    link.setAttribute('title', title);
    link.setAttribute('aria-label', `More about ${title}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    createDataLayerEvent('click', 'click', () => ({
      linkName: link.textContent,
      linkURL: link.href,
      linkType: 'cta',
      linkRegion: 'content',
      componentName: 'Flex Event',
      componentId: 'flex-events',
    }), link);

    h1.appendChild(link);
  } else {
    h1.textContent = title;
  }

  container.appendChild(h1);
  return container;
}

function createFlexDOM(startStr, endStr, xlTextContent = '') {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const footer = document.createElement('div');
  footer.className = 'flex-body';

  const monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} <span class='am-pm'>${ampm}</span>`;
  }

  let lastP = null;

  // CASE 1: Same Day
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
   && start.getDate() === end.getDate()) {
    const pDate = document.createElement('p');
    pDate.className = 'date';
    pDate.innerHTML = `<time datetime='${startStr}'>${monthsFull[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}</time>`;

    const pTime = document.createElement('p');
    pTime.className = 'time';
    pTime.innerHTML = `
      <time datetime='${startStr}'>${formatTime(start)}</time>
      –
      <time datetime='${endStr}'>${formatTime(end)}</time>`;

    footer.appendChild(pDate);
    footer.appendChild(pTime);
    lastP = pTime;
  } else if (start.getFullYear() === end.getFullYear()
    && start.getMonth() === end.getMonth()) {
    const p = document.createElement('p');
    p.className = 'date';
    p.innerHTML = `
      <time datetime='${startStr}'>${monthsFull[start.getMonth()]} ${start.getDate()}</time>
      –
      <time datetime='${endStr}'>${end.getDate()}, ${end.getFullYear()}</time>
    `;
    footer.appendChild(p);
    lastP = p;
  } else {
    const p = document.createElement('p');
    p.className = 'date';
    p.innerHTML = `
      <time datetime='${startStr}'>${monthsShort[start.getMonth()]} ${start.getDate()}</time>
      — 
      <time datetime='${endStr}'>${monthsShort[end.getMonth()]} ${end.getDate()}</time>, ${start.getFullYear()}
    `;
    footer.appendChild(p);
    lastP = p;
  }

  // ✅ Only create extra content if xlTextContent is a non-empty, trimmed string
  if (typeof xlTextContent === 'string' && xlTextContent.trim().length > 0) {
    const extraDiv = document.createElement('div');
    extraDiv.className = 'xl-text';

    const p = document.createElement('p');
    p.textContent = xlTextContent.trim();
    extraDiv.appendChild(p);

    if (lastP && lastP.parentNode === footer) {
      lastP.insertAdjacentElement('afterend', extraDiv);
    } else {
      footer.appendChild(extraDiv);
    }
  }

  return footer;
}

function createCTADOM({ cta1, cta2, title }) {
  if (typeof title !== 'string' || title.trim() === '') return null;

  const promo = document.createElement('p');
  promo.className = 'promo-cta';

  function isValidCTA(cta) {
    return Array.isArray(cta) && cta.length === 2 && typeof cta[0] === 'string' && typeof cta[1] === 'string';
  }

  function createCTA(ctaText, ctaUrl, className, titlePrefix) {
    const a = document.createElement('a');
    a.href = ctaUrl;
    a.className = `btn ${className}`;
    a.title = `${titlePrefix}: ${title}`;
    a.textContent = `${ctaText} `;

    createDataLayerEvent('click', 'click', () => ({
      linkName: a.textContent,
      linkURL: a.href,
      linkType: 'cta',
      linkRegion: 'content',
      componentName: 'Flex Event',
      componentId: 'flex-events',
    }), a);

    const icon = document.createElement('i');
    icon.className = 'fa fa-long-arrow-right';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.marginLeft = '5px';

    a.appendChild(icon);
    return a;
  }

  if (isValidCTA(cta1)) {
    promo.appendChild(createCTA(cta1[0], cta1[1], 'btn-primary', 'cta 1 title'));
  }

  if (isValidCTA(cta2)) {
    promo.appendChild(createCTA(cta2[0], cta2[1], 'btn-secondary', 'cta 2 title'));
  }

  return promo;
}

function getOptimizedImageUrl(damPath, imageAltText) {
  if (!damPath || typeof damPath !== 'string') return document.createTextNode('');
  const optimizedPic = createOptimizedPicture(damPath, imageAltText, false, [{ width: '750' }]);
  return optimizedPic;
}

function createArticleDOM(data, blockElement) {
  const article = document.createElement('article');
  article.className = 'el-flex-item flex-center';
  moveInstrumentation(blockElement, article);
  const flexEventDiv = document.createElement('div');
  flexEventDiv.className = 'flex-event';
  flexEventDiv.setAttribute('data-analytics-label', data.title || '');

  if (data.flexVariation === 'flexEvent' || data.flexVariation === 'event-xl') {
    if (data.flexVariation === 'event-xl') {
      flexEventDiv.classList.add('xl');
      article.classList.add('xl');
    }

    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'overlay';

    if (data.image) {
      const img = getOptimizedImageUrl(data.image.src, data.image.alt);
      img.className = 'bg-img';
      flexEventDiv.appendChild(img);
    }

    if (data.title) {
      const titleDiv = createTitleDOM(data.title, '');
      overlayDiv.appendChild(titleDiv);
    }

    if (data.startDate && data.endDate) {
      const flexDOM = createFlexDOM(data.startDate, data.endDate, data.flexVariation === 'event-xl' ? data.xlTextContent : '');
      overlayDiv.appendChild(flexDOM);
    }

    const ctaDOM = createCTADOM({ cta1: data.cta1, cta2: data.cta2, title: data.title });
    if (ctaDOM) {
      overlayDiv.appendChild(ctaDOM);
    }

    flexEventDiv.appendChild(overlayDiv);
  } else if (data.flexVariation === 'image-card' || data.flexVariation === 'image-card-xl') {
    flexEventDiv.classList.add('style-2');

    if (data.flexVariation === 'image-card-xl') {
      flexEventDiv.classList.add('xl');
    }

    if (data.position === 'bottom') {
      flexEventDiv.classList.add('image-bottom');
    }

    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'overlay';

    if (data.title) {
      const titleDiv = createTitleDOM(data.title, data.newTitleUrl || '');
      overlayDiv.appendChild(titleDiv);
    }

    if (data.startDate && data.endDate) {
      const flexDOM = createFlexDOM(data.startDate, data.endDate, data.flexVariation === 'image-card-xl' ? data.xlTextContent : '');
      overlayDiv.appendChild(flexDOM);
    }

    if (data.position === 'bottom') {
      flexEventDiv.appendChild(overlayDiv);
    }

    if (data.image) {
      const imagDiv = document.createElement('div');
      imagDiv.className = 'event-photo';
      const imgWrapper = createOptimizedPicture(data.image.src, data.image.alt, false, [{ width: '750' }]);
      imagDiv.appendChild(imgWrapper);
      flexEventDiv.appendChild(imagDiv);
    }

    if (data.position !== 'bottom') {
      flexEventDiv.appendChild(overlayDiv);
    }
  }
  article.appendChild(flexEventDiv);
  return article;
}

function labelFlexData(dataArray) {
  // Map the new flexData array structure to the correct object properties
  let xlTextContent = null;
  if (dataArray.length > 5 && dataArray[5] && typeof dataArray[5] === 'object' && 'xlTextContent' in dataArray[5]) {
    xlTextContent = dataArray[5].xlTextContent || null;
  }
  return {
    flexVariation: dataArray[0] || null,
    title: dataArray[1] || null,
    startDate: Array.isArray(dataArray[2]) && dataArray[2][0] ? dataArray[2][0] : null,
    endDate: Array.isArray(dataArray[2]) && dataArray[2][1] ? dataArray[2][1] : null,
    image: dataArray[3] || null,
    cta1: Array.isArray(dataArray[4]) && dataArray[4][0] ? dataArray[4][0] : null,
    cta2: Array.isArray(dataArray[4]) && dataArray[4][1] ? dataArray[4][1] : null,
    xlTextContent,
    newTitleUrl: null,
    position: null,
  };
}

function extractFlexContainerData(containerElement) {
  const children = Array.from(containerElement.children);

  let flexVariation = null;
  let title = null;
  let xlTextContent = null;
  let startDate = null;
  let endDate = null;
  let image = null;
  let cta1 = null;
  let cta2 = null;

  // flexVariation
  if (children[0] && children[0].querySelector('p')) {
    flexVariation = children[0].querySelector('p').textContent.trim();
  } else {
    flexVariation = null;
  }

  // title and xlTextContent
  if (children[1]) {
    const ps = children[1].querySelectorAll('p');
    title = (ps[0]) ? ps[0].textContent.trim() : null;
    xlTextContent = (ps[1]) ? ps[1].textContent.trim() : null;
  } else {
    title = null;
    xlTextContent = null;
  }

  // startDate and endDate
  if (children[2]) {
    const ps = children[2].querySelectorAll('p');
    startDate = (ps[0]) ? ps[0].textContent.trim() : null;
    endDate = (ps[1]) ? ps[1].textContent.trim() : null;
  } else {
    startDate = null;
    endDate = null;
  }

  // image
  if (children[3] && children[3].querySelector('img')) {
    const img = children[3].querySelector('img');
    image = {
      type: 'image',
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
    };
  } else {
    image = null;
  }

  // cta1 and cta2
  if (children[4]) {
    const buttonContainers = children[4].querySelectorAll('p.button-container');
    if (buttonContainers[0] && buttonContainers[0].querySelector('a')) {
      const link1 = buttonContainers[0].querySelector('a');
      cta1 = [link1.textContent.trim(), link1.getAttribute('href')];
    } else {
      cta1 = null;
    }
    if (buttonContainers[1] && buttonContainers[1].querySelector('a')) {
      const link2 = buttonContainers[1].querySelector('a');
      cta2 = [link2.textContent.trim(), link2.getAttribute('href')];
    } else {
      cta2 = null;
    }
  } else {
    cta1 = null;
    cta2 = null;
  }

  const flexData = [
    flexVariation,
    title,
    [startDate, endDate],
    image,
    [cta1, cta2],
    { xlTextContent },
  ];
  return { flexData };
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) {
    block.innerHTML = '<p>No Flex Content found.</p>';
    return;
  }

  const parentBlock = Array.from(block.children);
  const section = document.createElement('section');
  section.className = 'el-flex-grid flex-count-3 row-center';
  const cardsToProcess = parentBlock.slice(1);
  addFlexParentClasses(block, cardsToProcess.length);
  cardsToProcess.forEach((childBlock) => {
    const extractedData = extractFlexContainerData(childBlock);
    const labeledData = labelFlexData(extractedData.flexData);
    const article = createArticleDOM(labeledData, childBlock);
    section.appendChild(article);
  });
  block.textContent = '';
  block.appendChild(section);
}
