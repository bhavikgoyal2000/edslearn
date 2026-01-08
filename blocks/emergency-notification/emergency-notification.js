import { fetchEmergencyNotifications } from '../../scripts/graphql-api.js';
/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
  const [ensPageLinkObj] = block.children;
  let ensPageLink = ensPageLinkObj ? ensPageLinkObj.querySelector('p')?.textContent : '';
  const response = await fetchEmergencyNotifications('Emergency-Notification-Events');

  if (!response || !ensPageLink) {
    return;
  }

  ensPageLink = ensPageLink.startsWith('/content/au')
    ? ensPageLink.replace(/^\/content\/au/, '')
    : ensPageLink;

  // Safely get items array
  const items = response?.data?.emergencyNotificationModelList?.items || [];

  // Filter active notifications within date range
  /*
  const activeNotifications = items.filter((item) => {
    if (!item.isActive) return false;
    const start = new Date(item.startdate);
    const end = new Date(item.endDate);
    return now >= start && now <= end;
  });
  */
  window.addEventListener('scroll', () => {
    if (items.length === 0) return;
    const scrolled = (window.pageYOffset || document.documentElement.scrollTop) > 0;
    const wrapperEle = document.querySelector('.emergency-notification-wrapper');
    if (wrapperEle) {
      let headerEle;
      if (document.querySelector('.tier3header.block')) {
        headerEle = document.querySelector('.tier3header.block');
      }
      if (scrolled) {
        wrapperEle.style.display = 'none';
        if (headerEle && headerEle.classList.contains('has-emergency')) {
          headerEle.classList.remove('has-emergency');
        }
      } else {
        wrapperEle.style.display = '';
        if (headerEle && !headerEle.classList.contains('has-emergency')) {
          headerEle.classList.add('has-emergency');
        }
      }
    }
  });

  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath.startsWith('/index.html');

  if (items.length > 0) {
    if (document.querySelector('.tier3header.block')) {
      const headerEle = document.querySelector('.tier3header.block');
      if (!headerEle.classList.contains('has-emergency')) {
        headerEle.classList.add('has-emergency');
      }
    }
  }

  if (isHomePage) {
    const formatDate = (date) => {
      const options = { month: 'long', day: 'numeric' };
      const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      return `${date.toLocaleString('en-US', options)}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
    };
    const itemsHtml = items
      .filter((item) => item?.placement && item.placement.toLowerCase() === 'only-home')
      .map((item) => {
        const startDate = new Date(item.startdate);
        const endDate = new Date(item.endDate);
        return `
          <div class='col-md-3 clear-left' data-ems-id='${item._id || ''}'>
            <h1 class='emergency' style='margin-top: 40px;'>${item.type}</h1>
          </div>
          <div class='col-md-6'>
            <h2 class='emergency-title'>${item.title || ''}</h2>
            <p>
              Start: ${formatDate(startDate)}, Last Updated: ${formatDate(endDate)}<br>
              ${item.bannerAlertMessage?.plaintext || ''}
            </p>
          </div>
          <div class='col-md-3'>
            <a href='${ensPageLink}?id=${item._id || ''}' class='emergency-link homepage'>See more detailed information</a>
          </div>
        `;
      }).join('');
    block.innerHTML = `<div id='emergency-home' role='alert'>
      <div style='' id='emergency-message' class='page-title page-title-em'>
        ${itemsHtml}
      </div>
    </div>`;
  } else {
    // Render the required HTML structure
    block.innerHTML = `<div id='emergency-top' class='row row-center'>${items.map((item) => `
      <p class='interior-msg col-xs-12 col-sm-3 col-md-3 no-bs-padding white text-uppercase'>${item.type}</p>
      <p class='interior-msg2 white col-xs-12 col-sm-9 col-md-9'>
        ${item.title || ''}
        <a href='${ensPageLink}?id=${item._id || ''}' class='emergency-link'>Learn More</a>
      </p>
    `).join('')}</div>`;
  }

  // Move block as first child of <main id="main-container">
  const main = document.getElementById('main-container');
  if (main && block.innerHTML.trim()) {
    main.prepend(block.parentElement);
  }
}
