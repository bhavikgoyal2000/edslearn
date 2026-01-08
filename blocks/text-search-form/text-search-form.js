import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchSpreadsheetData } from '../../scripts/util.js';

// --- Attach focus/blur handlers for floating placeholder behavior ---
function attachFocusHandler(formEl) {
  if (!formEl) return;

  const inputs = formEl.querySelectorAll('input.form-control');

  inputs.forEach((input) => {
    // Store original placeholder
    const originalPlaceholder = input.getAttribute('placeholder') || '';

    input.addEventListener('focus', (e) => {
      const el = e.target;

      // Add has-focus class on wrapper div
      const wrapper = el.parentElement;
      wrapper.classList.add('has-focus');

      // Remove placeholder on focus
      el.setAttribute('placeholder', '');
    });

    input.addEventListener('blur', (e) => {
      const el = e.target;

      // Remove has-focus class
      const wrapper = el.parentElement;
      wrapper.classList.remove('has-focus');

      // Restore placeholder on blur
      el.setAttribute('placeholder', originalPlaceholder);
    });
  });
}

// --- Attach dropdown helper text behavior ---
function attachDropdownHelperBehavior(form) {
  const selectEl = form.querySelector('#primo-tab');
  const helperEl = form.querySelector('#lib-search-helper-text');

  if (!selectEl || !helperEl) return;

  selectEl.addEventListener('change', () => {
    const selected = selectEl.options[selectEl.selectedIndex];
    helperEl.innerHTML = selected.dataset.helper || '';
  });
}

// --- Create dropdown DOM ---
function createDropdownDOM(optionJson, labeledData) {
  const col = document.createElement('div');
  col.className = 'col-12 col-sm-3';

  // Label
  const label = document.createElement('label');
  label.className = 'sr-only';
  label.setAttribute('for', 'primo-tab');
  label.textContent = 'Search';
  col.appendChild(label);

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'styled-select primo-drop-arrow';

  const select = document.createElement('select');
  select.className = 'form-control';
  select.id = 'primo-tab';
  select.name = labeledData.dropdownName || 'tab';

  // Build options
  const options = optionJson.data || [];

  options.forEach((item, index) => {
    const opt = document.createElement('option');

    opt.value = item.Value || '';
    opt.innerHTML = (item.Key || '').replace(/ /g, '&nbsp;');
    opt.dataset.helper = item.helperText || '';
    opt.dataset.placeholder = labeledData.placeholderText || 'Search for Anything';
    opt.dataset.scope = item.dataScope || '';

    if (index === 0) {
      opt.setAttribute('selected', 'selected');
    }

    select.appendChild(opt);
  });

  wrapper.appendChild(select);
  col.appendChild(wrapper);

  return col;
}

// --- Create hidden inputs from array of { key, value } ---
function createHiddenInputs(hiddenInputArray = [], children = []) {
  const wrapper = document.createElement('div');
  wrapper.id = 'hidden-inputs';

  // Normalize to array
  const childList = Array.from(children || []).slice(9);
  const totalHidden = hiddenInputArray.length;

  // CASE 1: No hidden inputs → only instrumentation
  if (totalHidden === 0) {
    childList.forEach((child) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      moveInstrumentation(child, input);
      wrapper.appendChild(input);
      child.remove?.();
    });
    return wrapper;
  }

  // CASE 2: Hidden inputs exist → map them to children
  hiddenInputArray.forEach(({ key, value }, index) => {
    // Create hidden input
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;

    // query must have id
    if (key === 'query' || key === 'q') input.id = 'primoQuery';

    wrapper.appendChild(input);

    // If a child exists for this hidden input index, move it
    if (childList[index]) {
      moveInstrumentation(childList[index], input);
      childList[index].remove?.();
    }
  });

  // CASE 3: Extra children beyond hidden inputs → only instrumentation
  childList.slice(totalHidden).forEach((child) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    moveInstrumentation(child, input);
    wrapper.appendChild(input);
    child.remove?.();
  });

  return wrapper;
}

// --- Create the text input with label ---
function createTextInput(labeledData, optionsJSON) {
  const firstOption = optionsJSON?.data?.[0];
  const defaultHelper = firstOption?.helperText || '';

  const div = document.createElement('div');
  if (labeledData.isDropdown === 'true' && optionsJSON.data.length > 0) {
    div.className = 'col-12 col-sm-7';
  } else {
    div.className = 'col-12 col-sm-10';
    if (labeledData.searchBtnType === 'search-icon') {
      div.className += ' px-0';
    }
  }

  // Label
  const label = document.createElement('label');
  label.className = 'sr-only';
  label.setAttribute('for', 'primoQueryTemp');
  label.textContent = labeledData.placeholderText;

  // Text Input
  const input = document.createElement('input');
  input.className = 'form-control';
  input.id = 'primoQueryTemp';
  input.type = 'text';
  input.placeholder = labeledData.placeholderText;

  div.append(label, input);

  // Helper Text BELOW Input
  if (defaultHelper) {
    const helper = document.createElement('p');
    helper.id = 'lib-search-helper-text';
    helper.innerHTML = defaultHelper || '';

    div.appendChild(helper);
  }

  return div;
}

// --- Create the search button ---
function createSearchButton(labeledData = {}) {
  const { searchBtnTxt = 'Search', searchBtnType = 'text' } = labeledData;

  const div = document.createElement('div');
  div.className = 'col-12 col-sm-2';
  if (labeledData.searchBtnType === 'search-icon') {
    div.className += ' px-0';
  }

  const button = document.createElement('button');
  button.id = 'go';
  button.type = 'submit';
  button.className = 'btn btn-primary btn-block no-margin';
  if (labeledData.isDropdown === 'true') {
    button.className += '';
  } else if (labeledData.searchBtnType === 'search-icon') {
    button.className += '';
  } else {
    button.className += ' w-100';
  }
  button.setAttribute('aria-label', 'Search');

  if (searchBtnType === 'search-icon') {
    // --- Icon-based button ---
    const iconSpan = document.createElement('span');
    iconSpan.className = 'ion-search'; // Icon class

    const srOnlySpan = document.createElement('span');
    srOnlySpan.className = 'sr-only sr-only-focusable';
    srOnlySpan.textContent = 'Go';

    button.innerHTML = ''; // ensure clean state
    button.append(iconSpan, srOnlySpan);
  } else {
    // --- Text-based button (default) ---
    button.textContent = searchBtnTxt || 'Search';
  }

  div.appendChild(button);
  return div;
}

// --- Form submit handler ---
function searchQuery(event) {
  event.preventDefault();

  // Use the form that triggered this event
  const form = event.currentTarget;
  if (!form) return;

  const visibleInput = form.querySelector('#primoQueryTemp');
  const hiddenInput = form.querySelector('#primoQuery');
  const selectEl = form.querySelector('#primo-tab');
  const hiddenInputDiv = form.querySelector('#hidden-inputs');

  if (!visibleInput || !hiddenInput) return;

  // Build value in Primo expected format
  hiddenInput.value = `any,contains,${visibleInput.value.trim()}`;

  if (selectEl) {
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    if (selectedOption && hiddenInputDiv) {
      const scope = selectedOption.dataset.scope || '';

      // Create or reuse hidden inputs inside this form
      let scopeInput = hiddenInputDiv.querySelector('#primoScope');
      if (!scopeInput) {
        scopeInput = document.createElement('input');
        scopeInput.type = 'hidden';
        scopeInput.id = 'primoScope';
        scopeInput.name = 'search_scope';
        scopeInput.value = scope;
        hiddenInputDiv.appendChild(scopeInput);
      }
    }
  }

  // Submit only this specific form
  form.submit();
}

// --- Build the complete form DOM ---
function createTextSearchFormDOM(labeledData, hiddenInputArray, children, optionsJSON) {
  const form = document.createElement('form');

  // Apply attributes from labeledData
  form.action = labeledData.actionURL || '';
  form.method = labeledData.method || 'GET';
  form.name = 'searchForm';
  form.id = 'simple';
  form.className = 'row';
  form.enctype = 'application/x-www-form-urlencoded; charset=utf-8';
  moveInstrumentation(children[0], form);
  // Add hidden + visible fields
  form.appendChild(createHiddenInputs(hiddenInputArray, children));
  if (labeledData.isDropdown === 'true' && optionsJSON.data.length > 0) {
    form.appendChild(createDropdownDOM(optionsJSON, labeledData));
  }
  form.appendChild(createTextInput(labeledData, optionsJSON));
  form.appendChild(createSearchButton(labeledData));

  // Attach helper text behavior
  attachDropdownHelperBehavior(form);

  // Attach submit handler
  form.addEventListener('submit', searchQuery);

  // Attach focus handlers
  if (labeledData.isFloatPlaceholder === 'true') {
    attachFocusHandler(form);
  }

  return form;
}

function labelFormData(dataArray) {
  return {
    actionURL: dataArray[0] || '',
    method: 'GET',
    searchBtnType: dataArray[1],
    searchBtnTxt: dataArray[2] || 'Search',
    isDropdown: dataArray[3] || false,
    dropdownOptionsPath: dataArray[4] || '',
    isFloatPlaceholder: dataArray[5] || false,
    placeholderText: dataArray[6] || 'Search Here',
    footerText: dataArray[7] || '',
  };
}

function extractContainerData(containerElement) {
  const blocks = Array.from(containerElement.children).slice(1);
  const data = [];
  const hiddenInput = [];

  blocks.forEach((block, index) => {
    const ps = block.querySelectorAll('p');
    const texts = [];
    if (index === 7) {
      if (ps.length > 0) {
        texts.push(ps[0].innerHTML.trim());
      }
      data.push(texts.length === 1 ? texts[0] : texts);
      return;
    }

    ps.forEach((el) => {
      if (el.textContent.trim()) {
        texts.push(el.textContent.trim());
      }
    });

    if (texts.length === 0) {
      data.push(null);
      return;
    }

    // If a div has 2 elements, treat it as a key-value pair
    if (texts.length === 2) {
      const [key, value] = texts;
      hiddenInput.push({ key, value });
    }

    data.push(texts.length === 1 ? texts[0] : texts);
  });

  return { data, hiddenInput };
}

export default async function decorate(block) {
  const children = Array.from(block.children);
  const extractedData = extractContainerData(block);
  const labeledData = labelFormData(extractedData.data);
  let optionsJSON = null;
  if (labeledData.isDropdown === 'true' && labeledData.dropdownOptionsPath) {
    optionsJSON = await fetchSpreadsheetData(labeledData.dropdownOptionsPath);
  }

  const div = document.createElement('div');
  div.className = 'col-12';

  const formDom = createTextSearchFormDOM(
    labeledData,
    extractedData.hiddenInput,
    children,
    optionsJSON,
  );

  div.appendChild(formDom);

  // Add Search Notice Text
  if (labeledData.footerText) {
    const footer = document.createElement('p');
    const small = document.createElement('small');
    small.innerHTML = labeledData.footerText;
    footer.className = 'text-center search-notice';
    footer.appendChild(small);
    div.appendChild(footer);
  }

  block.textContent = '';
  block.appendChild(div);
}
