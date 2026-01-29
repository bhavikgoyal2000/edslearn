
/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';
const createPolicyDetails = (main, document) => {
  const section = main.querySelector('section.policy-full');
  if (!section) return;

  const meta = section.querySelector('.metadata');

  // Title
  const title =
    meta.querySelector('h1 span[itemprop="headline"]')?.textContent.trim() || '';

  // PDF URL
  const pdfUrl = meta.querySelector('a[itemprop="url"]')?.getAttribute('href') || '';

  // Abstract / Description
  const description =
    meta.querySelector('dd[itemprop="description"]')?.textContent.trim() || '';

  // Policy Category
  const category =
    meta.querySelector('h1 small')?.textContent.trim() || 'Academic';

  // Responsible Office
  const responsibleOffice =
    meta.querySelector('dd[itemprop="provider"]')?.textContent.trim() || '';

  // Effective / Last Revised Dates
  const effectiveRaw =
    meta.querySelector('dd[itemprop="dateCreated"]')?.textContent.trim() ||
    meta.querySelector('dd[itemprop="datePublished"]')?.textContent.trim() ||
    '';
  const lastRevisionRaw =
    meta.querySelector('dd[itemprop="dateModified"]')?.textContent.trim() || '';

  const effective = parseDate(effectiveRaw);
  const lastRevision = parseDate(lastRevisionRaw);

  // Related Policies
  const relatedPolicies = getRelatedPolicies(meta);

  // Procedures & Guidelines
  const procedures = getSectionContent(section, 'Procedures');

  // Forms & Resources
  const forms = getSectionContent(section, 'Forms');

  // Build cells for WebImporter table
  const cells = [
    ['Policy Detail'],
    ['title_name', title],
    ['pdf_url', pdfUrl],
    ['policy_description', description],
    ['policyCategory', category],
    ['responsibleOfficer', responsibleOffice],
    ['effectiveDate', effective],
    ['lastRevisionDate', lastRevision],
    ['related_policies', relatedPolicies],
    ['procedure_guidelines', procedures],
    ['forms_resources', forms],
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);

  section.replaceWith(block);
};

export default createPolicyDetails;
/* global WebImporter */

const parseDate = (text) => {
  if (!text) return '';
  const d = new Date(text);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const getRelatedPolicies = (meta) => {
  const dts = [...meta.querySelectorAll('dt')];
  for (const dt of dts) {
    if (dt.textContent.trim().toLowerCase().includes('related policies')) {
      const dd = dt.nextElementSibling;
      return dd ? dd.innerHTML : '';
    }
  }
  return '';
};

const getSectionContent = (section, headingText) => {
  const headings = [...section.querySelectorAll('h2')];
  for (const h of headings) {
    if (h.textContent.trim().toLowerCase().includes(headingText.toLowerCase())) {
      const ul = h.nextElementSibling;
      return ul ? ul.innerHTML : '';
    }
  }
  return '';
};
