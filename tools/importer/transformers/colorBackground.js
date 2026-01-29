// import utility for sectionBgColorContainer
const sectionBgColorContainer = (main, document) => {
  const section = main.querySelector('section#our-schools-and-degrees');
  if (!section) return;

  const cells = [
    ['sectionBgColorContainer'] // block name
  ];

  // --- Bg Color ---
  let bgColor = 'bg-none';
  const classList = Array.from(section.classList);
  if (classList.includes('bg-claweds-beak-yellow')) {
    bgColor = 'bg-clawed-beak-yellow-light-color';
  } else if (classList.includes('bg-botany-blue')) {
    bgColor = 'bg-botany-blue-light-color';
  } else if (classList.includes('bg-district-gray')) {
    bgColor = 'bg-district-gray-light-color';
  } else if (classList.includes('bg-embassy-blue')) {
    bgColor = 'bg-embassy-blue-light-color';
  } else if (classList.includes('bg-indigo-purple')) {
    bgColor = 'bg-indigo-purple-light-color';
  } else if (classList.includes('bg-mckinley-green')) {
    bgColor = 'bg-mckinley-green-light-color';
  } else if (classList.includes('bg-metro-silver')) {
    bgColor = 'bg-metro-silver-light-color';
  } else if (classList.includes('bg-tenleytown-red')) {
    bgColor = 'bg-tenleytown-red-light-color';
  }
  cells.push(['bgColor', bgColor]);

  // --- Header Text ---
  const header = section.querySelector('header h1');
  cells.push(['headerTxt', header ? header.textContent.trim() : '']);

  // --- Has Content ---
  const contentSections = section.querySelectorAll('div > section');
  const hasContent = contentSections.length > 0 ? ['hasContent'] : [];
  cells.push(['sectionHasContent', hasContent.join(',')]);

  // --- Narrow Margin ---
  const narrowMargin = classList.includes('narrow-margin') ? ['narrowMargin'] : [];
  cells.push(['sectionNarrowMargin', narrowMargin.join(',')]);

  // --- Wrap into importer block ---
  const block = WebImporter.DOMUtils.createTable(cells, document);

  section.innerHTML = '';
  section.append(block);
};

export default sectionBgColorContainer;
