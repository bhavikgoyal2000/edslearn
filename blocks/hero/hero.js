import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Extract data for partial-width hero variation
 */
function extractHeroData(block) {
  const rows = [...block.querySelectorAll(':scope > div')].slice(1);
  if (rows.length < 2) return null;

  const contentDiv = rows[0].querySelector('div');
  if (!contentDiv) return null;

  const headingText = rows[1]?.querySelector('div p')?.textContent?.trim() || '';
  const surTitle = rows[2]?.querySelector('div p')?.textContent?.trim() || '';

  const paragraphs = [...contentDiv.querySelectorAll('p')];
  if (paragraphs.length < 2) return null;

  const variation = paragraphs[0]?.textContent?.trim().replace('var-', '') || '';
  const picture = paragraphs[1]?.querySelector('picture');
  const img = picture?.querySelector('img');

  let description = '';
  let backgroundClass = 'bg-default-ombre-color';
  let ctaText = '';
  let ctaLink = '#';
  let ctaType = 'link';
  let grdStyle = '';
  let ctaBackgroundColor = 'cta-bg-indigo-purple-color';

  for (let i = 1; i < paragraphs.length; i += 1) {
    const text = paragraphs[i]?.textContent.trim();

    if ((paragraphs[i + 1]?.classList.contains('button-container') || paragraphs[i + 1]?.querySelector('a[href]')) && !(text === 'bg-others')) {
      ctaText = text;
      ctaLink = paragraphs[i + 1]?.textContent?.trim() || '#';
      ctaType = paragraphs[i + 2]?.textContent?.trim() || 'link';
      if (ctaType === 'button') {
        ctaBackgroundColor = paragraphs[i + 3]?.textContent?.trim() || 'cta-bg-indigo-purple-color';
        i += 3;
      } else {
        i += 2;
      }
    } else if (text.startsWith('bg-') && !(text === 'bg-others')) {
      backgroundClass = text;
    } else if (text === 'bg-others') {
      backgroundClass = paragraphs[i + 1]?.textContent?.trim();
      i += 1;
    } else if (text.startsWith('style-')) {
      grdStyle = text.replace(/^style-/, '').toLowerCase();
    } else if (!description) {
      description = text;
    }
  }

  return {
    variation,
    imageSrc: img?.getAttribute('src') || '',
    imageAlt: img?.getAttribute('alt') || '',
    headingText,
    surTitle,
    description,
    backgroundClass,
    ctaText,
    ctaLink,
    ctaType,
    grdStyle: grdStyle || 'default',
    ctaBackgroundColor,
  };
}

/**
 * Extract data for full-width hero variation
 */
function parseHeroFullWidth(block) {
  const paragraphs = block.querySelectorAll(':scope > div:nth-child(2) > div > p');

  const variation = paragraphs[0]?.textContent?.trim().replace('var-', '') || '';
  const mainImage = paragraphs[1]?.querySelector('picture')?.outerHTML || '';

  let description = '';
  let textAlign = '';
  let horizontalAlign = ''; // NEW FIELD
  let ctaText = '';
  let ctaLink = '';
  const extraImages = [];

  for (let i = 2; i < paragraphs.length; i += 1) {
    const p = paragraphs[i];
    const picture = p.querySelector('picture');
    const link = p.querySelector('a');
    const text = p.textContent?.trim() || '';

    if (picture) {
      if (extraImages.length < 4) {
        const picClone = picture.cloneNode(true);
        picClone.classList.add('hidden-xs', 'hidden-sm', 'lazyload');
        extraImages.push(picClone.outerHTML);
      }
    } else if (link) {
      if (!ctaLink) {
        ctaLink = link.getAttribute('href') || '';
      }
    } else if (text && !text.startsWith('cta-bg-indigo-purple-color')) {
      if (!description && !(text.startsWith('link') || text.startsWith('button') || text.startsWith('txt-align') || text.startsWith('txt-horizontal'))) {
        description = text;
      } else if (!textAlign && text.startsWith('txt-align')) {
        textAlign = text.replace('txt-', ''); // vertical alignment
      } else if (!horizontalAlign && text.startsWith('txt-horizontal')) {
        horizontalAlign = text.replace('txt-', ''); // NEW: horizontal alignment
      } else if (!ctaText && !(text.startsWith('link') || text.startsWith('button') || text.startsWith('txt-align') || text.startsWith('txt-horizontal'))) {
        ctaText = text;
      }
    }
  }

  const siblings = block.querySelectorAll(':scope > div:nth-child(n+2) > div');
  const title = siblings[1]?.textContent?.trim() || '';
  const surtitle = siblings[2]?.textContent?.trim() || '';
  const logoImage = siblings[3]?.querySelector('picture')?.outerHTML || '';

  return {
    variation,
    image: mainImage,
    description,
    textAlign,
    horizontalAlign, // return new field
    ctaText,
    ctaLink,
    extraImages,
    title,
    surtitle,
    logoImage,
  };
}

/**
 * Extract data for RFI form hero variation
 */
function extractRfiFormHeroData(block) {
  const rows = [...block.querySelectorAll(':scope > div')].slice(1);
  if (rows.length < 2) return null;

  const contentDiv = rows[0].querySelector('div');
  if (!contentDiv) return null;

  const headingText = rows[1]?.querySelector('div p')?.textContent?.trim() || '';
  const surTitle = rows[2]?.querySelector('div p')?.textContent?.trim() || '';

  const paragraphs = [...contentDiv.querySelectorAll('p')];
  if (paragraphs.length < 2) return null;

  const variation = paragraphs[0]?.textContent?.trim().replace('var-', '') || '';
  const picture = paragraphs[1]?.querySelector('picture')?.outerHTML;

  let description = '';
  let ctaText = '';

  // start from 2nd <p> onward (after var- & image)
  for (let i = 2; i < paragraphs.length; i += 1) {
    const text = paragraphs[i]?.textContent.trim();
    if (!description) {
      description = text;
    } else if (!ctaText) {
      ctaText = text;
    }
  }

  return {
    variation,
    image: picture,
    headingText,
    surTitle,
    description,
    ctaText,
  };
}

/**
 * DOM builder for full-width hero
 */
function createFullWidthDOM(data) {
  const {
    variation, image, description, textAlign, horizontalAlign, ctaText, ctaLink,
    extraImages, title, surtitle, logoImage,
  } = data;

  const section = document.createElement('section');
  section.className = `hero-image hero-image-full ${variation}`;

  if (image) {
    section.insertAdjacentHTML('beforeend', image);
    const insertedPicture = section.querySelector('picture:last-of-type');
    if (insertedPicture) {
      insertedPicture.classList.add('hidden-md', 'hidden-lg');
    }
  }

  const flex = document.createElement('div');
  flex.className = `flex-context ${textAlign || ''} ${horizontalAlign || ''}`.trim();

  const message = document.createElement('div');
  message.className = 'message';

  if (logoImage) {
    message.insertAdjacentHTML('beforeend', logoImage);
  }

  const header = document.createElement('div');
  header.className = 'hero-header';
  const h1 = document.createElement('h1');
  if (surtitle) {
    const small = document.createElement('small');
    small.textContent = surtitle;
    h1.appendChild(small);
  }
  h1.appendChild(document.createTextNode(title));
  header.appendChild(h1);
  message.appendChild(header);

  if (description || ctaText) {
    const lede = document.createElement('p');
    lede.className = 'lede';
    lede.innerHTML = `${description} <br>`;
    if (ctaText && ctaLink) {
      const cta = document.createElement('a');
      cta.href = ctaLink;
      cta.title = ctaText;
      cta.type = 'button';
      cta.className = 'btn btn-news-link';
      cta.textContent = ctaText;
      lede.appendChild(cta);
    }
    message.appendChild(lede);
  }

  flex.appendChild(message);
  section.appendChild(flex);

  if (extraImages.length > 0) {
    const fade = document.createElement('div');
    fade.className = `cross-fade fade-${extraImages.length}`;
    extraImages.forEach((img) => fade.insertAdjacentHTML('beforeend', img));
    section.appendChild(fade);
  }

  return section;
}

/**
 * Helper to create button for partial hero
 */
function createButton(link, text, type, ctaBackgroundColor) {
  if (!link || !text) return null;
  let button;
  if (type === 'link') {
    button = document.createElement('a');
    button.href = link;
    button.title = text;
    button.className = 'btn btn-gradient';
  } else {
    button = document.createElement('a');
    button.href = link;
    button.title = text;
    button.type = 'button';
    button.className = 'btn btn-cta';
    button.classList.add(ctaBackgroundColor);
  }
  button.textContent = text;
  return button;
}

/**
 * DOM builder for partial hero
 */
function buildHeroDOM(data) {
  const {
    variation, imageSrc, imageAlt, headingText, surTitle, description, backgroundClass,
    ctaText, ctaLink, ctaType, grdStyle, ctaBackgroundColor,
  } = data;

  const wrapper = document.createElement('div');
  wrapper.className = 'hero-grid-wrap';
  wrapper.classList.add(grdStyle);

  const section = document.createElement('section');
  section.className = `hero-image ${variation} row-center`;
  section.id = headingText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const mobileImg = createOptimizedPicture(imageSrc, imageAlt, false, [{ width: '750' }]);
  mobileImg.className = 'hidden-md hidden-lg lazyload';
  mobileImg.dataset.src = imageSrc;

  const flex = document.createElement('div');
  flex.className = 'flex-context flex-bottom';
  if (backgroundClass.startsWith('bg')) {
    flex.classList.add(backgroundClass);
  } else {
    flex.style.backgroundColor = backgroundClass;
  }

  const message = document.createElement('div');
  message.className = 'message';
  const textWrap = document.createElement('div');
  textWrap.className = 'hero-text-wrap';

  const header = document.createElement('div');
  header.className = 'hero-header';
  const h1 = document.createElement('h1');
  if (surTitle) {
    const small = document.createElement('small');
    small.textContent = surTitle;
    h1.appendChild(small);
  }
  h1.appendChild(document.createTextNode(headingText));
  header.appendChild(h1);

  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.innerHTML = `${description} <br>`;

  const button = createButton(ctaLink, ctaText, ctaType, ctaBackgroundColor);
  if (button) lede.appendChild(button);

  textWrap.appendChild(header);
  textWrap.appendChild(lede);
  message.appendChild(textWrap);

  const heroImgWrap = document.createElement('div');
  heroImgWrap.className = 'hero-img-wrap';

  const bgDiv = document.createElement('div');
  bgDiv.className = 'image-background-div';

  const desktopImg = document.createElement('img');
  Object.assign(desktopImg, {
    src: imageSrc,
    alt: imageAlt,
    className: 'hidden-xs hidden-sm',
  });

  heroImgWrap.appendChild(bgDiv);
  heroImgWrap.appendChild(desktopImg);

  flex.appendChild(message);
  flex.appendChild(heroImgWrap);

  section.appendChild(mobileImg);
  section.appendChild(flex);
  wrapper.appendChild(section);

  return wrapper;
}

function buildRfiFormHeroDOM(data) {
  const {
    variation, image, headingText, surTitle, description, ctaText,
  } = data;

  const section = document.createElement('section');
  section.className = `hero-image ${variation}`;

  if (image) {
    section.insertAdjacentHTML('beforeend', image);
  }

  const flex = document.createElement('div');
  flex.className = 'flex-context align-start horizontal-right';

  const message = document.createElement('div');
  message.className = 'message';

  // header
  const header = document.createElement('div');
  header.className = 'hero-header';
  const h1 = document.createElement('h1');
  if (surTitle) {
    const small = document.createElement('small');
    small.innerHTML = `${surTitle} <br>`;
    h1.appendChild(small);
  }
  h1.appendChild(document.createTextNode(headingText));
  header.appendChild(h1);

  // description + popup trigger CTA
  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.innerHTML = `${description} <br>`;

  const ctaButton = document.createElement('button');
  ctaButton.type = 'button';
  ctaButton.className = 'btn btn-cta rfi-popup-btn';
  ctaButton.textContent = ctaText || 'Request Info';
  lede.appendChild(ctaButton);

  header.appendChild(lede);
  message.appendChild(header);

  flex.appendChild(message);
  section.appendChild(flex);

  // build popup form DOM
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'popup-overlay';
  popupOverlay.style.display = 'none';

  const popupBox = document.createElement('div');
  popupBox.className = 'popup-box';

  const closeBtn = document.createElement('span');
  closeBtn.className = 'popup-close';
  closeBtn.textContent = '×';

  const form = document.createElement('form');
  form.className = 'popup-form';

  const fields = [
    { label: 'First Name', type: 'text', name: 'firstName' },
    { label: 'Last Name', type: 'text', name: 'lastName' },
    { label: 'Email Address', type: 'email', name: 'email' },
    { label: 'Phone Number', type: 'tel', name: 'phone' },
  ];

  fields.forEach((f, i) => {
    const fieldWrapper = document.createElement('div');
    const id = `${f.name}-${i}`; // unique id for label-input pairing

    const label = document.createElement('label');
    label.textContent = f.label;
    label.className = 'sr-only';
    label.setAttribute('for', id);

    const input = document.createElement('input');
    input.type = f.type;
    input.id = id;
    input.name = f.name;
    input.placeholder = f.label;

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(input);
    form.appendChild(fieldWrapper);
  });

  // program dropdown
  const programWrapper = document.createElement('div');
  const programId = 'program-select';
  const programLabel = document.createElement('label');
  programLabel.textContent = 'Program of Interest';
  programLabel.className = 'sr-only';
  programLabel.setAttribute('for', programId);

  const programSelect = document.createElement('select');
  programSelect.id = programId;
  programSelect.name = 'program';
  ['Choose a Program of Interest', 'Program A', 'Program B', 'Program C'].forEach((optText, idx) => {
    const opt = document.createElement('option');
    opt.value = idx === 0 ? '' : optText;
    opt.textContent = optText;
    if (idx === 0) opt.disabled = true;
    if (idx === 0) opt.selected = true;
    programSelect.appendChild(opt);
  });
  programWrapper.appendChild(programLabel);
  programWrapper.appendChild(programSelect);
  form.appendChild(programWrapper);

  // term dropdown
  const termWrapper = document.createElement('div');
  const termId = 'term-select';
  const termLabel = document.createElement('label');
  termLabel.textContent = 'Anticipated Term of Entry';
  termLabel.className = 'sr-only';
  termLabel.setAttribute('for', termId);

  const termSelect = document.createElement('select');
  termSelect.id = termId;
  termSelect.name = 'term';
  ['Choose an Anticipated Term of Entry', 'Spring 2025', 'Fall 2025', 'Spring 2026'].forEach((optText, idx) => {
    const opt = document.createElement('option');
    opt.value = idx === 0 ? '' : optText;
    opt.textContent = optText;
    if (idx === 0) opt.disabled = true;
    if (idx === 0) opt.selected = true;
    termSelect.appendChild(opt);
  });
  termWrapper.appendChild(termLabel);
  termWrapper.appendChild(termSelect);
  form.appendChild(termWrapper);

  const submitWrapper = document.createElement('div');
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn pop-up-submit-btn';
  submitBtn.textContent = 'Submit';
  submitWrapper.appendChild(submitBtn);
  form.appendChild(submitWrapper);

  popupBox.appendChild(closeBtn);
  popupBox.appendChild(form);
  popupOverlay.appendChild(popupBox);
  section.appendChild(popupOverlay);

  // interactions
  ctaButton.addEventListener('click', () => {
    popupOverlay.style.display = 'flex';
  });
  closeBtn.addEventListener('click', () => {
    popupOverlay.style.display = 'none';
  });

  return section;
}

export default function decorate(block) {
  const variationEl = block.querySelector(':scope > div:nth-child(2) > div > p');
  const variation = variationEl?.textContent?.trim()?.toLowerCase() || '';
  let data = '';
  let heroDOM = '';
  if (variation.includes('full-width')) {
    data = parseHeroFullWidth(block);
    if (!data) return;
    heroDOM = createFullWidthDOM(data);
  } else if (variation.includes('rfi-form')) {
    data = extractRfiFormHeroData(block);
    if (!data) return;
    heroDOM = buildRfiFormHeroDOM(data);
  } else {
    data = extractHeroData(block);
    if (!data) return;
    heroDOM = buildHeroDOM(data);
  }

  block.innerHTML = '';
  block.appendChild(heroDOM);
}
