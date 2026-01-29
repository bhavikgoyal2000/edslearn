import { fetchSpreadsheetData } from '../../scripts/util.js';
import { SERVER_URL } from '../../scripts/constants.js';

// ========== EXTRACT ==========
function fetchNominationFormConfig(block) {
  const [
    recipientEmail,
    successMessage,
    failureMessage,
    section1Child,
    nominatorName,
    nominatorEmail,
    nominatorPhone,
    section2Child,
    nomineeName,
    nomineeEmail,
    nomineePhone,
    nomineeAddress,
    nomineeClass,
    awardCategory,
    dropdownChild,
    descriptionChild,
    resumeChild,
    lettersChild,
  ] = block.children;

  return {
    recipientEmail: recipientEmail?.querySelector('p')?.textContent.trim(),
    successMessage: successMessage?.querySelector('p')?.textContent.trim() || 'Thank you for submitting a nomination for the Peter M. Cicchino Award for Outstanding Advocacy in the Public Interes',
    failureMessage: failureMessage?.querySelector('p')?.textContent.trim() || 'There was an error submitting your nomination, please hit the back button to try again',
    section1Label: section1Child?.querySelector('p')?.textContent.trim() || 'Nomination Information',
    nominatorName: nominatorName?.querySelector('p')?.textContent.trim() || "Nominator's Name",
    nominatorEmail: nominatorEmail?.querySelector('p')?.textContent.trim() || "Nominator's Email",
    nominatorPhone: nominatorPhone?.querySelector('p')?.textContent.trim() || "Nominator's Phone",
    section2Label: section2Child?.querySelector('p')?.textContent.trim() || "Nominee's Information",
    nomineeName: nomineeName?.querySelector('p')?.textContent.trim() || 'Name of Nominee',
    nomineeEmail: nomineeEmail?.querySelector('p')?.textContent.trim() || "Nominee's Email",
    nomineePhone: nomineePhone?.querySelector('p')?.textContent.trim() || "Nominee's Phone Number",
    nomineeAddress: nomineeAddress?.querySelector('p')?.textContent.trim() || "Nominee's Address",
    nomineeClass: nomineeClass?.querySelector('p')?.textContent.trim() || 'AUWCL Class (graduating year of nominee):',
    awardCategory: awardCategory?.querySelector('p')?.textContent.trim() || 'Award Category (select one):',
    awardCategoryDropdownUrl: dropdownChild?.querySelector('p')?.textContent.trim() || '',
    briefDescriptionLabel: `1. ${descriptionChild?.querySelector('p')?.textContent.trim() || 'A 1-2 page brief description of nominee\'s public interest/public service work:'}`,
    resumeLabel: `2. ${resumeChild?.querySelector('p')?.textContent.trim() || "The Nominee's current resume:"}`,
    lettersLabel: `3. ${lettersChild?.querySelector('p')?.textContent.trim() || '1-2 Letters of Support for the Nomination (Letters may be submitted by the nominator or others. No more than 2 letters of support will be considered for each Nominee):'}`,
  };
}

// ========== UTILITIES ==========
// Create labeled input row
function createRow(label, type, required = false, options = {}) {
  const row = document.createElement('div');
  row.className = 'form-row';
  const labelEl = document.createElement('label');
  labelEl.innerHTML = `${label}${required ? ' <span class="required">*</span>' : ''}`;
  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    if (options.rows) input.rows = options.rows;
  } else {
    input = document.createElement('input');
    input.type = type;
    if (options.maxLength) input.maxLength = options.maxLength;
    if (options.pattern) input.pattern = options.pattern;
    if (options.style) input.style.cssText = options.style;
  }

  if (required) input.required = true;
  row.append(labelEl, input);

  if (options.hint) {
    const hint = document.createElement('span');
    hint.className = 'inline-hint';
    hint.textContent = options.hint;
    row.appendChild(hint);
  }

  return row;
}

// Create file upload list item
function createFileUpload(label, required = false) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span>${label}${required ? ' <span class="required">*</span>' : ''}</span>
    <label class="file-label">
      <input type="file" accept=".txt,.doc,.docx,.pdf"${required ? ' required' : ''}>
      <span class="choose-file">Choose File</span>
      <span class="file-message">No file chosen</span>
    </label>
    <span class="file-hint">(Allowed: .txt, .doc, .docx, .pdf)</span>
  `;
  return li;
}

// Create modal
function createModal() {
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="nomination-modal-overlay" style="display:none;">
      <div class="nomination-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h2 class="modal-title" id="modal-title">Please fix the following:</h2>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button class="modal-ok" type="button">OK</button>
        </div>
      </div>
    </div>
  `;
  return div.firstElementChild;
}

// Get CSRF token
async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

// ========== BUILD ==========
// Build form DOM from config
async function buildNominationFormDOM(config) {
  const form = document.createElement('form');
  form.className = 'nomination-form';
  form.noValidate = true;

  // --- Section 1: Nominator Info ---
  const section1 = document.createElement('fieldset');
  section1.className = 'nomination-section';
  const legend1 = document.createElement('legend');
  legend1.innerHTML = `<span class="section-label">${config.section1Label}</span>`;
  section1.appendChild(legend1);
  section1.appendChild(createRow(config.nominatorName, 'text', true));
  section1.appendChild(createRow(config.nominatorEmail, 'email', true));
  section1.appendChild(createRow(config.nominatorPhone, 'tel', true));
  form.appendChild(section1);

  // --- Section 2: Nominee Info ---
  const section2 = document.createElement('fieldset');
  section2.className = 'nominee-section';
  const legend2 = document.createElement('legend');
  legend2.innerHTML = `<span class="section-label">${config.section2Label}</span>`;
  section2.appendChild(legend2);
  section2.appendChild(createRow(config.nomineeName, 'text', true));
  section2.appendChild(createRow(config.nomineeEmail, 'email', true));
  section2.appendChild(createRow(config.nomineePhone, 'tel', true));
  section2.appendChild(createRow(config.nomineeAddress, 'textarea', false, { rows: 2 }));
  form.appendChild(section2);

  form.appendChild(createRow(config.nomineeClass, 'text', true, { maxLength: 4, pattern: '\\d{4}', hint: '(4-digit)' }));

  // --- Award Category ---
  const categoryRow = document.createElement('div');
  categoryRow.className = 'form-row';
  const label = document.createElement('label');
  label.textContent = config.awardCategory;
  const select = document.createElement('select');
  select.required = true;
  select.innerHTML = '<option value="">-Select-</option>';
  categoryRow.append(label, select);
  form.appendChild(categoryRow);

  // Load categories
  if (config.awardCategoryDropdownUrl) {
    try {
      const arr = await fetchSpreadsheetData(config.awardCategoryDropdownUrl);
      const key = arr?.[0] && Object.keys(arr[0])[0];
      const categories = key ? arr.map((row) => row[key]).filter(Boolean) : [];
      select.innerHTML = [
        '<option value="">- Select -</option>',
        ...categories.map((cat) => `<option value="${cat}">${cat}</option>`),
      ].join('');
    } catch (e) {
      select.innerHTML = '<option value="">No categories available</option>';
    }
  }

  // --- File Uploads ---
  const uploadSection = document.createElement('div');
  uploadSection.className = 'section-upload';
  uploadSection.innerHTML = '<p class="attach-label"><strong>Please Attach:</strong></p>';
  const ol = document.createElement('ol');
  ol.appendChild(createFileUpload(config.briefDescriptionLabel, true));
  ol.appendChild(createFileUpload(config.resumeLabel, true));
  ol.appendChild(createFileUpload(config.lettersLabel, true));
  uploadSection.appendChild(ol);
  form.appendChild(uploadSection);

  // --- Submit & Hint ---
  const asteriskHint = document.createElement('p');
  asteriskHint.className = 'asterisk-hint';
  asteriskHint.innerHTML = '<span class="required">*</span>The asterisk indicates required fields';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Submit';
  form.append(asteriskHint, submitBtn);

  return form;
}

// ========== DECORATE ==========
export default async function decorate(block) {
  const config = fetchNominationFormConfig(block);
  if (!config) return;

  const form = await buildNominationFormDOM(config);
  const modal = createModal();
  const modalOverlay = modal;
  const modalDialog = modal.querySelector('.nomination-modal');
  const modalBody = modal.querySelector('.modal-body');

  block.textContent = '';
  block.append(form, modal);

  // ===== FILE INPUT LABELS =====
  form.querySelectorAll('input[type="file"]').forEach((fileInput) => {
    fileInput.addEventListener('change', () => {
      const span = fileInput.parentElement.querySelector('.file-message');
      span.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
    });
  });

  // ===== MODAL HANDLERS =====
  const close = () => { modalOverlay.style.display = 'none'; };
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('.modal-ok').addEventListener('click', close);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) close();
  });
  modalDialog.addEventListener('click', (e) => { e.stopPropagation(); });

  // ===== FORM SUBMISSION =====
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validate
    const missingFields = [];
    const fileInputs = form.querySelectorAll('.section-upload input[type="file"]');
    const requiredInputs = [
      { label: 'the name of the nominator', input: form.querySelector('.nomination-section input[type="text"]') },
      { label: 'an email address for the nominator', input: form.querySelector('.nomination-section input[type="email"]') },
      { label: 'enter a phone number for the nominator', input: form.querySelector('.nominee-section input[type="text"]') },
      { label: 'the name for the nominee', input: form.querySelector('.nomination-section input[type="text"]') },
      { label: 'enter an email for the nominee', input: form.querySelector('.nominee-section input[type="email"]') },
      { label: 'a phone number for the nominee', input: form.querySelector('.nominee-section input[type="tel"]') },
      { label: 'a graduation year for the nominee', input: form.querySelector('.nomination-section input[type="text"]') },
      { label: 'a 1-2 page brief description of nominee\'s public interest/public service work', input: fileInputs[0] },
      { label: 'a current resume for the nominee', input: fileInputs[1] },
      { label: 'the nomination letter', input: fileInputs[2] },
    ];

    requiredInputs.forEach(({ label, input }) => {
      if (!input) return;
      const isEmpty = input.type === 'file'
        ? !input.files?.length
        : !input.value.trim();
      if (isEmpty) missingFields.push(`- Please provide ${label}.`);
    });

    // Validate grad year
    const allInputs = form.querySelectorAll('input[type="text"]');
    const classYearInput = allInputs[allInputs.length - 1];
    if (classYearInput && classYearInput.value.trim()) {
      if (!/^(19|20)\d{2}$/.test(classYearInput.value)) {
        missingFields.push('- Please enter a valid graduation year, ie 19xx or 20xx');
      }
    }

    // Validate email
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach((emailItem) => {
      if (!emailItem.value.trim().includes('@')) {
        missingFields.push(`- Please enter a valid email address for ${emailItem.value.trim()}`);
      }
    });

    if (missingFields.length > 0) {
      event.preventDefault();
      modalBody.innerHTML = missingFields.join('<br>');
      modalOverlay.style.display = 'flex';
      return;
    }

    // Build FormData with text fields AND files
    const formData = new FormData();

    // Add text fields
    formData.append('recipientEmail', config.recipientEmail);
    formData.append('nominatorName', form.querySelector('.nomination-section input[type="text"]').value);
    formData.append('nominatorEmail', form.querySelector('.nomination-section input[type="email"]').value);
    formData.append('nominatorPhone', form.querySelector('.nomination-section input[type="tel"]').value);
    formData.append('nomineeName', form.querySelector('.nominee-section input[type="text"]').value);
    formData.append('nomineeEmail', form.querySelector('.nominee-section input[type="email"]').value);
    formData.append('nomineePhone', form.querySelector('.nominee-section input[type="tel"]').value);
    formData.append('nomineeAddress', form.querySelector('.nominee-section textarea')?.value || '');
    formData.append('nomineeClass', classYearInput.value);
    formData.append('awardCategory', form.querySelector('select').value);

    const fileFieldMap = {
      0: 'briefDescription',
      1: 'resume',
      2: 'supportLetters',
    };

    fileInputs.forEach((fileInput, index) => {
      if (fileInput.files.length > 0) {
        formData.append(fileFieldMap[index], fileInput.files[0]);
      }
    });

    try {
      const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);
      const headers = {};
      let serverUrl = SERVER_URL;
      if (isAuthor) {
        headers['CSRF-Token'] = await getCsrfToken();
        serverUrl = window.location.origin;
      }

      const response = await fetch(`${serverUrl}/bin/nomination/submit`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = await response.json();
      block.textContent = '';
      const msg = document.createElement('div');
      msg.className = json.success ? 'success-message' : 'error-message';
      msg.innerHTML = `<p>${json.success ? config.successMessage : `Error: ${json.message}`}</p>`;
      block.appendChild(msg);
    } catch (error) {
      block.textContent = '';
      const msg = document.createElement('div');
      msg.className = 'error-message';
      msg.innerHTML = `
        <p>${config.failureMessage}</p>
        <button id="back-to-form" class="green-back-btn">Return to Nomination Form</button>
      `;
      block.appendChild(msg);

      msg.querySelector('#back-to-form').addEventListener('click', () => {
        window.location.reload();
      });
    }
  });
}
