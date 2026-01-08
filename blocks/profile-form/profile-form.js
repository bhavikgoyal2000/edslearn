/* eslint-disable */
import { loadScriptIfNotLoadedYet } from '../../scripts/scripts.js';
import createElement from '../../scripts/util.js';

// Add modal CSS styles for specific size
const addModalStyles = () => {
  if (document.getElementById('modal-styles')) return; // Prevent duplicate styles

  const style = document.createElement('style');
  style.id = 'modal-styles';
  style.textContent = `
      .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
      }

      .modal-content {
        position: relative;
        background: var(--color-white);
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        padding: 32px 40px;
        max-height: 90vh;
        min-width: 600px;
        min-height: 500px;
        overflow-y: auto;
        margin: 0 auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 60%;
      }

      .modal-close {
        position: absolute;
        top: 0;
        right: 0;
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 22px;
        cursor: pointer;
        color: #666;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .modal-close:hover {
        background: #e0e0e0;
        color: var(--color-black);
      }

    .edit-profile-link {
      display: inline-block;
      padding: 12px 24px;
      background: #1976d2;
      color: var(--color-white);
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px;
      cursor: pointer;
      font-size: 16px;
    }

    .edit-profile-link:hover {
      background: #1565c0;
      color: white;
    }

    .side-nav-container .edit-profile-link {
      border: none;
      font-size: 1.4rem;
      line-height: 2rem;
      padding: 10px 25px 10px 10px;
      color: var(--default-body-font-color);
      margin:0;
      font-weight: normal;
      width: 100%;
      background: var(--color-white);
    }

    .edit-profile-link.disabled {
      background: var(--color-white);
      color: #1976d2;
      border: 2px solid #1976d2;
      cursor: not-allowed;
    }

    .side-nav-container .edit-profile-link.disabled {
      border: none;
      color: var(--default-body-font-color);
    }
      
    .edit-profile-link.disabled:hover {
      background: var(--color-white);
      color: #1976d2;
      text-decoration: none;
    }

    .side-nav-container .edit-profile-link:focus,
    .side-nav-container .edit-profile-link:hover,
    .side-nav-container .edit-profile-link.disabled:focus,
    .side-nav-container .edit-profile-link.disabled:hover {
      background: var(--bg-district-gray-color);
      font-weight: 700;
      color: var(--link-hover-color);
      border-radius: 0;
      text-decoration: underline;
    }

    /* Ensure form content fits properly in modal */
    .profile-form-container {
      width: 100%;
      height: 100%;
      padding: 0;
      box-sizing: border-box;
    }

    /* Adjust form container for modal size */
    .profile-form-container .tabbed-form-container {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 0;
      height: auto;
      overflow-y: visible;
    }
  `;
  document.head.appendChild(style);
};

const loadFormStyles = (el) => {
  const styles = el.querySelectorAll('style');
  styles.forEach((styleSheet) => {
    document.head.appendChild(styleSheet);
  });
};

const initializeTabFunctionality = (container) => {
  const tabs = container.querySelectorAll('.tabbed-form-tab');
  const contents = container.querySelectorAll('.tabbed-form-content');

  const allAdmins = [
    { name: 'Marcus Gore', img: 'https://american.edu/uploads/defaults/small/au_profile.jpg' },
    { name: 'Marcus Del Rio', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Marcus Johnson', img: 'https://randomuser.me/api/portraits/men/33.jpg' },
    { name: 'Marcus Jones', img: 'https://american.edu/uploads/defaults/small/au_profile.jpg' },
    { name: 'Sharon Marcus-Kurn', img: 'https://american.edu/uploads/defaults/small/au_profile.jpg' },
  ];
  let availableAdmins = [...allAdmins];
  let selectedAdmins = [];

  const renderAdmins = () => {
    const avail = container.querySelector('#available-admins');
    const sel = container.querySelector('#selected-admins');
    if (!avail || !sel) return;

    avail.innerHTML = '';
    sel.innerHTML = '';

    availableAdmins.forEach((admin) => {
      const li = document.createElement('li');
      li.className = 'admin-list-item';
      li.draggable = true;
      li.ondragstart = (dragEvent) => {
        dragEvent.dataTransfer.setData('text/plain', admin.name);
        dragEvent.dataTransfer.setData('from', 'available');
      };
      li.onclick = () => {
        availableAdmins = availableAdmins.filter((a) => a.name !== admin.name);
        selectedAdmins.push(admin);
        renderAdmins();
      };
      li.innerHTML = `
        <img src="${admin.img}" alt="${admin.name}" class="admin-avatar">
        <a href="#" class="admin-link">${admin.name}</a>
      `;
      avail.appendChild(li);
    });

    selectedAdmins.forEach((admin) => {
      const li = document.createElement('li');
      li.className = 'admin-list-item';
      li.draggable = true;
      li.ondragstart = (dragEvent) => {
        dragEvent.dataTransfer.setData('text/plain', admin.name);
        dragEvent.dataTransfer.setData('from', 'selected');
      };
      li.onclick = () => {
        selectedAdmins = selectedAdmins.filter((a) => a.name !== admin.name);
        availableAdmins.push(admin);
        renderAdmins();
      };
      li.innerHTML = `
        <img src="${admin.img}" alt="${admin.name}" class="admin-avatar">
        <a href="#" class="admin-link">${admin.name}</a>
      `;
      sel.appendChild(li);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', function handleTabClick(evt) {
      evt.preventDefault();

      tabs.forEach((t) => t.classList.remove('active'));
      contents.forEach((tc) => tc.classList.remove('active'));

      this.classList.add('active');

      const targetContent = container.querySelector(`#${this.dataset.tab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      if (this.dataset.tab === 'admins') {
        renderAdmins();

        const availList = container.querySelector('#available-admins');
        const selList = container.querySelector('#selected-admins');

        if (
          availList
          && selList
        ) {
          availList.ondragover = (dragEvent) => {
            dragEvent.preventDefault();
            availList.classList.add('drag-over');
          };
          availList.ondragleave = () => availList.classList.remove('drag-over');
          availList.ondrop = (dropEvent) => {
            availList.classList.remove('drag-over');
            const name = dropEvent.dataTransfer.getData('text/plain');
            const from = dropEvent.dataTransfer.getData('from');
            if (from === 'selected') {
              const admin = selectedAdmins.find((a) => a.name === name);
              if (admin) {
                selectedAdmins = selectedAdmins.filter((a) => a.name !== name);
                availableAdmins.push(admin);
                renderAdmins();
              }
            }
          };

          selList.ondragover = (dragEvent) => {
            dragEvent.preventDefault();
            selList.classList.add('drag-over');
          };
          selList.ondragleave = () => selList.classList.remove('drag-over');
          selList.ondrop = (dropEvent) => {
            selList.classList.remove('drag-over');
            const name = dropEvent.dataTransfer.getData('text/plain');
            const from = dropEvent.dataTransfer.getData('from');
            if (from === 'available') {
              const admin = availableAdmins.find((a) => a.name === name);
              if (admin) {
                availableAdmins = availableAdmins.filter((a) => a.name !== name);
                selectedAdmins.push(admin);
                renderAdmins();
              }
            }
          };
        }

        const searchBtn = container.querySelector('#admin-search-btn');
        const searchInput = container.querySelector('#admin-search');

        if (searchBtn) {
          searchBtn.onclick = () => {
            const q = searchInput.value.toLowerCase();
            availableAdmins = allAdmins.filter(
              (a) => !selectedAdmins.some((s) => s.name === a.name)
              && a.name.toLowerCase().includes(q),
            );
            renderAdmins();
          };
        }

        if (searchInput) {
          searchInput.oninput = () => {
            if (!searchInput.value) {
              availableAdmins = allAdmins.filter(
                (a) => !selectedAdmins.some((s) => s.name === a.name),
              );
              renderAdmins();
            }
          };
        }
      }
    });
  });

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const form = container.querySelector('#profileForm');
  const loader = container.querySelector('#profile-form-loader');
  if (form) {
    form.addEventListener('submit', async function (evt) {
      evt.preventDefault();
      if (loader) loader.style.display = 'block';
      form.style.display = 'none';
      if (window.tinymce) {
        window.tinymce.triggerSave();
      }
      const formData = new FormData(this);
      // Remove photo and resume fields from FormData
      formData.delete('photo');
      formData.delete('resume');
      const data = Object.fromEntries(formData.entries());
      // Append selected admins to FormData
      const selectedAdmins = this.selectedAdmins || [];
      console.log('selectedAdmins:', selectedAdmins);
      selectedAdmins.forEach((admin) => {
        const display = `${admin.firstname || ''} ${admin.lastname || ''} (${admin.email})`.trim();
        formData.append('sample', display);
      });
      // eslint-disable-next-line no-console
      console.log('Form submitted:', formData);
      try {
        const response = await fetch(
          'https://1053853-633gainsboroboa-dev.adobeio-static.net/api/v1/web/AU-OpenAPI/updateFragment',
          {
            method: 'POST',
            body: formData,
          },
        );

        if (response.ok) {
          const result = await response.json();
          // eslint-disable-next-line no-console
          console.log('Upload successful:', result);
          // eslint-disable-next-line no-alert
          alert('Update successful!');
          window.location.reload();
        } else {
          // eslint-disable-next-line no-console
          console.error('Upload failed:', await response.text());
          // eslint-disable-next-line no-alert
          alert('Update failed!');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error updating:', err);
        // eslint-disable-next-line no-alert
        alert('Error updating!');
      } finally {
        if (loader) loader.style.display = 'none';
        if (form) form.style.display = 'block';
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
          modal.remove();
          document.body.style.overflow = '';
        }
      }
    });
  }

  const cancelBtn = container.querySelector('#cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        modal.remove();
        document.body.style.overflow = '';
      }
    });
  }
};

const loadFormScripts = async (elqForm) => {
  const scripts = [...elqForm.querySelectorAll('script')];
  const promises = [];
  let tinymceShouldInit = false;

  for (const script of scripts) {
    let waitForLoad = Promise.resolve();
    const scriptAttrs = {};

    script.getAttributeNames().forEach((attrName) => {
      const attrValue = script.getAttribute(attrName);
      scriptAttrs[attrName] = attrValue;
    });

    // Check if it's the TinyMCE script
    if (script.getAttribute('src') && script.getAttribute('src').includes('tinymce')) {
      waitForLoad = loadScriptIfNotLoadedYet(script.getAttribute('src'), scriptAttrs);
      tinymceShouldInit = true;
      await waitForLoad; // Wait for TinyMCE to load before running init scripts
    } else if (script.getAttribute('src')) {
      waitForLoad = loadScriptIfNotLoadedYet(script.getAttribute('src'), scriptAttrs);
    } else {
      // Inline script, run after TinyMCE is loaded
      const newScript = createElement('script', { props: { type: 'text/javascript' } });
      newScript.innerHTML = script.innerHTML;
      document.body.append(newScript);
    }

    script.remove();
    promises.push(waitForLoad);
  }
  await Promise.all(promises);

  // Always remove any previous TinyMCE editors before initializing
  if (window.tinymce && typeof window.tinymce.remove === 'function') {
    window.tinymce.remove();
  }
  // Always re-initialize TinyMCE on all textareas if script was present
  if (window.tinymce && tinymceShouldInit) {
    window.tinymce.init({ selector: 'textarea' });
  }
};

const showModal = async (content) => {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = createElement('div', { classes: 'modal-overlay' });
  const modalContent = createElement('div', { classes: 'modal-content' });
  const closeButton = createElement('button', { classes: 'modal-close' });
  closeButton.innerHTML = '&times;';

  modalContent.appendChild(closeButton);
  modalContent.appendChild(content);
  modal.appendChild(modalContent);

  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
  };

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (evt) => {
    if (evt.target === modal) closeModal();
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', arguments.callee);
    }
  });

  document.body.style.overflow = 'hidden';
  document.body.appendChild(modal);
};

const loadFormInModal = async () => {
  try {
    const data = await fetch(
      `${window.hlx.codeBasePath}/blocks/profile-form/forms/Profile-Form.html`,
    );
    if (!data.ok) {
      // eslint-disable-next-line no-console
      console.error('Failed to load form');
      return;
    }
    const text = await data.text();
    const formWrapper = createElement('div', { classes: 'profile-form-container' });
    formWrapper.innerHTML = text;

    loadFormStyles(formWrapper);
    initializeTabFunctionality(formWrapper);
    showModal(formWrapper);
    await loadFormScripts(formWrapper);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading form:', error);
  }
};

// Replace with actual user permission check
const checkUserCanEdit = (loginStatus) => {
  return false; // Placeholder: change to actual logic
}

const createEditProfileLink = () => {
  // If logged and profile can edit in display edit profile link
  const loginStatus = ""; // Replace with actual login status check
  if (loginStatus && checkUserCanEdit(loginStatus)) {
    const link = createElement('a', { classes: 'edit-profile-link' });
    link.textContent = 'Edit Profile';
    link.addEventListener('click', (evt) => {
      evt.preventDefault();
      loadFormInModal();
    });
    return link;
  } else {
    const link = createElement('a', { classes: ['edit-profile-link', 'disabled'] });
    link.textContent = 'Login to Edit Your Profile';
    return link;
  }
};

const addForm = async (block) => {
  addModalStyles();
  const editLink = createEditProfileLink();
  block.innerHTML = '';
  block.appendChild(editLink);
};

export default async function decorate(block) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        addForm(block);
      }
    },
    {
      rootMargin: '300px',
    },
  );
  observer.observe(block);
}
