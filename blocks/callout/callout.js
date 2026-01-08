import createDataLayerEvent from '../../scripts/analytics-util.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function createViewAllDom(viewAllCta) {
  const p = document.createElement('p');
  p.className = 'see-all';

  const a = document.createElement('a');
  a.href = viewAllCta[1] || '#';
  a.tabIndex = 0;
  a.textContent = viewAllCta[0] || 'View All';

  createDataLayerEvent('click', 'click', () => ({
    linkName: a.textContent,
    linkURL: a.href,
    linkType: 'cta',
    linkRegion: 'content',
    componentName: 'Callout',
    componentId: 'callout',
  }), a);

  p.appendChild(a);
  return p;
}

function makeBlockClickable(blockElement, url, title) {
  if (!blockElement || !url) return;

  blockElement.style.cursor = 'pointer';

  blockElement.addEventListener('click', () => {
    window.location.href = url;
  });

  createDataLayerEvent('click', 'click', () => ({
    linkName: title,
    linkURL: url,
    linkType: 'cta',
    linkRegion: 'main',
    componentName: 'Callout',
    componentId: 'callout',
  }), blockElement);

  // Optional: keyboard accessibility
  blockElement.setAttribute('tabindex', '0');
  blockElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      window.location.href = url;
    }
  });

  createDataLayerEvent('keypress', 'click', () => ({
    linkName: title,
    linkURL: url,
    linkType: 'cta',
    linkRegion: 'main',
    componentName: 'Callout',
    componentId: 'callout',
  }), blockElement, (e) => (!(e.key === 'Enter' || e.key === ' ')));
}

function enableActiveOnHover(gridBlock) {
  const callout = gridBlock.querySelector('.callout-block.linkify');
  if (!callout) return;

  // Mouse hover
  callout.addEventListener('mouseenter', () => {
    callout.classList.add('active');
  });
  callout.addEventListener('mouseleave', () => {
    callout.classList.remove('active');
  });

  // Touch (mobile/tablet)
  callout.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    callout.classList.add('active');
  });

  // If user taps elsewhere, remove active
  document.addEventListener('touchstart', (e) => {
    if (!callout.contains(e.target)) {
      callout.classList.remove('active');
    }
  });
}

function createGridBlock(data) {
  // Outer container
  const gridBlock = document.createElement('div');
  gridBlock.className = 'grid-block';

  // Callout container
  const calloutBlock = document.createElement('div');
  calloutBlock.className = 'callout-block linkify';

  // Image
  if (data.image && data.image.src) {
    const img = createOptimizedPicture(data.image.src, data.image.alt, false, [{ width: '750' }]);
    calloutBlock.appendChild(img);
  }

  // Inner span
  const inner = document.createElement('span');
  inner.className = 'callout-block-inner';
  inner.style.height = '380px'; // you can make dynamic if needed

  // Title wrapper
  const titleSpan = document.createElement('span');
  titleSpan.className = 'title';

  const truncate = document.createElement('span');
  truncate.className = 'truncate';

  const link = document.createElement('a');
  link.href = data.cta1 || '#';
  link.tabIndex = 0;
  link.textContent = data.title || '';

  createDataLayerEvent('click', 'click', () => ({
    linkName: link.textContent,
    linkURL: link.href,
    linkType: 'cta',
    linkRegion: 'main',
    componentName: 'Callout',
    componentId: 'callout',
  }), link);

  truncate.appendChild(link);
  titleSpan.appendChild(truncate);

  // Description
  const descSpan = document.createElement('span');
  descSpan.className = 'description';
  descSpan.textContent = data.description || '';

  // Put together
  inner.appendChild(titleSpan);
  inner.appendChild(descSpan);
  calloutBlock.appendChild(inner);
  gridBlock.appendChild(calloutBlock);

  // View All CTA
  if (data.viewAllCta && data.viewAllCta.length === 2) {
    const viewAllDom = createViewAllDom(data.viewAllCta);
    gridBlock.appendChild(viewAllDom);
  }

  // moveInstrumentation(blockElement, gridBlock);

  return gridBlock;
}

function labelCallOutData(dataArray) {
  return {
    title: dataArray[0] || null,
    description: dataArray[1] || null,
    image: dataArray[2] || null,
    cta1: dataArray[3] || null,
    viewAllCta: dataArray[4] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const data = children.map((child) => {
    // if (index === 8) {
    //   return child.innerHTML.trim();
    // }
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
  return { data };
}

export default function decorate(block) {
  block.parentNode.classList.add('flex-parent-1');
  const nav = document.createElement('nav');
  nav.className = 'block-grid-container fs-equalize-element';

  const layout = document.createElement('div');
  layout.className = 'layout';

  nav.appendChild(layout);

  const extractedData = extractContainerData(block);
  const labeledData = labelCallOutData(extractedData.data);
  const calloutDom = createGridBlock(labeledData);
  layout.appendChild(calloutDom);

  enableActiveOnHover(calloutDom);
  makeBlockClickable(calloutDom, labeledData.cta1, labeledData.title);

  moveInstrumentation(block, calloutDom);

  block.textContent = '';
  block.appendChild(nav);
}
