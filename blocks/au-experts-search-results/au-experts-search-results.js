import { SERVER_URL } from '../../scripts/constants.js';

const DEFAULT_PROFILE_IMG = 'https://www.american.edu/uploads/profiles/medium/au_profile.jpg';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'expert-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'auExpertDetails');

  const modalDialog = document.createElement('div');
  modalDialog.className = 'modal-dialog modal-lg';
  modalDialog.setAttribute('role', 'document');

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.innerHTML = `
    <button type="button" class="close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <h1 class="modal-title" id="auExpertDetails">AU Experts - Faculty Experts Guide for News Media</h1>
  `;

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.id = 'modalExpertInfoContent';

  const modalFooter = document.createElement('div');
  modalFooter.className = 'modal-footer';
  modalFooter.innerHTML = `
    <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button>
  `;

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modalDialog.appendChild(modalContent);
  modal.appendChild(modalDialog);
  document.body.appendChild(modal);

  return modal;
}

function showExpertDetails(expert, modal, contactInfo, copyRightText, addressText) {
  const modalBody = modal.querySelector('.modal-body');
  let languages = [];
  try {
    languages = JSON.parse(expert.languages);
  } catch {
    languages = [];
  }
  modalBody.innerHTML = `
    <div class="row">
      <div class="col-xs-12">
        <img class="img-responsive pull-left"
             src="${expert.imageUrl ? decodeURIComponent(expert.imageUrl.replace(/&#58;/g, ':')) : 'https://www.american.edu/uploads/profiles/medium/au_profile.jpg'}"
             alt="${expert.name}"
             onerror="this.onerror=null;this.src='https://www.american.edu/uploads/profiles/medium/au_profile.jpg';">
        <h1>${expert.name}</h1>
        ${expert.title ? `<p class="lede text-uppercase">${expert.title}</p>` : ''}
      </div>
    </div>
    <div class="well well-sm">
      <dl class="tabular">
        ${expert.expertise ? `
          <dt>Area of Expertise:</dt>
          <dd>${expert.expertise}</dd>
        ` : ''}
        <dt>Additional Information:</dt>
        <dd>${expert.additionalInfo ? expert.additionalInfo : 'n/a'}</dd>
        ${languages.length > 0 ? `
          <dt>Foreign Language Fluency:</dt>
          <dd>${languages.join(', ')}</dd>
        ` : `
          <dt>Foreign Language Fluency:</dt>
          <dd>n/a</dd>
        `}
        ${expert.education ? `
          <dt>Academic Credentials:</dt>
          <dd>${expert.education}</dd>
        ` : ''}
        ${expert.category ? `
          <dt>Category:</dt>
          <dd>${expert.category}</dd>
        ` : ''}
        ${expert.website || expert.profileUrl ? `
          <dt>Site/Profile:</dt>
          <dd>
            ${expert.profileUrl ? `<a href="${expert.profileUrl.replace(/\.cfm$/, '')}" title="${expert.name}'s Profile">${expert.profileUrl.replace(/\.cfm$/, '')}</a><br>` : ''}
          </dd>
        ` : ''}
      </dl>
    </div>
    <footer>
      <div class="row">
        <div class="col-xs-12 text-center">
          <p class="text-muted small">
            ${contactInfo}
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-6">
          <p class="text-muted small">
            ${copyRightText}
          </p>
        </div>
        <div class="col-xs-6 text-right">
          <p class="text-muted small">
            ${addressText}
          </p>
        </div>
      </div>
    </footer>
  `;

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

function createExpertCard(expert, modal, contactInfo, copyRightText, addressText) {
  const li = document.createElement('li');

  const media = document.createElement('div');
  media.className = 'media';

  // Image section
  const pullLeft = document.createElement('div');
  pullLeft.className = 'pull-left';

  const img = document.createElement('img');
  img.className = 'img-responsive';
  img.src = expert.imageUrl
    ? decodeURIComponent(expert.imageUrl.replace(/&#58;/g, ':'))
    : DEFAULT_PROFILE_IMG;
  img.alt = expert.name || 'Expert';
  img.onerror = () => {
    img.onerror = null; // Prevent infinite loop
    img.src = DEFAULT_PROFILE_IMG;
  };

  const imgPara = document.createElement('p');
  imgPara.className = 'text-center';

  const moreInfoLink = document.createElement('a');
  moreInfoLink.href = '#';
  moreInfoLink.title = `Detailed information for ${expert.name}`;
  moreInfoLink.className = 'btn btn-cta btn-sm au-experts-more-info';
  moreInfoLink.setAttribute('itemprop', 'url');
  moreInfoLink.textContent = 'More Info';

  // Add click event to open modal
  moreInfoLink.addEventListener('click', (e) => {
    e.preventDefault();
    showExpertDetails(expert, modal, contactInfo, copyRightText, addressText);
  });

  imgPara.appendChild(moreInfoLink);
  pullLeft.appendChild(img);
  pullLeft.appendChild(imgPara);

  // Body section
  const mediaBody = document.createElement('div');
  mediaBody.className = 'media-body';

  const h2 = document.createElement('h2');
  h2.textContent = expert.name || 'N/A';

  if (expert.title) {
    const small = document.createElement('small');
    small.className = 'text-muted small';
    small.textContent = expert.title;
    h2.appendChild(document.createTextNode(' '));
    h2.appendChild(small);
  }

  const address = document.createElement('address');
  const strong = document.createElement('strong');
  strong.textContent = expert.department || expert.college || '';
  address.appendChild(strong);

  mediaBody.appendChild(h2);
  mediaBody.appendChild(address);

  if (expert.education) {
    const educationDiv = document.createElement('div');
    educationDiv.textContent = expert.education;
    mediaBody.appendChild(educationDiv);
  }

  media.appendChild(pullLeft);
  media.appendChild(mediaBody);
  li.appendChild(media);

  return li;
}

function createPagination(currentPage, totalPages, onPageChange) {
  const paginationContainer = document.createElement('nav');
  paginationContainer.className = 'pagination-container';
  paginationContainer.setAttribute('aria-label', 'Experts pagination');

  const ul = document.createElement('ul');
  ul.className = 'pagination';

  // Previous arrow button
  const prevLi = document.createElement('li');
  prevLi.className = currentPage === 1 ? 'disabled' : '';
  const prevLink = document.createElement('a');
  prevLink.href = '#';
  prevLink.innerHTML = '&lt;';
  prevLink.setAttribute('aria-label', 'Previous page');
  prevLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  prevLi.appendChild(prevLink);
  ul.appendChild(prevLi);

  // Page numbers logic
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start if we're near the end
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page (always show if not in range)
  if (startPage > 1) {
    const firstLi = document.createElement('li');
    const firstLink = document.createElement('a');
    firstLink.href = '#';
    firstLink.textContent = '1';
    firstLink.addEventListener('click', (e) => {
      e.preventDefault();
      onPageChange(1);
    });
    firstLi.appendChild(firstLink);
    ul.appendChild(firstLi);

    // Ellipsis after first page
    if (startPage > 2) {
      const ellipsisLi = document.createElement('li');
      ellipsisLi.className = 'disabled ellipsis';
      const ellipsisSpan = document.createElement('span');
      ellipsisSpan.textContent = '...';
      ellipsisLi.appendChild(ellipsisSpan);
      ul.appendChild(ellipsisLi);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i += 1) {
    const li = document.createElement('li');
    li.className = i === currentPage ? 'active' : '';
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = i;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (i !== currentPage) {
        onPageChange(i);
      }
    });
    li.appendChild(link);
    ul.appendChild(li);
  }

  // Last page (always show if not in range)
  if (endPage < totalPages) {
    // Ellipsis before last page
    if (endPage < totalPages - 1) {
      const ellipsisLi = document.createElement('li');
      ellipsisLi.className = 'disabled ellipsis';
      const ellipsisSpan = document.createElement('span');
      ellipsisSpan.textContent = '...';
      ellipsisLi.appendChild(ellipsisSpan);
      ul.appendChild(ellipsisLi);
    }

    const lastLi = document.createElement('li');
    const lastLink = document.createElement('a');
    lastLink.href = '#';
    lastLink.textContent = totalPages;
    lastLink.addEventListener('click', (e) => {
      e.preventDefault();
      onPageChange(totalPages);
    });
    lastLi.appendChild(lastLink);
    ul.appendChild(lastLi);
  }

  // Next arrow button
  const nextLi = document.createElement('li');
  nextLi.className = currentPage === totalPages ? 'disabled' : '';
  const nextLink = document.createElement('a');
  nextLink.href = '#';
  nextLink.innerHTML = '&gt;';
  nextLink.setAttribute('aria-label', 'Next page');
  nextLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
  nextLi.appendChild(nextLink);
  ul.appendChild(nextLi);

  paginationContainer.appendChild(ul);
  return paginationContainer;
}

function displayExperts(
  experts,
  page,
  itemsPerPage,
  container,
  modal,
  contactInfo,
  copyRightText,
  addressText,
) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageExperts = experts.slice(startIndex, endIndex);

  // Clear existing content
  container.innerHTML = '';

  const div = document.createElement('div');
  div.classList.add('col-grid', 'col-xs-12', 'col-sm-6', 'col-md-9');

  const ul = document.createElement('ul');
  ul.className = 'list-unstyled';

  pageExperts.forEach((expert) => {
    const expertCard = createExpertCard(expert, modal, contactInfo, copyRightText, addressText);
    ul.appendChild(expertCard);
  });

  div.appendChild(ul);
  container.appendChild(div);

  // Scroll to top of results
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Main decorate function
export default async function decorate(block) {
  const [contactInfoObj, resultsPerPageObj, copyRightTextObj, addressTextObj] = block.children;
  const contactInfo = contactInfoObj ? contactInfoObj.querySelector('p')?.innerHTML.trim() : '';
  const copyRightText = copyRightTextObj ? copyRightTextObj.querySelector('p')?.innerHTML.trim() : '';
  const addressText = addressTextObj ? addressTextObj.querySelector('p')?.innerHTML.trim() : '';
  let resultsPerPage = 10;
  if (resultsPerPageObj && resultsPerPageObj.querySelector('p')) {
    const parsed = parseInt(resultsPerPageObj.querySelector('p').innerText.trim(), 10);
    resultsPerPage = Number.isNaN(parsed) ? 10 : parsed;
  }

  const query = getQueryParam('q');
  const list = getQueryParam('list');

  const modal = createModal();

  const closeBtn = modal.querySelector('.close');
  const closeFooterBtn = modal.querySelector('[data-dismiss="modal"]');

  closeBtn.addEventListener('click', () => closeModal(modal));
  closeFooterBtn.addEventListener('click', () => closeModal(modal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal(modal);
    }
  });

  block.innerHTML = '<div class="au-experts-loader"><div class="spinner"></div><p>Loading experts...</p></div>';

  let servletUrl = '';

  if (query) {
    servletUrl = `${SERVER_URL}/bin/au-experts?action=search&q=${encodeURIComponent(query)}`;
  } else if (list) {
    servletUrl = `${SERVER_URL}/bin/au-experts?action=list&range=${encodeURIComponent(list)}`;
  } else if (window.location.search.includes('q=') && query === '') {
    block.innerHTML = '<div class="alert alert-danger">Please enter a search term above and try again.</div>';
    return;
  } else {
    block.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(servletUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch experts: ${response.status}`);
    }

    const data = await response.json();
    block.innerHTML = '';

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'experts-results';

    if (data && data.isSuccess === true && data.results && data.results.length > 0) {
      const itemsPerPage = resultsPerPage;
      let currentPage = 1;
      const totalPages = Math.ceil(data.results.length / itemsPerPage);

      // Results info
      const resultsInfo = document.createElement('div');
      resultsInfo.className = 'results-info';
      resultsContainer.appendChild(resultsInfo);

      // Expert list container
      const expertsListContainer = document.createElement('div');
      expertsListContainer.className = 'experts-list-container';
      resultsContainer.appendChild(expertsListContainer);

      // Display first page
      displayExperts(
        data.results,
        currentPage,
        itemsPerPage,
        expertsListContainer,
        modal,
        contactInfo,
        copyRightText,
        addressText,
      );

      // Add pagination if needed
      if (totalPages > 1) {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-wrapper';

        const updatePagination = (page) => {
          currentPage = page;
          displayExperts(
            data.results,
            currentPage,
            itemsPerPage,
            expertsListContainer,
            modal,
            contactInfo,
            copyRightText,
            addressText,
          );

          paginationContainer.innerHTML = '';
          const newPagination = createPagination(
            currentPage,
            totalPages,
            updatePagination,
          );
          paginationContainer.appendChild(newPagination);
        };

        const pagination = createPagination(currentPage, totalPages, updatePagination);
        paginationContainer.appendChild(pagination);
        resultsContainer.appendChild(paginationContainer);
      }
    } else {
      const noResults = document.createElement('p');
      noResults.textContent = 'No experts found.';
      resultsContainer.appendChild(noResults);
    }

    block.appendChild(resultsContainer);
  } catch (error) {
    block.innerHTML = `<div class="error-message"><p>Error loading experts: ${error.message}</p></div>`;
  }
}
