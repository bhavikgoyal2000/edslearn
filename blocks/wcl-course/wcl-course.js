function createWclCourseDom(data) {
  if (!data || typeof data !== 'object') return null;

  const root = document.createElement('div');
  root.className = 'article-block course linkify';
  root.style.height = '350px';

  const inner = document.createElement('span');
  inner.className = 'article-block-inner';
  inner.style.height = '350px';
  root.appendChild(inner);

  // CATEGORY
  if (data.category && String(data.category).trim()) {
    const categorySpan = document.createElement('span');
    categorySpan.className = 'category';
    categorySpan.setAttribute('tabindex', '-1');
    categorySpan.textContent = data.category.trim();
    inner.appendChild(categorySpan);
  }

  // ARTICLE (only if we have title or url)
  if ((data.title && String(data.title).trim()) || (data.url && String(data.url).trim())) {
    const article = document.createElement('span');
    article.className = 'article ';
    inner.appendChild(article);

    const truncate = document.createElement('span');
    truncate.className = 'truncate';
    article.appendChild(truncate);

    const titleText = (data.title && data.title.trim()) || '';

    if (data.url && String(data.url).trim()) {
      const a = document.createElement('a');
      a.href = data.url.trim();
      a.setAttribute('tabindex', '0');
      a.textContent = titleText;
      truncate.appendChild(a);
    } else if (titleText) {
      const span = document.createElement('span');
      span.textContent = titleText;
      truncate.appendChild(span);
    }
  }

  // SUMMARY
  if (data.summary && String(data.summary).trim()) {
    const numberSpan = document.createElement('span');
    numberSpan.className = 'number';
    numberSpan.innerHTML = data.summary.trim();
    inner.appendChild(numberSpan);
  }

  // Make whole block clickable
  if (data.url && String(data.url).trim()) {
    const cleanUrl = data.url.trim();
    root.style.cursor = 'pointer';
    root.addEventListener('click', (e) => {
      // Prevent double navigation if actual <a> inside is clicked
      if (e.target.tagName.toLowerCase() !== 'a') {
        window.location.href = cleanUrl;
      }
    });
  }

  return root;
}

function labelWclCourseData(dataArray) {
  return {
    category: dataArray[0] || null,
    title: dataArray[1] || null,
    summary: dataArray[2] || null,
    url: dataArray[3] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const data = children.map((child, index) => {
    if (index === 2) {
      return child.innerHTML.trim();
    }
    const ps = child.querySelectorAll('p');
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
  const extractedData = extractContainerData(block);
  const labeledData = labelWclCourseData(extractedData.data);
  const wclCourseDom = createWclCourseDom(labeledData);

  block.textContent = '';
  block.appendChild(wclCourseDom);
}
