/**
 * Utility: Formats a date string like "2025-10-07T00:00:00"
 * into "15 May, 2024" (for page listing)
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr; // fallback if invalid

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatted = date.toLocaleDateString('en-GB', options); // "15 May 2024"

  // Insert comma before year → "15 May, 2024"
  const parts = formatted.split(' ');
  if (parts.length === 3) {
    return `${parts[0]} ${parts[1]}, ${parts[2]}`;
  }
  return formatted;
}

/**
 * Fetches authored data from the wcl-story block.
 * Handles slicing (removing) the isGlobal div before reading other fields.
 * Returns an object containing all field values.
 */
function fetchWclStoryData(block) {
  if (!block) return null;

  // Remove and read isGlobal (first div)
  const firstDiv = block.querySelector(':scope > div:first-child');
  if (firstDiv) firstDiv.remove();

  // Collect all divs again after removal
  const divs = Array.from(block.children);

  const selectStyle = divs[0]?.querySelector('div, p')?.textContent.trim().replace('style-', '') || '';
  const pictureEl = divs[1]?.querySelector('picture') || '';
  const title = divs[2]?.querySelector('div, p')?.textContent.trim() || '';
  const href = divs[3]?.querySelector('a')?.getAttribute('href') || '';
  const subTitle = divs[4]?.querySelector('div, p')?.textContent.trim() || '';
  const content = divs[5]?.querySelector('div')?.outerHTML.trim() || '';
  const date = divs[6]?.querySelector('div, p')?.textContent.trim() || '';

  return {
    selectStyle,
    pictureEl,
    title,
    href,
    subTitle,
    content,
    date,
  };
}

/**
 * Creates DOM structure based on selected style.
 */
function createDOMForStyle({
  selectStyle,
  pictureEl,
  title,
  href,
  subTitle,
  content,
  date,
}) {
  const wrapperDiv = document.createElement('div');

  //  Updated: style-wcl-article
  if (selectStyle === 'wcl-article') {
    wrapperDiv.className = `${selectStyle} article-block-story linkify`;
    wrapperDiv.style.height = '400px';

    if (pictureEl) {
      const imgTag = pictureEl.querySelector('img');
      if (imgTag) wrapperDiv.appendChild(imgTag);
    }

    const inner = document.createElement('span');
    inner.className = 'article-block-inner';
    inner.style.height = '400px';

    // CATEGORY
    const categorySpan = document.createElement('span');
    categorySpan.className = 'category';
    categorySpan.setAttribute('tabindex', '-1');
    categorySpan.textContent = subTitle;
    inner.appendChild(categorySpan);

    // ARTICLE (only if we have title or url)
    if (title || href) {
      const article = document.createElement('span');
      article.className = 'article ';
      inner.appendChild(article);

      const truncate = document.createElement('span');
      truncate.className = 'truncate';
      article.appendChild(truncate);

      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.setAttribute('tabindex', '0');
        a.textContent = title;
        truncate.appendChild(a);
      } else if (title) {
        const span = document.createElement('span');
        span.textContent = title;
        truncate.appendChild(span);
      }
    }

    // SUMMARY
    if (content) {
      const descSpan = document.createElement('span');
      descSpan.className = 'description';
      descSpan.innerHTML = content;
      inner.appendChild(descSpan);
    }

    wrapperDiv.appendChild(inner);

    // Make whole block clickable
    if (href) {
      wrapperDiv.style.cursor = 'pointer';
      wrapperDiv.addEventListener('click', (e) => {
        // Prevent double navigation if actual <a> inside is clicked
        if (e.target.tagName.toLowerCase() !== 'a') {
          window.location.href = href;
        }
      });
    }
  } else if (selectStyle === 'faculty-block') {
    wrapperDiv.className = `${selectStyle}-wrapper`;

    const photoDiv = document.createElement('div');
    photoDiv.className = `${selectStyle}-photo`;
    if (pictureEl) photoDiv.appendChild(pictureEl);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'details';

    const link = document.createElement('a');
    link.href = href;
    link.textContent = title;
    link.className = 'detail-link';

    const subtitleSpan = document.createElement('span');
    subtitleSpan.className = 'subtitle';
    subtitleSpan.textContent = subTitle;

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = content;

    detailsDiv.append(link, subtitleSpan, contentDiv);
    wrapperDiv.append(photoDiv, detailsDiv);
  } else if (selectStyle === 'impact-story-with-text') {
    wrapperDiv.className = selectStyle;

    const photoDiv = document.createElement('div');
    photoDiv.className = `${selectStyle}-photo`;
    if (pictureEl) photoDiv.appendChild(pictureEl);

    const wrapperInner = document.createElement('span');
    wrapperInner.className = 'title';

    const detailWrapper = document.createElement('div');
    detailWrapper.className = 'detail-wrapper';

    const link = document.createElement('a');
    link.href = href;
    link.className = 'detail-link';
    link.textContent = title;

    wrapperInner.appendChild(link);
    detailWrapper.appendChild(wrapperInner);
    wrapperDiv.append(photoDiv, detailWrapper);
  } else if (selectStyle === 'page-listing') {
    wrapperDiv.className = `${selectStyle}-item`;

    if (pictureEl) wrapperDiv.appendChild(pictureEl);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'listing-header';

    const heading = document.createElement('h2');
    heading.className = 'listing-heading';

    const link = document.createElement('a');
    link.href = href;
    link.className = 'listing-link';
    link.textContent = title;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    dateDiv.textContent = formatDate(date);

    heading.appendChild(link);
    headerDiv.append(heading, dateDiv);

    const descDiv = document.createElement('div');
    descDiv.className = 'listing-description';

    const p = document.createElement('p');
    p.innerHTML = content;

    const readMore = document.createElement('a');
    readMore.href = href;
    readMore.className = 'read-more-link';
    readMore.textContent = 'Read more';

    descDiv.append(p, readMore);
    wrapperDiv.append(headerDiv, descDiv);
  } else {
    wrapperDiv.textContent = 'Invalid or missing style.';
  }

  return wrapperDiv;
}

/**
 * Decorates the wcl-story block.
 */
export default function decorate(block) {
  block.parentNode.classList.add('flex-parent-1');
  const data = fetchWclStoryData(block);
  if (!data) return;

  const newDOM = createDOMForStyle(data);
  block.textContent = '';
  block.appendChild(newDOM);
}
