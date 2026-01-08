import { createOptimizedPicture } from '../../scripts/aem.js';

// Util to get text safely
const getText = (el) => el?.textContent?.trim() || '';

// Extract optimized picture info
const extractImage = (input, altText) => {
  // If input is a string (headshot image URL)
  if (typeof input === 'string') {
    return createOptimizedPicture(input, altText, false, [{ width: '750' }]);
  }
  // If input is a picture DOM element
  const img = input?.querySelector('img');
  const optimizedPic = createOptimizedPicture(img?.src, altText, false, [{ width: '750' }]);
  return optimizedPic ? { src: img?.src, alt: altText || '' } : { src: '', alt: '' };
};

// Return correct icon image info
function getIconImageInfo(variation, iconInfo, iconText) {
  let iconImg = null;

  const iconBasePath = `${window.hlx.codeBasePath}/icons`;

  if (variation === 'ombre-style' || variation === 'bg-image') {
    const img = document.createElement('img');
    img.src = `${iconBasePath}/icon-quotation-mark.svg`;
    img.alt = 'Icon Alt Text';
    img.width = 83;
    img.height = 60;
    img.loading = 'lazy';
    iconImg = img;
  } else if (variation === 'ca-style-purple' || variation === 'ca-style-green') {
    const img = document.createElement('img');
    img.src = `${iconBasePath}/icon-quotation-mark-gradient.svg`;
    img.alt = 'Icon Alt Text';
    img.width = 83;
    img.height = 60;
    img.loading = 'lazy';
    iconImg = img;
  } else if (variation === 'custom' && iconInfo.src) {
    const img = document.createElement('img');
    img.src = iconInfo.src;
    img.alt = iconText;
    img.width = 83;
    img.height = 60;
    img.loading = 'lazy';
    iconImg = img;
  }

  return iconImg;
}

function createCAPullQuoteDOM({
  variation,
  quoteText,
  citationName,
  citationText,
  headshotImage,
}) {
  const aside = document.createElement('aside');
  aside.className = 'pull-quote';
  const iconImgInfo = getIconImageInfo(variation, '', '');
  aside.style.background = `url(${iconImgInfo.src}) no-repeat top left`;

  if (headshotImage) {
    headshotImage.className = 'border-circle';
    aside.appendChild(headshotImage);
  }

  // Blockquote
  const quote = document.createElement('div');
  quote.classList.add('quote');
  quote.classList.add('active-border');

  const blockquote = document.createElement('blockquote');
  blockquote.className = variation;

  const para = document.createElement('p');
  if (variation === 'ca-style-purple') para.classList.add('txt-suffragist-purple-color');
  if (variation === 'ca-style-green') para.classList.add('txt-arboretum-green-color');
  para.innerHTML = quoteText;

  blockquote.appendChild(para);

  const cite = document.createElement('cite');
  cite.innerHTML = `${citationName}<br>${citationText}`;

  quote.appendChild(blockquote);
  quote.appendChild(cite);
  aside.appendChild(quote);

  return aside;
}

// All DOM generation happens here
function createHeadshotDOM({
  variation,
  quoteText,
  citationName,
  citationText,
  headshotImage,
  iconInfo,
  iconText,
  quoteTextColor,
  quoteTextColorCode,
}) {
  const aside = document.createElement('aside');
  aside.classList.add('small-blockquote');
  if (variation === 'bg-image') aside.classList.add('image-background');

  const blockAbove = document.createElement('div');
  blockAbove.classList.add('block-above');
  if (variation !== 'ombre-style') blockAbove.style.background = 'none';

  const bqWrap = document.createElement('div');
  bqWrap.classList.add('bq-wrap');
  const quoteMark = document.createElement('div');
  quoteMark.classList.add('quote-mark');

  const iconImgInfo = getIconImageInfo(variation, iconInfo, iconText);
  if (iconImgInfo?.src) {
    const img = document.createElement('img');
    img.src = iconImgInfo.src;
    img.alt = iconImgInfo.alt;
    quoteMark.appendChild(img);
  }

  const quote = document.createElement('div');
  quote.classList.add('quote');
  if (variation === 'ca-style-purple' || variation === 'ca-style-green') {
    quote.classList.add('active-border');
  }

  const blockquote = document.createElement('blockquote');

  const mobileMark = document.createElement('div');
  mobileMark.classList.add('quote-mark-mobile-flow');
  mobileMark.style.backgroundImage = `url(${iconImgInfo.src})`;
  mobileMark.style.backgroundAlt = iconImgInfo.alt;

  const quotePara = document.createElement('p');
  quotePara.innerHTML = quoteText;

  if (variation === 'custom') {
    if (quoteTextColor === 'txt-others') {
      quotePara.style.color = quoteTextColorCode;
    } else {
      quotePara.classList.add(quoteTextColor);
    }
  }

  if (variation === 'ca-style-purple') quotePara.classList.add('txt-suffragist-purple-color');
  if (variation === 'ca-style-green') quotePara.classList.add('txt-arboretum-green-color');

  blockquote.appendChild(mobileMark);
  blockquote.appendChild(quotePara);

  const cite = document.createElement('cite');
  cite.innerHTML = `${citationName}<br>${citationText}`;

  quote.appendChild(blockquote);
  quote.appendChild(cite);

  const blockBelow = document.createElement('div');
  blockBelow.classList.add('block-below');

  bqWrap.appendChild(quoteMark);
  bqWrap.appendChild(quote);

  aside.appendChild(blockAbove);
  if (headshotImage) {
    headshotImage.className = 'pull-right border-circle';
    aside.appendChild(headshotImage);
  }
  aside.appendChild(bqWrap);

  aside.appendChild(blockBelow);

  return aside;
}

// Extract values from DOM block
function parseBlockData(block) {
  const variation = getText(block.querySelector(':scope > div:nth-child(1) > div > p'));
  const col = block.querySelector(':scope > div:nth-child(2) > div');
  const paragraphs = col?.querySelectorAll('p') || [];

  const quoteText = paragraphs[0]?.innerHTML?.trim() || '';
  const citationName = getText(paragraphs[1]);
  const citationText = getText(paragraphs[2]);

  let pictureEl = '';
  let iconText = '';
  let iconInfo = '';
  let quoteTextColor = '';
  let quoteTextColorCode = '';
  let headshotImage = '';

  if (variation !== 'custom') {
    const pic = paragraphs[3];
    const picture = pic?.querySelector('picture') || '';
    headshotImage = picture;
  }

  if (variation === 'custom') {
    const para3 = paragraphs[3];
    const para5 = paragraphs[4];

    const pictureInPara3 = para3?.querySelector('picture');
    const pictureInPara5 = para5?.querySelector('picture');

    if (pictureInPara3 && pictureInPara5) {
      headshotImage = pictureInPara3;
      pictureEl = pictureInPara5;
      iconText = getText(paragraphs[5]);
    } else if (pictureInPara3) {
      pictureEl = pictureInPara3;
      iconText = getText(paragraphs[4]);
    }

    iconInfo = extractImage(pictureEl, iconText);
    quoteTextColor = getText(block.querySelector(':scope > div:nth-child(3) > div > p'));
    quoteTextColorCode = getText(block.querySelector(':scope > div:nth-child(4) > div > p'));
  }

  return {
    variation,
    quoteText,
    citationName,
    citationText,
    headshotImage,
    iconInfo,
    iconText,
    quoteTextColor,
    quoteTextColorCode,
  };
}

// Main decorator
export default async function decorate(block) {
  const allDivs = Array.from(block.children);

  const blocksToProcess = allDivs.slice(1);

  if (!blocksToProcess) return; // safeguard
  const tempWrapper = document.createElement('div');
  blocksToProcess.forEach((child) => tempWrapper.appendChild(child.cloneNode(true)));

  const data = parseBlockData(tempWrapper);

  let dom;
  const isCAStyle = (data.variation === 'ca-style-purple' || data.variation === 'ca-style-green') && data.headshotImage;
  if (isCAStyle) {
    dom = createCAPullQuoteDOM(data);
  } else {
    dom = createHeadshotDOM(data);
  }

  block.innerHTML = '';
  block.appendChild(dom);
}
