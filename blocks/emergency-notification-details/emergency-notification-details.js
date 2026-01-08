import { fetchEmergencyNotifications } from '../../scripts/graphql-api.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  const options = { month: 'long', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  return `${date.toLocaleString('en-US', options)} ${date.toLocaleTimeString('en-US', timeOptions)}`;
}

export default async function decorate(block) {
  const query = getQueryParam('id');

  if (query) {
    // continue
  } else if (window.location.search.includes('id=') && query === '') {
    block.innerHTML = '<div class="alert alert-danger">Please enter incident id.</div>';
    return;
  } else {
    block.innerHTML = '';
    return;
  }

  const response = await fetchEmergencyNotifications('Emergency-Notification-By-ID', query);

  // Get item from the new response structure
  const item = response?.data?.emergencyNotificationModelById?.item;
  if (!item) {
    block.innerHTML = '<div class="alert alert-warning">No emergency notification found.</div>';
    return;
  }

  // Parse activitiesListCMF as updates
  const updates = [];
  if (Array.isArray(item.activitiesListCMF)) {
    for (let idx = item.activitiesListCMF.length - 1; idx >= 0; idx -= 1) {
      try {
        const obj = JSON.parse(item.activitiesListCMF[idx]);
        updates.push({
          id: idx + 1, // or use a better unique id if available
          datetime: obj.updateOn,
          title: '', // No title in your sample, add if needed
          content: obj.updatedbannerAlertMessage || '',
        });
      } catch {
        // skip invalid JSON
      }
    }
  }

  // Compose updates HTML
  let updatesHTML = '';
  if (updates.length) {
    updatesHTML = updates.map((update) => (
      `
      <dt id="update${update.id}">${formatDateTime(update.datetime)}</dt>
      <dd>
        <p>${update.title || ''}</p>
        <p>${update.content || ''}</p>
      </dd>
      `
    )).join('');
  }

  // Compose initial post (if you have it)
  let initialPostHTML = '';
  if (item.bannerAlertMessage?.plaintext && item.bannerAlertMessage?.plaintext) {
    initialPostHTML = `
      <div id="original">
        <h2>Initial Post</h2>
        <p>${item.bannerAlertMessage.plaintext}</p>
      </div>
    `;
  }

  // Compose header dates
  const beganDate = item.startdate ? formatDateTime(item.startdate) : '';
  // Use the latest update for lastUpdateDate
  const lastUpdate = updates.length ? updates[0] : null;
  const lastUpdateDate = lastUpdate ? formatDateTime(lastUpdate.datetime) : '';

  block.innerHTML = `
    <section id="au-alerts-listing">
      <article class="au-alert-incident" data-new-title="${lastUpdateDate}: ${item.title} | AU Alert">
        <div>
          <p class="topic">${item.topic || ''}</p>
          <h1>${item.title}</h1>
          <p class="lede">
            <a href="#original" class="decor">Began</a>: <time datetime="${item.startdate}">${beganDate}</time><br>
            <a href="#update${lastUpdate ? lastUpdate.id : ''}" class="decor">Last Update</a>: <time datetime="${lastUpdate ? lastUpdate.datetime : ''}">${lastUpdateDate}</time>
          </p>
        </div>
        <h2>Updates</h2>
        <dl class="tabular">
          ${updatesHTML}
        </dl>
        ${initialPostHTML}
      </article>
    </section>
  `;
}
