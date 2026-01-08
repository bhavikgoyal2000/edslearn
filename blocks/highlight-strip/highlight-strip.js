import createDataLayerEvent from '../../scripts/analytics-util.js';

function fetchHighlightStripData(block) {
  const paragraphs = [...block.querySelectorAll('p')];

  let imageUrl = '';
  let backgroundStyle = '';
  let desktopPicture = document.createElement('picture');
  let hoverPicture = document.createElement('picture');
  let mobilePicture = document.createElement('picture');

  if (paragraphs.length < 2) {
    return {
      imageUrl,
      backgroundStyle,
      desktopPicture,
      hoverPicture,
      mobilePicture,
    };
  }

  let styleIndex = 0;

  // Image URL (optional)
  const firstAnchor = paragraphs[0].querySelector('a');
  if (firstAnchor) {
    imageUrl = firstAnchor.getAttribute('href') || '';
    styleIndex = 1;
  }

  // Background style (required)
  backgroundStyle = paragraphs[styleIndex]?.textContent?.trim() || '';

  // Collect all picture tags after style
  const pictureTags = [];
  for (let i = styleIndex + 1; i < paragraphs.length; i += 1) {
    const picture = paragraphs[i].querySelector('picture');
    if (picture) pictureTags.push(picture);
  }

  const [pic1, pic2, pic3] = pictureTags;

  if (pictureTags.length === 3) {
    [desktopPicture, hoverPicture, mobilePicture] = [pic1, pic2, pic3];
  } else if (pictureTags.length === 2) {
    [desktopPicture, mobilePicture] = [pic1, pic2];
    hoverPicture = document.createElement('picture'); // keep empty
  }

  return {
    imageUrl,
    backgroundStyle,
    desktopPicture,
    hoverPicture,
    mobilePicture,
  };
}

function buildHighlightStripDOM(data) {
  const {
    imageUrl,
    backgroundStyle,
    desktopPicture,
    hoverPicture,
    mobilePicture,
  } = data;

  const wrapper = document.createElement('div');
  wrapper.classList.add('row-center');

  const container = imageUrl ? document.createElement('a') : document.createElement('div');
  if (imageUrl) container.setAttribute('href', imageUrl);

  const desktopClone = desktopPicture.cloneNode(true);
  desktopClone.classList.add('highlight-desktop');

  const mobileClone = mobilePicture.cloneNode(true);
  mobileClone.classList.add('highlight-mobile');

  container.appendChild(desktopClone);

  const hasHover = hoverPicture?.querySelector('img');
  if (hasHover) {
    const hoverClone = hoverPicture.cloneNode(true);
    hoverClone.classList.add('highlight-hover');
    container.appendChild(hoverClone);
  }

  container.appendChild(mobileClone);
  wrapper.appendChild(container);

  return { wrapper, backgroundStyle };
}

export default function decorate(block) {
  const slicedBlock = document.createElement('div');
  slicedBlock.append(...Array.from(block.children).slice(1));
  const data = fetchHighlightStripData(slicedBlock);
  const dom = buildHighlightStripDOM(data);

  if (!dom) return;

  block.innerHTML = '';

  if (dom.backgroundStyle === 'style-digonal-striped') {
    const bgUrl = `${window.hlx.codeBasePath}/blocks/highlight-strip/background-img.png`;
    block.style.background = `#ebebec url('${bgUrl}') repeat`;
  }

  block.appendChild(dom.wrapper);
  const highlightLink = dom.wrapper.querySelector('a[href]');
  if (highlightLink) {
    createDataLayerEvent('click', 'HighlightStrip:Click', () => ({
      linkName: highlightLink.textContent.trim(),
      linkURL: highlightLink.href,
      linkType: 'cta',
      linkRegion: 'main',
      componentName: 'Highlight Strip',
      componentId: 'highlight-strip',
    }), highlightLink);
  }
}
