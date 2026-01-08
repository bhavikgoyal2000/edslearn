export function extractSelectedOption(block) {
  const select = block.textContent.trim().toLowerCase();
  if (select) return (select || '');
  return 'people';
}

function createDirectoryPanel({
  headingText,
  introText,
  directoryValue,
  inputId,
  inputLabelText,
  inputPlaceholder,
  iconClass,
  extraInlineField = null,
  showBrowse = false,
  backgroundColor = false,
  formAction = '?',
  formMethod = 'get',
  extraHiddenInputs = [],
  includeDirectoryValue = true,
}) {
  // Panel wrapper
  const wrapper = document.createElement('div');
  wrapper.className = backgroundColor ? 'directory-form-panel background-blue' : 'directory-form-panel';

  // Panel body
  const panelBody = document.createElement('div');
  panelBody.className = 'panel-body';
  wrapper.appendChild(panelBody);

  // Heading
  const heading = document.createElement('h1');
  heading.textContent = headingText;
  panelBody.appendChild(heading);

  // Optional intro text
  if (introText) {
    const intro = document.createElement('p');
    intro.className = 'directory-intro';
    intro.textContent = introText;
    panelBody.appendChild(intro);
  }

  // Form element
  const form = document.createElement('form');
  form.method = formMethod;
  form.action = formAction;
  form.className = 'directory-form-row';
  form.setAttribute('autocomplete', 'off');
  panelBody.appendChild(form);

  // Hidden directory type (only if requested)
  if (includeDirectoryValue) {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'd';
    hiddenInput.value = directoryValue;
    form.appendChild(hiddenInput);
  }

  // Extra hidden inputs (for faculty form, etc)
  extraHiddenInputs.forEach(({ name, value }) => {
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = name;
    hidden.value = value;
    form.appendChild(hidden);
  });

  // Input group (icon + input + optional select + button)
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group';

  const inputAddon = document.createElement('span');
  inputAddon.className = 'input-group-addon';
  const icon = document.createElement('span');
  icon.className = iconClass;
  inputAddon.appendChild(icon);
  inputGroup.appendChild(inputAddon);

  // Label (screen-reader only)
  const label = document.createElement('label');
  label.setAttribute('for', inputId);
  label.className = 'sr-only';
  label.textContent = inputLabelText;
  inputGroup.appendChild(label);

  // Search input
  const searchInput = document.createElement('input');
  searchInput.className = 'form-control';
  searchInput.id = inputId;
  searchInput.type = 'search';
  searchInput.name = 'q';
  searchInput.placeholder = inputPlaceholder;
  inputGroup.appendChild(searchInput);

  // Optional inline select (for People)
  if (extraInlineField) {
    extraInlineField.className = 'form-control';
    inputGroup.appendChild(extraInlineField);
  }

  // Search button
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.name = 'action';
  searchButton.className = 'btn-directory-search';
  searchButton.innerHTML = '<span class="ion-search" aria-hidden="true"></span><span class="search-text">Search</span>';
  inputGroup.appendChild(searchButton);

  // Row flex container for inputGroup and browse nav
  const formRowFlex = document.createElement('div');
  formRowFlex.className = 'directory-form-row-flex';
  form.appendChild(formRowFlex);

  formRowFlex.appendChild(inputGroup);

  // Browse nav for Departments/Services/Faculty if applicable
  if (showBrowse) {
    const browseWrapper = document.createElement('div');
    browseWrapper.className = 'directory-browse-nav';

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Browse alphabetically');
    browseWrapper.appendChild(nav);

    const navLabel = document.createElement('span');
    navLabel.className = 'nav-label';
    navLabel.textContent = 'or Browse';
    nav.appendChild(navLabel);

    // Get current list parameter from URL
    const currentList = new URLSearchParams(window.location.search).get('list');

    ['A-F', 'G-L', 'M-R', 'S-Z'].forEach((range) => {
      const a = document.createElement('a');
      a.href = `${window.location.pathname}?list=${encodeURIComponent(range)}`;
      a.className = 'alpha-link';
      a.textContent = range;

      // Check if this range matches the current list parameter
      if (currentList === range) {
        a.classList.add('active');
      }

      // Add click event to set active class
      a.addEventListener('click', () => {
        // Remove active class from all links
        nav.querySelectorAll('.alpha-link').forEach((link) => {
          link.classList.remove('active');
        });

        // Add active class to clicked link
        a.classList.add('active');
      });

      nav.appendChild(a);
    });

    formRowFlex.appendChild(browseWrapper);
  }

  return wrapper;
}

// PEOPLE FORM
function createPeopleForm() {
  const roleSelect = document.createElement('select');
  roleSelect.id = 'person-dir-role';
  roleSelect.name = 'role';

  const optAll = document.createElement('option');
  optAll.value = 'ALL';
  optAll.selected = true;
  optAll.textContent = 'All';
  roleSelect.appendChild(optAll);

  const optF = document.createElement('option');
  optF.value = 'F';
  optF.textContent = 'Faculty';
  roleSelect.appendChild(optF);

  const optS = document.createElement('option');
  optS.value = 'S';
  optS.textContent = 'Staff';
  roleSelect.appendChild(optS);

  // Panel setup
  const panel = createDirectoryPanel({
    headingText: 'People Search',
    introText: '',
    directoryValue: 'people',
    inputId: 'person-dir-q',
    inputLabelText: 'Find Someone',
    inputPlaceholder: 'Find Someone...',
    iconClass: 'ion-person',
    extraInlineField: null,
    showBrowse: false,
  });
  panel.classList.add('people');

  // Build the custom row structure
  const rowFlex = panel.querySelector('.directory-form-row-flex');
  rowFlex.innerHTML = '';

  // 1. Icon + search input
  const iconInputDiv = document.createElement('div');
  iconInputDiv.className = 'people-icon-input';

  const inputGroupAddon = document.createElement('span');
  inputGroupAddon.className = 'input-group-addon';
  const icon = document.createElement('span');
  icon.className = 'ion-person';
  inputGroupAddon.appendChild(icon);

  const label = document.createElement('label');
  label.setAttribute('for', 'person-dir-q');
  label.className = 'sr-only';
  label.textContent = 'Find Someone';

  const searchInput = document.createElement('input');
  searchInput.className = 'form-control';
  searchInput.type = 'search';
  searchInput.id = 'person-dir-q';
  searchInput.name = 'q';
  searchInput.placeholder = 'Find Someone...';

  iconInputDiv.appendChild(inputGroupAddon);
  iconInputDiv.appendChild(label);
  iconInputDiv.appendChild(searchInput);

  // 2. Select
  const selectDiv = document.createElement('div');
  selectDiv.className = 'people-select-div';
  roleSelect.className = 'form-control';
  selectDiv.appendChild(roleSelect);

  // 3. Search button
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'people-button-div';
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.name = 'action';
  searchButton.className = 'btn-directory-search';
  searchButton.textContent = 'Search';
  buttonDiv.appendChild(searchButton);

  // Assemble
  rowFlex.appendChild(iconInputDiv);
  rowFlex.appendChild(selectDiv);
  rowFlex.appendChild(buttonDiv);

  return panel;
}

function createDepartmentsForm() {
  return createDirectoryPanel({
    headingText: 'Departments',
    introText: 'Please enter a department name and click on "Search". Searches are case insensitive.',
    directoryValue: 'departments',
    inputId: 'department-dir-q',
    inputLabelText: 'Find Department',
    inputPlaceholder: 'Find a Department...',
    iconClass: 'ion-home',
    extraInlineField: null,
    showBrowse: true,
  });
}

function createServicesForm() {
  return createDirectoryPanel({
    headingText: 'Services',
    introText: 'Please enter service related keywords and click on "Search". Searches are case insensitive.',
    directoryValue: 'services',
    inputId: 'service-dir-q',
    inputLabelText: 'Find Service',
    inputPlaceholder: 'Find a Service...',
    iconClass: 'ion-briefcase',
    extraInlineField: null,
    showBrowse: true,
  });
}

function createFacultyForm() {
  return createDirectoryPanel({
    headingText: 'Faculty Experts Guide for News Media',
    introText: 'Connect with American University experts - leaders in arts, business, education, government, international affairs, law, media, politics, and more.',
    directoryValue: '1',
    inputId: 'q',
    inputLabelText: 'Find an Expert',
    inputPlaceholder: 'Find an Expert...',
    iconClass: 'ion-person',
    extraInlineField: null,
    showBrowse: true,
    backgroundColor: true,
    formAction: window.location.pathname,
    formMethod: 'get',
    extraHiddenInputs: [],
    includeDirectoryValue: false,
  });
}

function buildForm(selected) {
  switch (selected) {
    case 'people': return createPeopleForm();
    case 'departments': return createDepartmentsForm();
    case 'services': return createServicesForm();
    case 'faculty': return createFacultyForm();
    default: return createPeopleForm();
  }
}

// Main decorate function
export default function decorate(block) {
  if (!block.id) block.id = 'directory-forms';
  const selected = extractSelectedOption(block);
  const node = buildForm(selected);
  block.textContent = '';
  block.appendChild(node);
}
