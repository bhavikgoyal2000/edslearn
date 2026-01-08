import { moveInstrumentation } from '../../scripts/scripts.js';
import { cleanAEMUrl } from '../../scripts/util.js';

function createOptionDOM(labeledData, childBlock) {
  const option = document.createElement('option');
  option.value = labeledData.dropdownValue;
  option.textContent = labeledData.dropdownKey;

  moveInstrumentation(childBlock, option);

  return option;
}

function createDropdownDOM(labeledData) {
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

  const handleRedirect = (e) => {
    const container = e.target.closest('.apply-dropdown');
    if (!container) return;
    // Get the select inside this container
    const containerSelect = container.querySelector('select');
    if (!containerSelect) return;
    const selectedValue = cleanAEMUrl(containerSelect.value);
    if (selectedValue) {
      window.location.assign(selectedValue);
    }
  };
  button.addEventListener('click', handleRedirect);
  return wrapper;
}

function labelData(dataArray, buttonName, placeholderName) {
  return {
    buttonText: buttonName || null,
    placeholder: placeholderName || null,
    dropdownKey: dataArray[0] || null,
    dropdownValue: dataArray[1] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children);
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

export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const buttonContainer = extractContainerData(parentBlock[0]);
  const buttonName = buttonContainer.data[0];
  const placeholderContainer = extractContainerData(parentBlock[1]);
  const placeholderName = placeholderContainer.data[0];
  const labeledData = labelData([], buttonName, placeholderName);
  const dropdownFormDom = createDropdownDOM(labeledData);
  moveInstrumentation(parentBlock[0], dropdownFormDom);
  parentBlock.slice(2).forEach((childBlock) => {
    const extractedData = extractContainerData(childBlock);
    const optionData = labelData(extractedData.data, buttonName, placeholderName);
    const option = createOptionDOM(optionData, childBlock);
    const select = dropdownFormDom.querySelector('select');
    select.appendChild(option);
  });

  block.textContent = '';
  block.appendChild(dropdownFormDom);
}
