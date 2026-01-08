import { SERVER_URL } from '../../scripts/constants.js';

/**
 * Creates the DOM structure for policy listing
 * @param {Array} results - API response results array
 * @returns {HTMLElement} policy listing container
 */
function createPolicyListing(results, labeledData) {
  const parentContainer = document.createElement('div');
  parentContainer.className = 'policy-list-block';

  const titleContainer = document.createElement('div');
  titleContainer.className = 'no-padding-left';

  const title = document.createElement('h1');
  title.textContent = labeledData.title;
  titleContainer.appendChild(title);
  parentContainer.appendChild(titleContainer);

  if (labeledData.subTitle) {
    const subTitleContainer = document.createElement('div');
    subTitleContainer.className = 'no-padding-left';

    const subTitle = document.createElement('p');
    subTitle.className = 'lede';
    subTitle.textContent = labeledData.subTitle;
    subTitleContainer.appendChild(subTitle);
    parentContainer.appendChild(subTitleContainer);
  }

  const container = document.createElement('div');
  container.className = 'policy-listing row';

  const columnClass = `column-count-${labeledData.columnCount}`;
  const ul = document.createElement('ul');
  ul.classList.add(columnClass);
  if (labeledData.policyCategory === 'all_policy') {
    container.classList.add('all-policy');
    ul.classList.add('all-policy-list');
  }

  results.forEach((item) => {
    const li = document.createElement('li');
    const p = document.createElement('p');
    p.className = 'list-item';

    const a = document.createElement('a');
    a.href = `${item.path || '#'}${item.path ? '.html' : ''}`;
    a.textContent = item.title_name || 'Untitled Policy';

    p.appendChild(a);
    li.appendChild(p);
    ul.appendChild(li);
  });

  container.appendChild(ul);
  parentContainer.appendChild(container);
  return parentContainer;
}

function labelPolicyData(dataArray) {
  return {
    title: dataArray[0] || '',
    subTitle: dataArray[1] || '',
    columnCount: dataArray[2] || 'column-count-1',
    policyCategory: dataArray[3] || '',
    sortField: dataArray[4] || '',
    sortOrder: dataArray[5] || '',
  };
}

function extractPolicyContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);
  const policyData = children.map((child) => {
    const ps = child.querySelectorAll('p');
    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }
    return null;
  });
  return { policyData };
}

async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

export default function decorate(block) {
  const extractedData = extractPolicyContainerData(block);
  const labeledData = labelPolicyData(extractedData.policyData);

  block.textContent = '';
  // Prepare payload
  const policyListingPayload = {
    policyCategory: labeledData.policyCategory,
    sortField: labeledData.sortField,
    sortOrder: labeledData.sortOrder,
  };

  // Detect if running on author
  const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
  };
  let serverUrl = SERVER_URL;
  // If author, add CSRF token
  if (isAuthor) {
    const csrfToken = getCsrfToken();
    headers['CSRF-Token'] = csrfToken;
    serverUrl = window.location.origin;
  }

  fetch(`${serverUrl}/bin/policy/searchByTags`, {
    method: 'POST',
    headers,
    body: JSON.stringify(policyListingPayload),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch policy listing data');
      return response.json();
    })
    .then((data) => {
      if (data.total === 0) {
        const noResultsTag = document.createElement('p');
        noResultsTag.className = 'no-results';
        noResultsTag.textContent = 'No results found';
        block.appendChild(noResultsTag);
      } else {
        const policyListing = createPolicyListing(
          data.results,
          labeledData,
        );
        block.appendChild(policyListing);
      }
    })
    .catch((error) => {
      throw new Error(`Error fetching policy listing data: ${error.message}`);
    });
}
