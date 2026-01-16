/* eslint-disable max-len */
import { SERVER_URL } from '../../scripts/constants.js';

function extractData(block) {
  const [serviceNowArticleNumberObj, displaySelectionObj, colorObj] = Array.from(block.children).slice(1);
  const serviceNowArticleNumber = serviceNowArticleNumberObj ? serviceNowArticleNumberObj.textContent.trim() : '';
  const displaySelection = displaySelectionObj ? displaySelectionObj.textContent.trim() : '';
  const color = colorObj ? colorObj.textContent.trim() : '';

  return {
    articleNumbers: serviceNowArticleNumber
      ?.split(',')
      .map((v) => v.trim())
      .filter(Boolean),

    displaySelection,
    color,
  };
}

/* ================= FULL PAGE ================= */

function renderFullPage(data) {
  const section = document.createElement('section');
  section.className = 'sn-article sn-full-page';

  if (data.title) {
    const heading = document.createElement('h2');
    heading.className = 'sn-title';
    heading.textContent = data.title;
    section.appendChild(heading);
  }

  const content = document.createElement('div');
  content.className = 'sn-content';
  content.innerHTML = data.desc;

  section.appendChild(content);
  return section;
}

/* ================= MODAL ================= */

function renderModal(data) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sn-modal-wrapper';

  const btn = document.createElement('button');
  btn.className = 'sn-info-btn';

  const icon = document.createElement('span');
  icon.className = 'sn-info-icon';
  icon.textContent = 'i';

  const text = document.createElement('span');
  text.className = 'sn-info-text';
  text.textContent = 'more info';

  btn.append(icon, text);

  const overlay = document.createElement('div');
  overlay.className = 'sn-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'sn-modal';

  /* ===== HEADER ===== */
  const header = document.createElement('div');
  header.className = `sn-modal-header ${data.color || ''}`;

  const title = document.createElement('h2');
  title.className = 'sn-modal-title';
  title.textContent = data.title || '';

  const close = document.createElement('button');
  close.className = 'sn-close';
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = '&times;';

  header.append(title, close);

  /* ===== BODY ===== */
  const content = document.createElement('div');
  content.className = 'sn-content';
  content.innerHTML = data.desc;

  btn.onclick = () => overlay.classList.add('open');
  close.onclick = () => overlay.classList.remove('open');

  modal.append(header, content);
  overlay.appendChild(modal);
  wrapper.append(btn, overlay);

  return wrapper;
}

/* ================= COLLAPSIBLE ================= */

function renderCollapsible(data) {
  const wrapper = document.createElement('div');
  wrapper.className = `sn-collapsible ${data.color || 'gray'}`;

  const header = document.createElement('button');
  header.className = 'sn-collapsible-header';
  header.textContent = data.title || 'View Article';

  const body = document.createElement('div');
  body.className = 'sn-collapsible-body';
  body.innerHTML = data.desc;

  // header.onclick = () => body.classList.toggle('open');

  header.onclick = () => {
    wrapper.classList.toggle('open');
  };

  wrapper.append(header, body);
  return wrapper;
}

async function fetchArticleText(articleNumber) {
  const url = `${SERVER_URL}/content/apis/au/servicenowarticle.${articleNumber}.json`;

  try {
    const username = 'admin';
    const password = 'admin';

    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });
    if (!response.ok) return null;

    const json = await response.json();

    return {
      title: json.title || 'View Article',
      desc: json.desc || 'No Article Found.',
    };
  } catch (e) {
    console.error(`Failed to fetch article ${articleNumber}`, e);
    return '';
  }
}

/* ================= DECORATE ================= */
export default async function decorate(block) {
  const data = extractData(block);
  if (!data?.articleNumbers?.length) return;

  block.innerHTML = '';

  const articles = await Promise.all(
    data.articleNumbers.map((articleNumber) => fetchArticleText(articleNumber).then((result) => ({
      articleNumber,
      ...result,
    }))),
  );

  articles
    .filter((article) => article?.desc)
    .forEach((article) => {
      const articleData = {
        title: article.title,
        desc: article.desc,
        displaySelection: data.displaySelection,
        color: data.color,
      };

      let rendered;

      switch (articleData.displaySelection) {
        case 'fullPage':
          rendered = renderFullPage(articleData);
          break;
        case 'modalPopup':
          rendered = renderModal(articleData);
          break;
        case 'collapsible':
          rendered = renderCollapsible(articleData);
          break;
        default:
          return;
      }

      block.appendChild(rendered);
    });
}
