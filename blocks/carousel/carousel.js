import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import createDataLayerEvent from '../../scripts/analytics-util.js';

function loadSwiperLibWithCarouselConfig() {
  const swiperLibUrl = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js';
  const javaScript = document.createElement('script');
  javaScript.src = swiperLibUrl;
  javaScript.type = 'text/javascript';
  javaScript.onload = () => {
    // eslint-disable-next-line no-undef
    const swiperInstance = new Swiper('.my-swiper', {
      loop: true,
      speed: 600,
      slidesPerView: 1,
      spaceBetween: 10,
      allowTouchMove: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
    return swiperInstance;
  };
  document.head.appendChild(javaScript);
}

function createCarousel(slides, parentBlock) {
  const container = document.createElement('div');
  container.className = 'features-carousel-inner';
  container.innerHTML = `
    <div class="swiper-outer">
      <div class="swiper swiper-container my-swiper">
        <div class="swiper-wrapper"></div>
        ${slides.length > 1
    ? `
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>`
    : ''}
      </div>
    </div>`;

  const wrapper = container.querySelector('.swiper-wrapper');

  slides.forEach((slide, index) => {
    const originalEl = parentBlock[index];
    const slideDiv = document.createElement('div');
    slideDiv.className = 'swiper-slide';

    const img = slide.image
      ? createOptimizedPicture(slide.image.src, slide.image.alt, false)
      : null;

    slideDiv.innerHTML = `
      <div class="single-article-feature-container">
        ${img ? `<div class="single-article-feature-inner">${img.outerHTML}</div>` : ''}
        <div class="featured-article-text">
          <div class="featured-article-text-inner">
            ${slide.title ? `<h2>${slide.title}</h2>` : ''}
            ${slide.description || ''}
            ${Array.isArray(slide.button) && slide.button.length === 2
    ? `<p class="button-container"><a class="button" href="${slide.button[1]}">${slide.button[0]}</a></p>`
    : ''}
          </div>
        </div>
      </div>`;

    if (originalEl) {
      moveInstrumentation(originalEl, slideDiv);
    }
    wrapper.appendChild(slideDiv);
  });

  return container;
}

function labelCarouselData(dataArray) {
  return {
    image: dataArray[0] || null,
    title: dataArray[1] || null,
    description: dataArray[2] || null,
    button: dataArray[3] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children);

  const carouselData = children.map((child, index) => {
    if (index === 2) {
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

  return { carouselData };
}

export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const labeledDataArray = parentBlock.map((childBlock) => {
    const extractedData = extractContainerData(childBlock);
    return labelCarouselData(extractedData.carouselData);
  });

  const slides = createCarousel(labeledDataArray, parentBlock);
  moveInstrumentation(block, slides);
  block.textContent = '';
  block.appendChild(slides);

  loadSwiperLibWithCarouselConfig();

  const ctas = slides.querySelectorAll('a.button');
  ctas.forEach((link) => {
    createDataLayerEvent('click', 'click', () => ({
      linkName: link.textContent.trim(),
      linkURL: link.href,
      linkType: 'cta',
      linkRegion: 'hero',
      componentName: 'Carousel',
      componentId: 'carousel',
    }), link);
  });
}
