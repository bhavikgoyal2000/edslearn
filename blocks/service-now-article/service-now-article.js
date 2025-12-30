function extractData(block) {
  const rows = [...block.children].slice(1);

  const getValue = (row) => row?.children[1];

  return {
    articleNumber: getValue(rows[0])?.textContent?.trim(),
    apiResponse: getValue(rows[1])?.innerHTML?.trim(),
    displaySelection: getValue(rows[2])?.textContent?.trim(),
    color: getValue(rows[3])?.textContent?.trim(),
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
