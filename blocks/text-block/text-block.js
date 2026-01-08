function fetchBlockData(block) {
  const data = {
    title: '',
    padding: '',
    layout: '',
    image: '',
    picture: '',
    displayCaption: '',
    quoteCitation: '',
    subTitle: '',
    content: '',
    quote: '',
  };

  const allDivs = Array.from(block.querySelectorAll(':scope > div')).slice(1);

  const firstInnerDiv = allDivs[0];
  const firstSectionParas = firstInnerDiv ? Array.from(firstInnerDiv.querySelectorAll('p')) : [];

  const picture = block.querySelector('picture');
  const img = picture ? picture.querySelector('img') : null;

  if (picture) {
    data.picture = picture;
  }

  const hasPadding = firstSectionParas.some((p) => p.textContent.trim().toLowerCase().startsWith('padding-'));
  const hasLayout = firstSectionParas.some((p) => p.textContent.trim().toLowerCase().startsWith('layout-'));
  const hasDisplayCaption = firstSectionParas.some((p) => p.textContent.trim().toLowerCase() === 'display-caption');

  if (!hasPadding && !hasLayout && !hasDisplayCaption && firstSectionParas.length === 2) {
    data.title = firstSectionParas[0].textContent.trim();
    data.quoteCitation = firstSectionParas[1].textContent.trim();
  } else {
    let titleAssigned = false;

    firstSectionParas.forEach((p) => {
      const text = p.textContent.trim();
      const lower = text.toLowerCase();

      if (!titleAssigned && !lower.startsWith('padding-') && !lower.startsWith('layout-') && lower !== 'display-caption') {
        data.title = text;
        titleAssigned = true;
        return;
      }

      if (lower.startsWith('padding-')) {
        data.padding = text;
        return;
      }

      if (lower.startsWith('layout-')) {
        data.layout = text.replace(/^layout-/, '');
        return;
      }

      if (lower === 'display-caption') {
        if (img) data.displayCaption = img.alt || '';
        return;
      }

      if (!data.quoteCitation && text) {
        data.quoteCitation = text;
      }
    });
  }

  const subTitleP = block.querySelector(':scope > div:nth-of-type(3) p');
  const contentP = block.querySelector(':scope > div:nth-of-type(4) > div');
  const quoteP = block.querySelector(':scope > div:nth-of-type(5) > div');

  if (subTitleP) data.subTitle = subTitleP.textContent.trim();
  if (contentP) data.content = contentP.innerHTML.trim();
  if (quoteP) data.quote = quoteP.innerHTML.trim();

  return data;
}

function createBlockDOM(data) {
  const section = document.createElement('div');
  section.className = 'row row-center';

  // ---------- Header ----------
  const header = document.createElement('div');

  const h1 = document.createElement('h1');
  h1.textContent = data.title || '';

  if (data.subTitle) {
    const small = document.createElement('small');
    small.textContent = data.subTitle;
    h1.appendChild(small);
  }

  header.appendChild(h1);
  section.appendChild(header);

  // ---------- Main Content Wrapper ----------
  const contentWrapper = document.createElement('div');

  // ---------- Quote ----------
  if (data.quote) {
    const aside = document.createElement('aside');
    if (data.layout) aside.className = data.layout;

    if (data.quote.trim() !== '') {
      const blockquote = document.createElement('blockquote');
      blockquote.insertAdjacentHTML('beforeend', data.quote);
      aside.appendChild(blockquote);
    }

    if (data.quoteCitation) {
      const cite = document.createElement('cite');
      cite.textContent = data.quoteCitation;
      aside.appendChild(cite);
    }

    contentWrapper.appendChild(aside);
  }

  // ---------- Image with Figure & Figcaption ----------
  if (data.picture) {
    const figure = document.createElement('figure');

    if (data.layout) {
      figure.classList.add(data.layout);
    }

    figure.appendChild(data.picture);

    if (data.displayCaption && typeof data.displayCaption === 'string') {
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = data.displayCaption;
      figure.appendChild(figcaption);
    }

    contentWrapper.appendChild(figure);
  }

  // ---------- Content ----------
  const content = document.createElement('div');
  content.insertAdjacentHTML('beforeend', data.content);
  contentWrapper.appendChild(content);

  section.appendChild(contentWrapper);
  return section;
}

export default function decorate(block) {
  const data = fetchBlockData(block);

  // Apply padding to the block's parent
  if (data.padding && block.parentElement) {
    block.parentElement.classList.add(data.padding);
  }

  block.textContent = '';

  const dom = createBlockDOM(data);
  block.appendChild(dom);
}
