function addBgColorInSection() {
  document.querySelectorAll('.section').forEach((section) => {
    const bgColor = section.getAttribute('data-bgcolor');
    if (bgColor && bgColor !== 'bg-none') {
      section.classList.add(bgColor);
      section.classList.add('section-colored-bg');
      const h1 = section.querySelector('.default-content-wrapper > h1');
      if (h1) {
        let h1ClassName;
        switch (bgColor) {
          case 'bg-botany-blue-light-color':
            h1ClassName = 'embassy-blue-color';
            break;

          case 'bg-clawed-beak-yellow-light-color':
            h1ClassName = 'kay-flame-yellow-color';
            break;

          case 'bg-district-gray-light-color':
            h1ClassName = 'talon-grey-color';
            break;

          case 'bg-embassy-blue-light-color':
            h1ClassName = 'intern-blue-color';
            break;

          case 'bg-indigo-purple-light-color':
            h1ClassName = 'suffragist-purple-color';
            break;

          case 'bg-mckinley-green-light-color':
            h1ClassName = 'arboretum-green-color';
            break;

          case 'bg-metro-silver-light-color':
            h1ClassName = 'black-color';
            break;

          case 'bg-tenleytown-red-light-color':
            h1ClassName = 'rowhouse-red-color';
            break;

          default:
            break;
        }

        if (h1ClassName) {
          h1.classList.add(h1ClassName);
        }
      }
    } else if (bgColor === 'bg-none') {
      if (section.classList.contains('section-colored-bg')) {
        section.classList.remove('section-colored-bg');
      }
    }
    const sectionhascontent = section.getAttribute('data-sectionhascontent');
    const sectionHeaderText = section.getAttribute('data-headertxt');

    let sectionHeaderDiv = null;
    let sectionContentDiv = null;

    // Create sectionHeaderText container if present
    if (sectionHeaderText) {
      sectionHeaderDiv = document.createElement('div');
      const h1Tag = document.createElement('h1');
      if (bgColor === 'bg-botany-blue-light-color') {
        h1Tag.classList.add('embassy-blue-color');
      } else if (bgColor === 'bg-clawed-beak-yellow-light-color') {
        h1Tag.classList.add('kay-flame-yellow-color');
      } else if (bgColor === 'bg-district-gray-light-color') {
        h1Tag.classList.add('talon-grey-color');
      } else if (bgColor === 'bg-embassy-blue-light-color') {
        h1Tag.classList.add('intern-blue-color');
      } else if (bgColor === 'bg-indigo-purple-light-color') {
        h1Tag.classList.add('suffragist-purple-color');
      } else if (bgColor === 'bg-mckinley-green-light-color') {
        h1Tag.classList.add('arboretum-green-color');
      } else if (bgColor === 'bg-metro-silver-light-color') {
        h1Tag.classList.add('black-color');
      } else if (bgColor === 'bg-tenleytown-red-light-color') {
        h1Tag.classList.add('rowhouse-red-color');
      }
      h1Tag.textContent = sectionHeaderText;
      sectionHeaderDiv.appendChild(h1Tag);
    }

    // Create sectionhascontent container if present
    if (sectionhascontent) {
      sectionContentDiv = document.createElement('div');
      sectionContentDiv.classList.add('col-xs-12', 'col-md-8');
      const pTag = section.querySelector('.default-content-wrapper p');
      if (pTag) {
        sectionContentDiv.appendChild(pTag);
      }
    }

    // If both are present, wrap them in a parent div
    if (sectionHeaderDiv && sectionContentDiv) {
      const parentDiv = document.createElement('div');
      parentDiv.classList.add('row-center', 'clearfix');
      sectionHeaderDiv.classList.add('col-xs-12', 'col-md-4');
      parentDiv.appendChild(sectionHeaderDiv);
      parentDiv.appendChild(sectionContentDiv);
      section.insertBefore(parentDiv, section.firstChild);
    } else if (sectionHeaderDiv) {
      // If only header, make it full width
      sectionHeaderDiv.classList.add('col-xs-12');
      section.insertBefore(sectionHeaderDiv, section.firstChild);
    } else if (sectionContentDiv) {
      section.insertBefore(sectionContentDiv, section.firstChild);
    }

    const sectionnarrowmargin = section.getAttribute('data-sectionnarrowmargin');
    if (sectionnarrowmargin) {
      section.classList.add('narrow-margin');
    }

    const leftPadding = section.getAttribute('data-leftpadding');
    if (leftPadding) section.classList.add(leftPadding);

    const rightPadding = section.getAttribute('data-rightpadding');
    if (rightPadding) section.classList.add(rightPadding);
  });
}

function addBackToTopBtn() {
  const backToTopBtn = document.querySelector('.default-content-wrapper .button-container > a.button[title="Back to top"]');

  if (!backToTopBtn) return;

  if (backToTopBtn && !backToTopBtn.querySelector('.ion-chevron-up')) {
    const icon = document.createElement('span');
    icon.className = 'ion-chevron-up';
    backToTopBtn.appendChild(icon);
  }

  // Function to toggle button visibility
  const leftRail = document.querySelector('.left-rail');
  const toggleBackToTop = () => {
    if (window.innerWidth <= 992) {
      backToTopBtn.style.display = 'none';
      return;
    }
    let threshold = 200;
    if (leftRail) {
      const leftRailHeight = leftRail?.offsetHeight;
      threshold = leftRail.getBoundingClientRect().bottom - leftRailHeight / 2;
    }
    if (window.scrollY > threshold) {
      backToTopBtn.style.display = 'block';
    } else {
      backToTopBtn.style.display = 'none';
    }
  };

  // Initial check
  toggleBackToTop();

  // Listen to scroll events
  window.addEventListener('scroll', toggleBackToTop);

  // Recheck on window resize (e.g., switching between mobile & desktop)
  window.addEventListener('resize', toggleBackToTop);

  // Add smooth scroll-to-top behavior
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

addBgColorInSection();
addBackToTopBtn();
