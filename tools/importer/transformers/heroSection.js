/* global WebImporter */

const heroSectionImporter = (main, document) => {
  // Find the hero section
  const heroSection = main.querySelector('section#section-hero');
  if (!heroSection) return;

  const config = widthMap['section-hero'];
  // Create metadata for the hero section
 const sectionCells = [
       ['Section Metadata'],

     ];

  // Create the AEM table block
  const table = WebImporter.DOMUtils.createTable(sectionCells, document);

  // Insert table before the hero section

    heroSection.after(table, document.createElement('hr'));
};

export default heroSectionImporter;
