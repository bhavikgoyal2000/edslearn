import { SERVER_URL } from '../../scripts/constants.js';
/**
 * Extract authored field values from the AEM/EDS model or block children.
 * If a field is not authored, fallback to the default value.
 */
function extractAuthorableFields(block, model) {
  function getChildValue(idx, fallback, type = 'text') {
    const node = block.children[idx];
    if (!node) return fallback;
    if (type === 'image' || type === 'reference') {
      const img = node.querySelector ? node.querySelector('img') : null;
      if (img && img.src) return img.src.trim();
      const a = node.querySelector ? node.querySelector('a') : null;
      if (a && a.href) return a.href.trim();
      if (node.textContent) return node.textContent.trim();
      return fallback;
    }
    // For richtext, prefer innerHTML
    if (type === 'richtext') {
      return node.innerHTML?.trim() || fallback;
    }
    const para = node.querySelector ? node.querySelector('p') : null;
    if (para) return para.textContent.trim();
    if (node.textContent) return node.textContent.trim();
    return fallback;
  }

  const fieldsFromDom = {
    cedidLabel: getChildValue(0, undefined),
    cedidPlaceholder: getChildValue(1, undefined),
    cedidHelper: getChildValue(2, undefined),
    graduateName: getChildValue(3, undefined),
    graduateNamePlaceholder: getChildValue(4, undefined),
    searchBtnLabel: getChildValue(5, undefined),
    diplomaImg: getChildValue(6, undefined, 'reference'),
    exampleImg: getChildValue(7, undefined, 'reference'),
    errorDesc: getChildValue(8, undefined, 'richtext'),
  };

  // Return object
  return {
    cedidLabel: fieldsFromDom.cedidLabel
      || model?.fields?.find((f) => f.name === 'cedidLabel')?.value
      || 'Please Enter CeDiD',
    cedidPlaceholder: fieldsFromDom.cedidPlaceholder
      || model?.fields?.find((f) => f.name === 'cedidPlaceholder')?.value
      || 'CeDiD',
    cedidHelper: fieldsFromDom.cedidHelper
      || model?.fields?.find((f) => f.name === 'cedidhelper')?.value
      || 'The CeDiD is found on the upper left corner of your diploma. Not case sensitive',
    graduateName: fieldsFromDom.graduateName
      || model?.fields?.find((f) => f.name === 'graduateName')?.value
      || 'Enter the first two letters of the name as it appears on the diploma',
    graduateNamePlaceholder: fieldsFromDom.graduateNamePlaceholder
      || model?.fields?.find((f) => f.name === 'graduateNamePlaceholder')?.value
      || 'First two letters of the name',
    searchBtnLabel: fieldsFromDom.searchBtnLabel
      || model?.fields?.find((f) => f.name === 'searchBtnLabel')?.value
      || 'Validate Diploma',
    diplomaImg: fieldsFromDom.diplomaImg
      || model?.fields?.find((f) => f.name === 'diplomaImg')?.value
      || '/content/dam/au/assets/provost/registrar/studentservices/customcf/CeDiD_Key.png',
    exampleImg: fieldsFromDom.exampleImg
      || model?.fields?.find((f) => f.name === 'exampleImg')?.value
      || '/content/dam/au/assets/provost/registrar/studentservices/images/csthumbnail_large/American-Validation-Page-meduim.png',
    errorDesc: fieldsFromDom.errorDesc
      || model?.fields?.find((f) => f.name === 'errorDesc')?.value
      || '<p><strong>No results have been found.</strong> <br/> The information provided does not match the information on record, or there was a connection error. Please contact graduation_services@american.edu with the student name and CeDiD to inquire further.</p>',
  };
}

/**
 * Build the CeDiD validation form using field data (including images).
 */
function buildCeDiplomaForm(fields) {
  const wrapper = document.createElement('div');
  wrapper.className = 'row';

  // Error message
  const ceErrorMsg = document.createElement('div');
  ceErrorMsg.id = 'ce-error-msg';
  ceErrorMsg.className = 'alert hidden single';

  // Form
  const form = document.createElement('form');
  form.className = 'clearfix';
  form.id = 'frm-validate-diploma';
  form.autocomplete = 'off';

  // Left column
  const leftCol = document.createElement('div');
  leftCol.className = 'col-md-9 col-xs-8';

  // CeDiD group
  const cedidFormGroup = document.createElement('div');
  cedidFormGroup.className = 'form-group';
  const cedidLabel = document.createElement('label');
  cedidLabel.setAttribute('for', 'ceDiD');
  cedidLabel.className = 'control-label';
  cedidLabel.textContent = fields.cedidLabel;
  const cedidInput = document.createElement('input');
  cedidInput.type = 'text';
  cedidInput.className = 'form-control';
  cedidInput.name = 'ceDiD';
  cedidInput.id = 'ceDiD';
  cedidInput.placeholder = fields.cedidPlaceholder;
  cedidInput.maxLength = 20;
  cedidInput.required = true;
  const cedidHelper = document.createElement('p');
  cedidHelper.className = 'help-block';
  cedidHelper.textContent = fields.cedidHelper;
  const diplomaImg = document.createElement('img');
  diplomaImg.src = fields.diplomaImg;
  diplomaImg.alt = 'CeDiD Key: 0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  diplomaImg.className = 'img-responsive';

  cedidFormGroup.append(cedidLabel, cedidInput, cedidHelper, diplomaImg);

  // Graduate name group
  const gradFormGroup = document.createElement('div');
  gradFormGroup.className = 'form-group';
  const gradLabel = document.createElement('label');
  gradLabel.setAttribute('for', 'graduateName');
  gradLabel.className = 'control-label';
  gradLabel.textContent = fields.graduateName;
  const gradInputDiv = document.createElement('div');
  const gradInput = document.createElement('input');
  gradInput.type = 'text';
  gradInput.className = 'form-control';
  gradInput.name = 'graduateName';
  gradInput.id = 'graduateName';
  gradInput.placeholder = fields.graduateNamePlaceholder;
  gradInput.maxLength = 2;
  gradInput.required = true;
  gradInputDiv.appendChild(gradInput);

  gradFormGroup.append(gradLabel, gradInputDiv);

  // Button group
  const btnFormGroup = document.createElement('div');
  btnFormGroup.className = 'form-group';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = fields.searchBtnLabel;
  const loadingIcon = document.createElement('span');
  loadingIcon.id = 'ceDiplomaLoadingIcon';
  loadingIcon.className = 'icon ion-loading-a hidden';
  btnFormGroup.append(submitBtn, loadingIcon);

  leftCol.append(cedidFormGroup, gradFormGroup, btnFormGroup);

  // Right column
  const rightCol = document.createElement('div');
  rightCol.className = 'col-md-3 col-xs-4';
  const exampleImg = document.createElement('img');
  exampleImg.className = 'img-responsive';
  exampleImg.alt = 'CeDiD is found on the upper left corner of your diploma';
  exampleImg.src = fields.exampleImg;
  rightCol.appendChild(exampleImg);

  // Assemble form
  form.append(leftCol, rightCol);

  // Info panel
  const ceInfo = document.createElement('div');
  ceInfo.id = 'ceInfo';
  ceInfo.className = 'hidden';
  const panel = document.createElement('figure');
  panel.className = 'panel panel-default';
  const panelHeading = document.createElement('figcaption');
  panelHeading.id = 'ceTitle';
  panelHeading.className = 'panel-heading';
  const panelBody = document.createElement('div');
  panelBody.className = 'panel-body';
  const resultTable = document.createElement('dl');
  resultTable.className = 'tabular narrow-term';
  resultTable.id = 'ceTable';
  panelBody.appendChild(resultTable);
  panel.append(panelHeading, panelBody);
  ceInfo.appendChild(panel);

  wrapper.append(ceErrorMsg, form, ceInfo);

  return wrapper;
}

async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

export default function decorate(block, model = {}) {
  // Extract authored fields or fallback defaults
  const fields = extractAuthorableFields(block, model);

  // Always clear and rebuild the form (safe for AEM/EDS authoring)
  block.innerHTML = '';
  block.classList.add('cediploma-validation-row');
  const wrapper = buildCeDiplomaForm(fields);
  block.appendChild(wrapper);

  // Attach form event logic only once
  const form = block.querySelector('form#frm-validate-diploma');
  const ceErrorMsg = block.querySelector('#ce-error-msg');
  const loadingIcon = block.querySelector('#ceDiplomaLoadingIcon');
  const ceInfo = block.querySelector('#ceInfo');
  const panelHeading = block.querySelector('#ceTitle');
  const resultTable = block.querySelector('#ceTable');
  const cedidInput = block.querySelector('#ceDiD');
  const gradNameInput = block.querySelector('#graduateName');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    ceErrorMsg.textContent = '';
    ceErrorMsg.classList.add('hidden');
    ceInfo.classList.add('hidden');
    panelHeading.textContent = '';
    resultTable.innerHTML = '';
    loadingIcon.classList.remove('hidden');

    const ceDiDValue = cedidInput.value.trim();
    const graduateNameValue = gradNameInput.value.trim();

    let fetchWasOk = false;
    let responseData = null;
    try {
      // Detect if running on author
      const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
      let serverUrl = SERVER_URL;
      // If author, add CSRF token
      if (isAuthor) {
        const csrfToken = await getCsrfToken();
        headers['CSRF-Token'] = csrfToken;
        serverUrl = window.location.origin;
      }

      const response = await fetch(`${serverUrl}/bin/ceDiplomaValidationServlet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          id: ceDiDValue,
          name: graduateNameValue,
        }),
      });
      fetchWasOk = response.ok;
      responseData = await response.json();
    } catch {
      // Fetch was not okay
    }
    //
    // --- Static response for testing ---
    // const fetchWasOk = true;
    // const responseData = {
    //   FIELDS: {
    //     degree1: 'Bachelor of Arts',
    //     honor1: 'Summa Cum Laude',
    //     major1: 'Interdisciplinary Studies: Communications, Legal
    // Institutions, Economics, and Government',
    //     degree2: '',
    //     honor2: '',
    //     major2: '',
    //     degree3: '',
    //     honor3: '',
    //     major3: '',
    //     degree4: '',
    //     honor4: '',
    //     major4: '',
    //     degree5: '',
    //     honor5: '',
    //     major5: '',
    //     validateAt: 'Validated: December 4, 2025 at 10:51AM (Eastern)',
    //     conferralDate: '03/01/2004',
    //     ceDiplomaID: '1605-2018-M2T6',
    //     Name: 'Michael Hunnicutt',
    //   },
    //   ISSUCCESS: true,
    //   ARERRORS: [],
    // };
    // --- End static response ---

    loadingIcon.classList.add('hidden');

    if (fetchWasOk && responseData && responseData.ISSUCCESS) {
      panelHeading.innerHTML = `<strong class='text-uppercase'>${responseData.FIELDS.validateAt}</strong>`;
      resultTable.innerHTML = `
        <dt>CeDiD:</dt><dd>${responseData.FIELDS.ceDiplomaID}</dd>
        <dt>Student Name:</dt><dd>${responseData.FIELDS.Name}</dd>
        <dt>Conferral Date:</dt><dd>${responseData.FIELDS.conferralDate}</dd>
      `;
      let schoolInfoHtml = '';
      for (let degreeIndex = 1; degreeIndex <= 5; degreeIndex += 1) {
        if (responseData.FIELDS[`degree${degreeIndex}`] && responseData.FIELDS[`degree${degreeIndex}`].length) {
          schoolInfoHtml += `<dt>Degree:</dt><dd>${responseData.FIELDS[`degree${degreeIndex}`]}</dd>`;
        }
        if (responseData.FIELDS[`major${degreeIndex}`] && responseData.FIELDS[`major${degreeIndex}`].length) {
          schoolInfoHtml += `<dt>Major:</dt><dd>${responseData.FIELDS[`major${degreeIndex}`]}</dd>`;
        }
        if (responseData.FIELDS[`honor${degreeIndex}`] && responseData.FIELDS[`honor${degreeIndex}`].length) {
          schoolInfoHtml += `<dt>Honors:</dt><dd>${responseData.FIELDS[`honor${degreeIndex}`]}</dd>`;
        }
      }
      resultTable.innerHTML += schoolInfoHtml;
      ceInfo.classList.remove('hidden');
      ceInfo.setAttribute('role', 'alert');
    // } else if (fetchWasOk && responseData && Array.isArray(responseData.ARERRORS)) {
    //   ceErrorMsg.innerHTML = responseData.ARERRORS.map((errorMsg) => `<p>${errorMsg}</p>`).join
    // ('');
    //   ceErrorMsg.classList.remove('hidden');
    //   ceErrorMsg.setAttribute('role', 'alert');
    } else {
      // Use the authorable errorDesc as HTML (richtext)
      ceErrorMsg.innerHTML = fields.errorDesc;
      ceErrorMsg.classList.remove('hidden');
      ceErrorMsg.setAttribute('role', 'alert');
    }
  });
}
