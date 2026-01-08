/* eslint-disable */
// --- On Submit Function ---
function onSubmitFn(form) {
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchQuery = form.querySelector('#inputJASearch').value || 'No Query Entered';
    const label = `Form Submission - Search Query: ${searchQuery}`;
    const act = 'submit';
    const cat = 'form-submission';
    // Log the search query
    console.log(`Form submitted with search query: ${searchQuery}`);
    // Track the event with a delay before actual submission
    // Delay form submission to ensure tracking is processed
    setTimeout(() => {
      event.target.submit();
    }, 100);
  });
}

// --- Function to fetch config based on dataset ---
function getConfig(selectedValue) {
  const formConfigs = {
    'just-ask': {
      action: 'https://americanuniversity.service-now.com/csm/',
      placeholder: 'Search for student & academic related information and services.',
      label: 'Search for student & academic related information and services.'
    },
    'it-help': {
      action: 'https://americanuniversity.service-now.com/sp/',
      placeholder: 'Search for IT-related information and services.',
      label: 'Search for IT-related information and services.'
    },
    'research': {
      action: 'https://help.american.edu/research/',
      placeholder: 'Search for research information and services.',
      label: 'Search for research information and services.'
    }
  };

  return formConfigs[selectedValue] || formConfigs['just-ask'];
}

// --- Function to build DOM based on config ---
function buildForm(config) {
  const wrapper = document.createElement('div');
  wrapper.className = 'content-wrapper';

  const heading = document.createElement('h1');
  heading.className = 'text-center-align';
  heading.textContent = 'How can we help?';

  const form = document.createElement('form');
  form.action = config.action;
  form.method = 'get';
  form.name = 'JASearchWidget';

  // Attach custom onSubmit function
  onSubmitFn(form);

  const hidden1 = document.createElement('input');
  hidden1.type = 'hidden';
  hidden1.name = 'id';
  hidden1.value = 'search';

  const hidden2 = document.createElement('input');
  hidden2.type = 'hidden';
  hidden2.name = 't';
  hidden2.value = 'kb';

  const searchDiv = document.createElement('div');
  searchDiv.className = 'form-group search-field';

  const label = document.createElement('label');
  label.setAttribute('for', 'inputJASearch');
  label.className = 'sr-only';
  label.textContent = config.label;

  const input = document.createElement('input');
  input.required = true;
  input.type = 'text';
  input.name = 'q';
  input.id = 'inputJASearch';
  input.placeholder = config.placeholder;
  input.className = 'form-control';

  searchDiv.append(label, input);

  const btnDiv = document.createElement('div');
  btnDiv.className = 'form-group sub-btn';

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'btn btn-primary';
  button.textContent = 'Submit';

  btnDiv.append(button);

  form.append(hidden1, hidden2, searchDiv, btnDiv);
  wrapper.append(heading, form);

  return wrapper;
}

// --- Decorate ---
export default function decorate(block) {
  const blockChildren = Array.from(block.children).slice(1);
  const valueElement = blockChildren[0]?.querySelector('p');
  const selectedValue = valueElement ? valueElement.textContent.trim().toLowerCase() : '';

  // STEP 2: Fetch configs based on selected value
  const config = getConfig(selectedValue);
  block.innerHTML = ''; // clear block first
  let bgUrl = '';
  if (selectedValue === 'just-ask') {
    bgUrl = `${window.hlx.codeBasePath}/blocks/just-ask/justask.jpg`;
  }
  if (selectedValue === 'it-help') {
    bgUrl = `${window.hlx.codeBasePath}/blocks/just-ask/help.jpg`;
  }
  if (selectedValue === 'research') {
    bgUrl = `${window.hlx.codeBasePath}/blocks/just-ask/hr.jpg`;
  }
  
  requestAnimationFrame(() => {
    const blockWidth = block.getBoundingClientRect().width || 0;
    const parentWidth = block.parentElement
      ? block.parentElement.getBoundingClientRect().width || 0
      : window.innerWidth;

    let widthPercent = 100; // default assume full width
    if (parentWidth > 0) {
      widthPercent = (blockWidth / parentWidth) * 100;
    }

  if (widthPercent >= 30) {
    block.style.background = `url('${bgUrl}')`;
  } else {
    block.classList.add('right-rail'); // <-- replace with your actual class
  }
});

  const formDom = buildForm(config); // get dom structure
  block.append(formDom); // append in decorate
}