/**
 * Fetches all attributes from the block.
 * @param {HTMLElement} block
 * @returns {Object} data
 */
function fetchAttributes(block) {
  const data = {};

  const alignEl = block.querySelector(':scope > div:nth-of-type(2) p');
  data.alignment = alignEl ? alignEl.textContent.trim() : '';

  const picture = block.querySelector('picture');
  data.picture = picture ? picture.cloneNode(true) : '';

  const photoCreditEl = block.querySelector(':scope > div:nth-of-type(4) p');
  data.photoCredits = photoCreditEl ? photoCreditEl.textContent.trim() : '';

  const titleEl = block.querySelector(':scope > div:nth-of-type(5) p');
  data.title = titleEl ? titleEl.textContent.trim() : '';

  const descEl = block.querySelector(':scope > div:nth-of-type(6) p');
  data.description = descEl ? descEl.outerHTML.trim() : '';

  const readMoreLink = block.querySelector(':scope > div:nth-of-type(7) a');
  data.readMoreLink = readMoreLink ? readMoreLink.getAttribute('href') : '';

  const buttonTextEl = block.querySelector(':scope > div:nth-of-type(8) p');
  data.ctaText = buttonTextEl ? buttonTextEl.textContent.trim() : '';

  const buttonLinkEl = block.querySelector(':scope > div:nth-of-type(9) a');
  data.ctaLink = buttonLinkEl ? buttonLinkEl.getAttribute('href') : '';

  const descE2 = block.querySelector(':scope > div:nth-of-type(10) p');
  data.titleTag = descE2 ? descE2.outerHTML.trim() : '';

  return data;
}

/**
 * Builds right-aligned DOM structure.
 */
function renderRightAligned(data) {
  const section = document.createElement('section');
  section.className = 'featured-article-container';

  // Image/picture section
  const inner = document.createElement('div');
  inner.className = 'featured-article-inner';
  if (data.picture) {
    inner.append(data.picture);
  }

  if (data.photoCredits) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-container right';

    const infoIcon = document.createElement('span');
    infoIcon.className = 'info-icon';
    infoIcon.setAttribute('tabindex', '0');
    infoIcon.textContent = 'Photo Credit';

    const infoBox = document.createElement('div');
    infoBox.className = 'info-box';
    infoBox.textContent = data.photoCredits;

    infoContainer.appendChild(infoIcon);
    infoContainer.appendChild(infoBox);
    inner.appendChild(infoContainer);
  }

  section.append(inner);

  // Text layout container
  const textContainer = document.createElement('div');
  textContainer.className = 'featured-article-text layout';

  const textInner = document.createElement('div');
  textInner.className = 'featured-article-text-inner';

  // Title with conditional link wrapping
  const heading = document.createElement('h1');
  heading.className = 'h2';
  heading.id = 'featured-article-title';

  if (data.readMoreLink) {
    const link = document.createElement('a');
    link.href = data.readMoreLink;
    link.textContent = data.title || '';
    heading.append(link);
  } else {
    heading.textContent = data.title || '';
  }

  // Description
  const desc = document.createElement('p');
  desc.innerHTML = data.description || '';

  // Read More link (only if available)
  let readMore;
  if (data.readMoreLink) {
    readMore = document.createElement('a');
    readMore.className = 'read-more decor';
    readMore.href = data.readMoreLink;
    readMore.textContent = 'Read more';
  }

  let titleTagE1;
  if (data.titleTag) {
    titleTagE1 = document.createElement('p');
    titleTagE1.innerHTML = data.titleTag || '';
  }

  // Append children in correct order
  textInner.append(heading, document.createElement('p'), desc);
  if (readMore) textInner.append(readMore);
  if (titleTagE1) textInner.append(titleTagE1);
  textInner.append(document.createElement('p'));
  textContainer.append(textInner);
  section.append(textContainer);

  return section;
}

/**
 * Builds left-aligned DOM structure.
 */
function renderLeftAligned(data) {
  const section = document.createElement('section');
  section.className = 'single-article-feature-container layout';

  const inner = document.createElement('div');
  inner.className = 'single-article-feature-inner';
  if (data.picture) {
    inner.append(data.picture);
  }

  if (data.photoCredits) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-container right';

    const infoIcon = document.createElement('span');
    infoIcon.className = 'info-icon';
    infoIcon.setAttribute('tabindex', '0');
    infoIcon.textContent = 'Photo Credit';

    const infoBox = document.createElement('div');
    infoBox.className = 'info-box';
    infoBox.textContent = data.photoCredits;

    infoContainer.appendChild(infoIcon);
    infoContainer.appendChild(infoBox);
    inner.appendChild(infoContainer);
  }

  section.append(inner);

  const textContainer = document.createElement('div');
  textContainer.className = 'featured-article-text';

  const textInner = document.createElement('div');
  textInner.className = 'featured-article-text-inner';

  // Title with conditional link wrapping
  const titleEl = document.createElement('h2');
  titleEl.textContent = data.title || '';

  const desc = document.createElement('p');
  desc.innerHTML = data.description || '';

  let readMore;
  if (data.readMoreLink) {
    readMore = document.createElement('a');
    readMore.className = 'read-more decor';
    readMore.href = data.readMoreLink;
    readMore.textContent = 'Read more';
  }

  // CTA button
  let buttonWrapper;
  if (data.ctaText && data.ctaLink) {
    buttonWrapper = document.createElement('p');
    buttonWrapper.className = 'button-container';
    buttonWrapper.title = data.ctaText || '';

    const button = document.createElement('a');
    button.className = 'button';
    button.href = data.ctaLink || '#';
    button.textContent = data.ctaText || '';

    buttonWrapper.append(button);
  }
  if (titleEl || desc || readMore || buttonWrapper) {
    textInner.append(
      ...([titleEl, desc, readMore, buttonWrapper].filter(Boolean)),
    );
  }
  textContainer.append(textInner);
  section.append(textContainer);

  return section;
}

/**
 * Creates DOM structure based on alignment.
 * @param {Object} data - attributes fetched from HTML
 * @returns {HTMLElement} - new DOM structure to append inside block
 */
function createDOM(data) {
  let newStructure;

  if (data.alignment === 'align-right') {
    newStructure = renderRightAligned(data);
  } else {
    newStructure = renderLeftAligned(data);
  }

  return newStructure;
}

function enablePhotoCreditHover(container) {
  const infoContainer = container.querySelector('.info-container.right');
  if (!infoContainer) return;

  const infoIcon = infoContainer.querySelector('.info-icon');
  const infoBox = infoContainer.querySelector('.info-box');

  //  Add hover listeners
  infoContainer.addEventListener('mouseenter', () => {
    infoIcon.classList.add('is-open');
    infoBox.classList.add('active');
  });

  infoContainer.addEventListener('mouseleave', () => {
    infoIcon.classList.remove('is-open');
    infoBox.classList.remove('active');
  });
}

/**
 * Main decorate function
 */
export default async function decorate(block) {
  const data = fetchAttributes(block);
  const newDOM = createDOM(data);

  // Clear authored content
  block.textContent = '';

  // Append generated structure
  block.append(newDOM);
  enablePhotoCreditHover(block);
}
