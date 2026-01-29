import { hasGlobalElement } from '../utils/dom-utils.js';
import { removeCfm } from '../utils/link-utils.js';

// import utility for office
const office = async (main, document, params) => {
  const htmlString = params.html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const mainBody = doc.body;
  const globalSection = mainBody.querySelector('section.office-module[data-element="Office"]');
  const sections = main.querySelectorAll('section.office-module[data-element="Office"]');
  if (!sections) return;

  sections.forEach(async (section) => {
    const cells = [
      ['Office'] // block name
    ];

    const isGlobal = hasGlobalElement(globalSection) ? 'true' : 'false';
    const phone = section.querySelector('p.p-tel')?.textContent.trim() || '';
    let fax = section.querySelector('p.fax')?.textContent.trim() || '';
    fax = fax.replaceAll('Fax: ', '');
    const email = section.querySelector('p.u-email')?.textContent.trim() || '';
    const deptHours = section.querySelector('p.hours')?.textContent.trim() || '';
    let primaryContactName = '';
    let primaryContactTitle = '';
    let room = '';
    let building = '';
    const deptName = section.querySelector('span.p-name')?.textContent.trim() || '';
    const addressLine2 = section.querySelector('span.p-street-address')?.textContent.trim() || '';
    const city = section.querySelector('span.p-locality')?.textContent.trim() || '';
    const state = section.querySelector('span.p-region')?.textContent.trim() || '';
    const zip = section.querySelector('span.p-postal-code')?.textContent.trim() || '';
    let mapsLink = '';

    const primaryContact = section.querySelector('p.primary-contact');
    if (primaryContact) {
      let primaryContactHtml = primaryContact.innerHTML;
      primaryContactHtml = primaryContactHtml.replaceAll('\n', '');
      const primaryContactArray = primaryContactHtml.split('<br>');
      primaryContactName = primaryContactArray[1] || '';
      primaryContactTitle = primaryContactArray[2] || '';
    }

    const buildingP = section.querySelector('p.p-extended-address');
    if (buildingP) {
      const buildingAndRoom = buildingP.querySelector('span.value').textContent.split(', ');
      const link = removeCfm(buildingP.querySelector('a')?.getAttribute('href'));
      room = buildingAndRoom[1] || '';
      building = buildingAndRoom[0] || '';
      mapsLink = link || '';
    }

    cells.push([isGlobal]);
    //cells.push(['']);
    cells.push([phone]);
    cells.push([fax]);
    cells.push([email]);
    cells.push([deptHours]);
    //cells.push(['']);
    cells.push([primaryContactName]);
    cells.push([primaryContactTitle]);
    //cells.push(['']);
    cells.push([room]);
    cells.push([building]);
    cells.push([deptName]);
    cells.push([addressLine2]);
    cells.push([city]);
    cells.push([state]);
    cells.push([zip]);
    cells.push([mapsLink]);

    // --- Wrap in importer table ---
    const block = WebImporter.DOMUtils.createTable(cells, document);

    section.innerHTML = '';
    section.append(block);
  });
};

export default office;
