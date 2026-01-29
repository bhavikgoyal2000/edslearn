/* global WebImporter */

const columnSectionImporter = (main, document) => {
  const widthMap = {
    'section-hero': { id: '', width: '' },
    'section-center': { id: 'au-main-content-section-w-right-rail', width: 'main-with-right-rail' },
    'section-center-80': { id: 'au-main-content-section-w-right-rail', width: 'main-with-right-rail-80' },
    'section-right': { id: 'au-right-rail-content-section', width: 'right-rail' },
    'section-right-20': { id: 'au-right-rail-content-section', width: 'right-rail-20' },
    'page-main-container': { id: 'au-main-content-section-w-right-rail', width: 'main-without-right-rail' },
    'section-left': { id: 'au-left-rail-content-section', width: 'left-rail' },
    'highlight-section': { id: '', width: '' },
    'section-colored-bg': { id: '', width: '' }, // new entry
  };

  const createSectionTable = (config, section, type = 'content-section') => {
    const sectionCells = [
      ['Section Metadata'],
      ['blockModelId', config.id],
      ['style_width', config.width],
      ['style_sectiontype', type],
    ];
    const table = WebImporter.DOMUtils.createTable(sectionCells, document);
    section.after(table, document.createElement('hr'));
  };

  // --- HERO SECTION ---
  const heroSection = main.querySelector('section#section-hero');
  if (heroSection) {
    createSectionTable(widthMap['section-hero'], heroSection, 'hero-section');
  }

  // --- COLUMN SECTIONS ---
  const rowContainers = main.querySelectorAll(`
    .section-left[class*="col-md-"],
    .section-center[class*="col-md-"],
    .section-right[class*="col-md-"],
    #page-main-container
  `);

  rowContainers.forEach(container => {
    let classKey = [...container.classList].find(c => widthMap[c]) || 'page-main-container';
    let config = widthMap[classKey];

    // look at all direct child sections
    const childSections = container.querySelectorAll(':scope > section');
    childSections.forEach(child => {
      let childClassKey = [...child.classList].find(c => widthMap[c]);
      let childConfig = widthMap[childClassKey] || config; // inherit parent if not mapped
      createSectionTable(childConfig, child);
    });

    // if no direct section children, treat container itself
    if (childSections.length === 0) {
      createSectionTable(config, container);
    }
  });

  // --- HIGHLIGHT / BG SECTIONS ---
  const highlightSections = main.querySelectorAll('section[class*="highlight-"]');
  highlightSections.forEach(section => {
    const parentSectionMain = section.closest('.section-main');
    if (parentSectionMain) return; // handled by parent
    createSectionTable(widthMap['highlight-section'], section, 'highlight-section');
  });


  // --- COLORED BACKGROUND SECTIONS ---
  const coloredBgSections = main.querySelectorAll('section.section-colored-bg');
  coloredBgSections.forEach(section => {
    // look for parent container that maps to a width
    const bgClass = [...section.classList].find(c => c.startsWith('bg-'));
    const headingEl = section.querySelector('header h1, header h2, header h3');
    const headingTxt = headingEl?.textContent.trim() || '';
    const parent = section.closest('.section-left, .section-center, .section-right, #page-main-container');
    let config;
    if (parent) {
      let parentClassKey = [...parent.classList].find(c => widthMap[c]) || 'page-main-container';
      config = widthMap[parentClassKey];

    } else {
      config = widthMap['section-colored-bg']; // default
    }
    const sectionCells = [
          ['Section Metadata'],
          ['blockModelId', config.id],
          ['style_width', config.width],
          ['style_sectiontype', 'content-section'],
          ['bgColor', bgClass],
         ['headerTxt', headingTxt]

];
        const table = WebImporter.DOMUtils.createTable(sectionCells, document);
        section.after(table, document.createElement('hr'));
    //createSectionTable(config, section, 'colored-background-section');
  });
};

export default columnSectionImporter;
