import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Existing Quote fetch logic (unchanged)
 */
function fetchQuoteData(block) {
  const innerDivs = [...block.querySelectorAll(':scope > div > div')];
  if (innerDivs.length === 0) return null;

  const mainDiv = innerDivs[0];
  const creditsDiv = innerDivs[1];

  const paragraphs = [...mainDiv.querySelectorAll('p')];
  const picture = mainDiv.querySelector('picture');

  if (!picture || paragraphs.length < 2) return null;

  const quoteText = paragraphs[2]?.textContent.trim() || '';
  const quotee = paragraphs[3]?.textContent.trim() || '';

  const layoutP = paragraphs.find((p) => p.textContent.trim().toLowerCase().startsWith('txt-'));
  const layout = layoutP ? layoutP.textContent.trim() : '';

  const buttonLinkP = paragraphs.find((p) => p.querySelector('a'));
  const buttonURL = buttonLinkP ? buttonLinkP.querySelector('a').getAttribute('href') : '';
  let buttonText = '';
  if (buttonLinkP) {
    const idx = paragraphs.indexOf(buttonLinkP);
    const prevP = paragraphs[idx - 1];
    if (prevP && !prevP.textContent.trim().toLowerCase().startsWith('txt-')) {
      buttonText = prevP.textContent.trim();
    }
  }

  let credits = '';
  if (creditsDiv) {
    const creditP = creditsDiv.querySelector('p');
    if (creditP) credits = creditP.textContent.trim();
  }

  return {
    image: picture.cloneNode(true),
    quoteText,
    quotee,
    layout,
    buttonText,
    buttonURL,
    credits,
  };
}

/**
 * NEW fetch logic for var-single-image
 */
function fetchSingleImageData(block) {
  const innerDivs = [...block.querySelectorAll(':scope > div > div')];
  if (innerDivs.length === 0) return null;

  const mainDiv = innerDivs[0];
  const creditsDiv = innerDivs[1];
  const subTitleDiv = innerDivs[2];
  const summaryDiv = innerDivs[3];

  const paragraphs = [...mainDiv.querySelectorAll('p')];
  const picture = mainDiv.querySelector('picture');

  if (!picture || paragraphs.length < 3) return null;

  const quoteText = paragraphs[2]?.textContent.trim() || '';
  const gradColor = paragraphs[3]?.textContent.trim() || '';

  const buttonText = paragraphs[4]?.textContent.trim() || '';
  const buttonURL = paragraphs[5]?.querySelector('a')?.getAttribute('href') || '';

  let credits = '';
  if (creditsDiv) {
    const creditP = creditsDiv.querySelector('p');
    if (creditP) credits = creditP.textContent.trim();
  }

  let subTitle = '';
  if (subTitleDiv) {
    const subTitleP = subTitleDiv.querySelector('p');
    if (subTitleP) subTitle = subTitleP.textContent.trim();
  }

  let summary = '';
  if (summaryDiv) {
    const summaryP = summaryDiv.querySelector('p');
    if (summaryP) summary = summaryP.textContent.trim();
  }

  return {
    image: picture.cloneNode(true),
    quoteText,
    subTitle,
    gradColor,
    buttonText,
    buttonURL,
    credits,
    summary,
  };
}

/**
 * Main fetch dispatcher
 */
function fetchBlockData(block) {
  const firstP = block.querySelector(':scope > div > div > p');
  const variation = firstP ? firstP.textContent.trim().toLowerCase() : 'var-quote';

  if (variation === 'var-quote') {
    return { variation, ...fetchQuoteData(block) };
  }
  if (variation === 'var-single-image') {
    return { variation, ...fetchSingleImageData(block) };
  }

  return null;
}

/**
 * Existing DOM for var-quote
 */
function createQuoteDOM(data) {
  if (!data) return null;

  const outerDiv = document.createElement('div');

  const photoWrapper = document.createElement('div');
  photoWrapper.className = 'quote-photo-wrapper';

  const photoImageDiv = document.createElement('div');
  photoImageDiv.className = 'quote-photo-image';

  // Add picture
  photoImageDiv.appendChild(data.image);

  // Add Photo Credit if available
  if (data.credits) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-container right';

    const infoIcon = document.createElement('span');
    infoIcon.className = 'info-icon';
    infoIcon.setAttribute('tabindex', '0');
    infoIcon.textContent = 'Photo Credit';

    const infoBox = document.createElement('div');
    infoBox.className = 'info-box';
    infoBox.textContent = data.credits;

    infoContainer.appendChild(infoIcon);
    infoContainer.appendChild(infoBox);
    photoImageDiv.appendChild(infoContainer);
  }

  // Banner section
  const bannerDiv = document.createElement('div');
  bannerDiv.className = 'quote-photo-banner';

  const textDiv = document.createElement('div');
  textDiv.className = 'quote-photo-text';

  const textBanner = document.createElement('div');
  textBanner.className = `quote-photo-text-banner ${data.layout.replace(/^txt-/, '')}`;

  const quoteDiv = document.createElement('div');
  quoteDiv.className = 'quote quotation-text';
  quoteDiv.textContent = data.quoteText;

  const quoteeP = document.createElement('p');
  quoteeP.className = 'quotee-text';
  quoteeP.textContent = data.quotee;

  textBanner.appendChild(quoteDiv);
  textBanner.appendChild(quoteeP);

  // Optional CTA Button
  if (data.buttonText && data.buttonURL) {
    const buttonP = document.createElement('p');
    buttonP.className = 'button-container';

    const buttonA = document.createElement('a');
    buttonA.className = 'button transparent';
    buttonA.href = data.buttonURL;
    buttonA.textContent = data.buttonText;

    buttonP.appendChild(buttonA);
    textBanner.appendChild(buttonP);
  }

  textDiv.appendChild(textBanner);
  bannerDiv.appendChild(textDiv);

  // Assemble the structure
  photoWrapper.appendChild(photoImageDiv);
  photoWrapper.appendChild(bannerDiv);
  outerDiv.appendChild(photoWrapper);

  return outerDiv;
}

/**
 * NEW DOM for var-single-image
 */
function createSingleImageDOM(data) {
  if (!data) return null;

  const wrapper = document.createElement('div');
  wrapper.className = `single-image-feature ${data.gradColor || ''}`;

  // image
  wrapper.appendChild(data.image);

  // layout wrapper
  const layoutDiv = document.createElement('div');
  layoutDiv.className = 'layout-wrapper';

  const textDiv = document.createElement('div');
  textDiv.className = 'text-wrapper';

  // title
  const h2 = document.createElement('h2');
  h2.textContent = data.quoteText || '';

  // subtitle
  const h3 = document.createElement('h3');
  h3.textContent = data.subTitle || '';

  // summary
  const summaryP = document.createElement('p');
  summaryP.textContent = data.summary || '';

  textDiv.appendChild(h2);
  if (data.subTitle) textDiv.appendChild(h3);
  if (data.summary) textDiv.appendChild(summaryP);

  // CTA
  if (data.buttonText && data.buttonURL) {
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-container';
    buttonDiv.setAttribute('title', data.buttonText);

    const buttonA = document.createElement('a');
    buttonA.className = 'button transparent';
    buttonA.href = data.buttonURL;
    buttonA.textContent = data.buttonText;

    buttonDiv.appendChild(buttonA);
    textDiv.appendChild(buttonDiv);
  }

  layoutDiv.appendChild(textDiv);
  wrapper.appendChild(layoutDiv);

  // info container (photo credit)
  if (data.credits) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'info-container right';

    const infoIcon = document.createElement('span');
    infoIcon.className = 'info-icon';
    infoIcon.setAttribute('tabindex', '0');
    infoIcon.textContent = 'Info';

    const infoBox = document.createElement('div');
    infoBox.className = 'info-box';
    infoBox.textContent = data.credits;

    infoContainer.appendChild(infoIcon);
    infoContainer.appendChild(infoBox);

    wrapper.appendChild(infoContainer);
  }

  moveInstrumentation(wrapper);

  return wrapper;
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
 * Main decorate
 */
export default function decorate(block) {
  const slicedBlock = document.createElement('div');
  slicedBlock.append(...Array.from(block.children).slice(1));
  const data = fetchBlockData(slicedBlock);

  if (!data) return;

  let newDOM = null;
  if (data.variation === 'var-quote') {
    newDOM = createQuoteDOM(data);
  } else if (data.variation === 'var-single-image') {
    newDOM = createSingleImageDOM(data);
  }

  if (newDOM) {
    block.innerHTML = '';
    block.appendChild(newDOM);
    enablePhotoCreditHover(block);
  }
}
