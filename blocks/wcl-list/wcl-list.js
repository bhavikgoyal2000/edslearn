function createElement(tag, className, content, isHTML = false) {
  if (!content) return null;
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (isHTML) {
    el.innerHTML = content;
  } else {
    el.textContent = content;
  }
  return el;
}

function createDirectoryListing(data) {
  if (!data) return null;

  // Container
  const container = document.createElement('div');
  container.className = 'directory-listing-container';

  const layout = document.createElement('div');
  layout.className = 'layout wcl-listing-wrapper';
  container.appendChild(layout);

  const listing = document.createElement('div');
  listing.className = 'directory-listing';
  layout.appendChild(listing);

  const item = document.createElement('div');
  item.className = 'directory-item';
  listing.appendChild(item);

  // Type
  const type = createElement('div', 'type', data.type);
  if (type) item.appendChild(type);

  // Title + URL
  if (data.title) {
    const h2 = document.createElement('h2');
    if (data.url) {
      const link = document.createElement('a');
      link.textContent = data.title;
      link.href = data.url;
      h2.appendChild(link);
    } else {
      h2.textContent = data.title;
    }
    item.appendChild(h2);
  }

  // Description
  const desc = createElement('div', 'd desc', data.description, true);
  if (desc) item.appendChild(desc);

  // Info section
  const info = document.createElement('div');
  info.className = 'info';

  const phone = createElement('p', 'phone', data.phone);
  if (phone) info.appendChild(phone);

  if (data.email) {
    const pEmail = document.createElement('p');
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${data.email}`;
    emailLink.textContent = data.email;
    pEmail.appendChild(emailLink);
    info.appendChild(pEmail);
  }

  const address = createElement('p', 'address', data.address, true);
  if (address) info.appendChild(address);

  if (info.childNodes.length > 0) {
    item.appendChild(info);
  }

  return container;
}

function labelWclListData(dataArray) {
  return {
    type: dataArray[0] || null,
    title: dataArray[1] || null,
    url: dataArray[2] || null,
    description: dataArray[3] || null,
    phone: dataArray[4] || null,
    email: dataArray[5] || null,
    address: dataArray[6] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const data = children.map((child, index) => {
    if (index === 3 || index === 6) {
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
  return { data };
}

export default function decorate(block) {
  const extractedData = extractContainerData(block);
  const labeledData = labelWclListData(extractedData.data);
  const directoryDom = createDirectoryListing(labeledData);

  block.textContent = '';
  block.appendChild(directoryDom);
}
