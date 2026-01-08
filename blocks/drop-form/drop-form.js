import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchSpreadsheetData } from '../../scripts/util.js';

/**
 * Dynamically creates a dropdown + button DOM structure
 * @param {Object} labeledData - contains buttonText and placeholder
 * @param {Object} optionsJSON - JSON with a "data" array containing { Key, Value }
 */
function createDropdownDOM(labeledData, optionsJSON) {
  // --- Create wrapper ---
  const wrapper = document.createElement('div');
  wrapper.className = 'apply-dropdown clearfix';
  wrapper.id = 'apply_dropdown_FAid';

  // --- Dropdown group ---
  const selectGroup = document.createElement('div');
  selectGroup.className = 'form-group col-md-8 col-sm-7 col-9 no-bs-padding';

  const label = document.createElement('label');
  label.className = 'sr-only';
  label.setAttribute('for', 'apply_select_FAid');
  label.textContent = labeledData.placeholder;

  const styledSelect = document.createElement('div');
  styledSelect.className = 'styled-select';

  const select = document.createElement('select');
  select.className = 'form-control';
  select.id = 'apply_select_FAid';
  select.name = 'type';
  select.autocomplete = 'off';

  // --- Placeholder option (only if placeholder exists) ---
  if (labeledData.placeholder && labeledData.placeholder.trim() !== '') {
    const defaultOption = document.createElement('option');
    defaultOption.selected = true;
    defaultOption.value = '';
    defaultOption.textContent = labeledData.placeholder;
    select.appendChild(defaultOption);
  }

  // --- Populate dropdown from JSON data array ---
  if (optionsJSON && Array.isArray(optionsJSON.data)) {
    optionsJSON.data.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.Value || '';
      option.textContent = item.Key || 'Unnamed';
      select.appendChild(option);
    });
  }

  styledSelect.appendChild(select);
  selectGroup.appendChild(label);
  selectGroup.appendChild(styledSelect);

  // --- Button group ---
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'form-group col-md-1 col-sm-2 col-3 no-bs-padding';

  const button = document.createElement('button');
  button.className = 'btn btn-primary';
  button.type = 'button';
  button.textContent = labeledData.buttonText;
  if (labeledData.placeholder) {
    button.disabled = true;
  } else {
    button.disabled = false;
  }
  buttonGroup.appendChild(button);

  // --- Append all ---
  wrapper.appendChild(selectGroup);
  wrapper.appendChild(buttonGroup);

  // Add/remove 'has-focus' on focus/blur
  selectGroup.addEventListener('focus', () => styledSelect.classList.add('has-focus'));
  selectGroup.addEventListener('blur', () => styledSelect.classList.remove('has-focus'));
  selectGroup.addEventListener('click', () => styledSelect.classList.add('has-focus'));
  selectGroup.addEventListener('change', () => styledSelect.classList.remove('has-focus'));
  selectGroup.addEventListener('change', () => {
    button.disabled = !select.value;
  });

  // --- Redirect handler ---
  const handleRedirect = () => {
    const selectedValue = select.value;
    if (selectedValue) {
      window.location.assign(selectedValue);
    }
  };

  button.addEventListener('click', handleRedirect);

  return wrapper;
}

async function initDropdown(labeledData) {
  // Fetch data dynamically from spreadsheet.json
  const optionsJSON = await fetchSpreadsheetData(labeledData.dropdownListPath);

  const containerDom = createDropdownDOM(labeledData, optionsJSON);
  return containerDom;
}

function labelData(dataArray) {
  return {
    buttonText: dataArray[0] || null,
    placeholder: dataArray[1] || null,
    dropdownListPath: dataArray[2] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const data = children.map((child) => {
    const ps = child.querySelectorAll('p');
    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }
    return null;
  });
  return { data };
}

export default async function decorate(block) {
  const extractedData = extractContainerData(block);
  const labeledData = labelData(extractedData.data);
  const dropdownFormDom = await initDropdown(labeledData);
  moveInstrumentation(block, dropdownFormDom);
  block.textContent = '';
  block.appendChild(dropdownFormDom);
}
