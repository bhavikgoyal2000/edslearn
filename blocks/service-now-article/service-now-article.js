function extractData(block) {
  const rows = [...block.children].slice(1);
  const data = {};

  rows.forEach((row) => {
    const key = row.children[0]?.textContent?.trim();
    const valueCell = row.children[1];

    if (!key || !valueCell) return;

    if (key === 'apiResponse') {
      data.apiResponse = valueCell.innerHTML.trim();
    } else {
      data[key] = valueCell.textContent.trim();
    }
  });

  return {
    articleNumber: data.serviceNowArticleNumber,
    apiResponse: data.apiResponse,
    displaySelection: data.displaySelection,
    color: data.color,
  };
}


/* ================= FULL PAGE ================= */

function renderFullPage(data) {
  const section = document.createElement('section');
  section.className = 'sn-article sn-full-page';

  const content = document.createElement('div');
  content.className = 'sn-content';
  content.innerHTML = data.apiResponse;

  section.appendChild(content);
  return section;
}

/* ================= MODAL ================= */

function renderModal(data) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sn-modal-wrapper';

  const btn = document.createElement('button');
  btn.className = 'sn-btn';
  btn.textContent = 'View Article';

  const overlay = document.createElement('div');
  overlay.className = 'sn-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'sn-modal';

  const close = document.createElement('span');
  close.className = 'sn-close';
  close.textContent = '×';

  const content = document.createElement('div');
  content.className = 'sn-content';
  content.innerHTML = data.apiResponse;

  btn.onclick = () => overlay.classList.add('open');
  close.onclick = () => overlay.classList.remove('open');

  modal.append(close, content);
  overlay.appendChild(modal);
  wrapper.append(btn, overlay);

  return wrapper;
}

/* ================= COLLAPSIBLE ================= */

function renderCollapsible(data) {
  const wrapper = document.createElement('div');
  wrapper.className = `sn-collapsible bg-${data.color || 'gray'}`;

  const header = document.createElement('button');
  header.className = 'sn-collapsible-header';
  header.textContent = 'View Article';

  const body = document.createElement('div');
  body.className = 'sn-collapsible-body';
  body.innerHTML = data.apiResponse;

  header.onclick = () => body.classList.toggle('open');

  wrapper.append(header, body);
  return wrapper;
}

/* ================= DECORATE ================= */

export default function decorate(block) {
  const data = extractData(block);
  if (!data?.apiResponse) return;

  let rendered;

  switch (data.displaySelection) {
    case 'fullPage':
      rendered = renderFullPage(data);
      break;
    case 'modalPopup':
      rendered = renderModal(data);
      break;
    case 'collapsible':
      rendered = renderCollapsible(data);
      break;
    default:
      return;
  }

  block.innerHTML = '';
  block.appendChild(rendered);
}
