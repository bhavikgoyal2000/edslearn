/* Fetch listData */
function fetchBlockData(block) {
  const data = {
    heading: '',
    listStyle: '',
    listItems: [],
  };

  const paras = Array.from(block.querySelectorAll('p'));

  if (paras[0]) {
    data.heading = paras[0].textContent.trim();
  }

  if (paras[1]) {
    data.listStyle = paras[1].textContent.trim();
  }

  const ulEl = block.querySelector('ul, ol');
  if (ulEl) {
    data.listItems = Array.from(ulEl.querySelectorAll('li')).map((li) => {
      const link = li.querySelector('a');
      return link
        ? { text: link.textContent.trim(), href: link.href, title: link.title || '' }
        : { text: li.textContent.trim(), href: '', title: '' };
    });
  }

  return data;
}

function buildDOMStructure({ heading, listItems, listStyle }) {
  // Create <figure>
  const figure = document.createElement('figure');
  if (listStyle.includes('compact')) {
    figure.classList.add('compact-links');
  }
  if (listStyle.includes('ordered')) {
    figure.classList.add('task-group-container');
  }

  // Add figcaption
  if (heading) {
    const caption = document.createElement('figcaption');
    caption.textContent = heading;
    figure.appendChild(caption);
  }

  // Create UL with style class
  const isUnordered = listStyle.includes('unordered') || listStyle.includes('compact');
  const listEl = document.createElement(isUnordered ? 'ul' : 'ol');
  if (listStyle.includes('compact')) {
    listEl.classList.add('compact');
  }
  if (listStyle.includes('ordered')) {
    listEl.classList.add('task-group');
  }

  // Add list items
  listItems.forEach(({ text, href, title }) => {
    const li = document.createElement('li');
    if (listStyle.includes('ordered')) {
      li.classList.add('task-group-item');
    }
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      if (title) a.title = title;
      a.textContent = text;
      li.appendChild(a);
    } else {
      li.textContent = text;
    }
    listEl.appendChild(li);
  });

  figure.appendChild(listEl);
  return figure;
}

export default function decorate(block) {
  const data = fetchBlockData(block);
  const dom = buildDOMStructure(data);

  block.textContent = '';
  block.appendChild(dom);
}
