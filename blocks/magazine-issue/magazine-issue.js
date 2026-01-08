import { cleanAEMUrl } from '../../scripts/util.js';

function createImageLink(imageData, fancyboxGroup = 'archive-issue') {
  const link = document.createElement('a');
  link.href = imageData.src;
  link.setAttribute('data-fancybox', fancyboxGroup);
  link.setAttribute('data-caption', imageData.alt || '');
  link.className = 'decor';

  const img = document.createElement('img');
  img.src = imageData.src;
  img.alt = imageData.alt || '';

  link.appendChild(img);
  return link;
}

function createTitleCaption(title) {
  if (!title) return document.createElement('div');

  const figcaption = document.createElement('figcaption');
  const h2 = document.createElement('h2');
  h2.textContent = title;
  figcaption.appendChild(h2);

  return figcaption;
}

function createDescriptionCaption(description) {
  if (!description) return document.createElement('div');

  const figcaption = document.createElement('figcaption');
  const p = document.createElement('p');
  p.innerHTML = description;
  figcaption.appendChild(p);

  return figcaption;
}
function createOnlineStories(url) {
  if (!url) return document.createElement('div');

  const p = document.createElement('p');
  const link = document.createElement('a');
  link.href = cleanAEMUrl(url);
  link.textContent = 'Online Stories';
  p.appendChild(link);
  return p;
}

function createMagazineDOM(data) {
  const magazineDiv = document.createElement('div');
  magazineDiv.className = 'magazine-issue';
  magazineDiv.classList.add(data.displayStyle);

  const figure = document.createElement('figure');

  // modular image link
  const link = createImageLink(data.image, 'archive-issue');
  figure.appendChild(link);

  // modular title caption
  const titleCaption = createTitleCaption(data.title);
  if (titleCaption) figure.appendChild(titleCaption);

  // NEW: long paragraph caption support
  const descriptionCaption = createDescriptionCaption(data.description);
  if (descriptionCaption) figure.appendChild(descriptionCaption);

  magazineDiv.appendChild(figure);

  // modular online link
  const stories = createOnlineStories(data.linkUrl);
  magazineDiv.appendChild(stories);

  return magazineDiv;
}

function loadFancyboxLib() {
  const fancyboxLink = document.querySelector('link[href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1/dist/fancybox/fancybox.css"]');
  if (!fancyboxLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1/dist/fancybox/fancybox.css';
    document.head.appendChild(link);
  }

  const fancyboxScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1/dist/fancybox/fancybox.umd.js"]');
  if (!fancyboxScript) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1/dist/fancybox/fancybox.umd.js';
    script.onload = () => {
      // Fancybox loaded
      if (window.Fancybox) {
        // Initialize Fancybox for elements with data-fancybox attribute
        window.Fancybox.bind('[data-fancybox]', {
          // Custom options can be added here
        });
      }
    };
    document.body.appendChild(script);
  }
}

function labelMagazineData(dataArray) {
  return {
    displayStyle: dataArray[0] || null,
    image: dataArray[1] || null,
    title: dataArray[2] || null,
    linkUrl: dataArray[3] || null,
    description: dataArray[4] || null,
  };
}

function extractMagazineContainerData(containerElement) {
  const magazineData = containerElement.map((child, index) => {
    if (index === 4) {
      return child.innerHTML.trim();
    }
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
  return { magazineData };
}

export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const extractedData = extractMagazineContainerData(parentBlock);
  const labeledData = labelMagazineData(extractedData.magazineData);
  const magazineDom = createMagazineDOM(labeledData);
  block.textContent = '';
  block.appendChild(magazineDom);
  loadFancyboxLib();
}
