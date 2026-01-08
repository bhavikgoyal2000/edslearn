import { formatDate } from '../../scripts/util.js';
import { GRAPHQL_ENDPOINT } from '../../scripts/constants.js';

// Store [Responsible Office, Responsible Executives] as [key, value] pairs
const officePairs = new Map([
  ['Vice President & Chief Financial Officer', 'Chief Financial Officer, Vice President & Treasurer'],
  ['Vice President & Chief Information Officer', 'Vice President & Chief Information Officer'],
  ['Office of the Provost', 'Provost'],
  ['Vice President: Student Affairs', 'Vice President, Student Affairs'],
  ['Vice President: Communications & Marketing', 'Vice President, Communications & Marketing'],
  ['Office of the President', 'President'],
  ['Board of Trustees', 'Chairman'],
  ['Office of the General Counsel', 'Vice President, General Counsel & Secretary to the Board of Trustees'],
  ['Chief of Staff', 'Chief of Staff to the President'],
  ['Vice President of People and External Affairs', 'Vice President of People and External Affairs'],
  ['Vice President: University Advancement', 'Vice President, University Advancement'],
]);

function getResponsibleExecutive(key) {
  return officePairs.get(key) || key;
}

function createDefinitionTerm(label, value, attributes = {}) {
  if (!value) return null;

  const fragment = document.createDocumentFragment();

  const dt = document.createElement('dt');
  dt.textContent = label;

  const dd = document.createElement('dd');
  Object.entries(attributes).forEach(([key, val]) => {
    dd.setAttribute(key, val);
  });

  if (typeof value === 'string') {
    // If it's HTML content, insert as HTML
    if (value.trim().startsWith('<')) {
      dd.innerHTML = value;
    } else {
      dd.textContent = value;
    }
  } else {
    dd.appendChild(value);
  }

  fragment.appendChild(dt);
  fragment.appendChild(dd);

  return fragment;
}

function renderPolicyDetail(policyData) {
  const container = document.createElement('div');
  container.className = 'policy-detail';

  // Metadata container
  const metadata = document.createElement('div');
  metadata.className = 'metadata';

  // Meta tags
  const meta1 = document.createElement('meta');
  meta1.setAttribute('itemprop', 'sourceOrganization');
  meta1.setAttribute('content', 'American University');

  const meta2 = document.createElement('meta');
  meta2.setAttribute('itemprop', 'genre');
  meta2.setAttribute('content', 'University Policy');

  metadata.appendChild(meta1);
  metadata.appendChild(meta2);

  // Heading
  const h1 = document.createElement('h1');
  h1.innerHTML = `<small>${policyData.policyCategory}</small> 
                  <span itemprop="headline name">${policyData.title}</span>`;
  metadata.appendChild(h1);

  // Policy link
  if (policyData.pdfPath) {
    const domain = new URL(GRAPHQL_ENDPOINT).origin;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('itemprop', 'url');
    a.href = `https://docs.google.com/gview?url=${encodeURIComponent(domain + policyData.pdfPath)}&embedded=true`;
    a.title = `View ${policyData.title} Policy`;
    a.className = 'btn btn-primary';
    a.textContent = 'View Policy';
    a.rel = 'noopener';
    p.appendChild(a);
    metadata.appendChild(p);
  }

  // Definition List
  const dl = document.createElement('dl');
  dl.className = 'tabular';

  // Add fields dynamically
  const dtddPairs = [
    ['Subject:', policyData.policyAbstract, { itemprop: 'description' }],
    ['Responsible Executive:', policyData.responsibleOfficer ? getResponsibleExecutive(policyData.responsibleOfficer) : '', { itemprop: 'accountablePerson author publisher sponsor' }],
    ['Responsible Office(s):', policyData.responsibleText ? policyData.responsibleText : policyData.responsibleOfficer, { itemprop: 'provider' }],
    ['Related Policies:', policyData.relatedPolicy, {}],
    ['Effective:', formatDate(policyData.effectiveDate), { itemprop: 'dateCreated datePublished' }],
    ['Last Revised:', formatDate(policyData.lastRevisionDate), { itemprop: 'dateModified' }],
  ];

  dtddPairs.forEach(([label, value, attrs]) => {
    const pair = createDefinitionTerm(label, value, attrs);
    if (pair) dl.appendChild(pair);
  });

  metadata.appendChild(dl);
  container.appendChild(metadata);

  // Procedures & Guidelines
  if (policyData.procedureAndGuidelines) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Procedures & Guidelines';
    container.appendChild(h2);

    const content = document.createElement('div');
    content.innerHTML = policyData.procedureAndGuidelines;
    container.appendChild(content);
  }

  // Forms & Resources
  if (policyData.relatedFormsAndResources) {
    const h2 = document.createElement('h2');
    h2.textContent = 'Forms & Resources';
    container.appendChild(h2);

    const content = document.createElement('div');
    content.innerHTML = policyData.relatedFormsAndResources;
    container.appendChild(content);
  }

  return container;
}

function labelPolicyData(dataArray) {
  return {
    title: dataArray[0] || '',
    pdfPath: dataArray[1] || '',
    policyAbstract: dataArray[2] || '',
    policyCategory: dataArray[3] || '',
    isActive: dataArray[4] || '',
    loginRequired: dataArray[5] || '',
    responsibleOfficer: dataArray[6] || '',
    responsibleText: dataArray[7] || '',
    effectiveDate: dataArray[8] || '',
    lastRevisionDate: dataArray[9] || '',
    reviewSchedule: dataArray[10] || '',
    relatedPolicy: dataArray[11] || '',
    procedureAndGuidelines: dataArray[12] || '',
    relatedFormsAndResources: dataArray[13] || '',
  };
}

function extractPolicyContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const policyData = children.map((child, index) => {
    if (index === 2 || index === 11 || index === 12 || index === 13) {
      // For these indices, we want to extract html content
      return child.querySelector('div').innerHTML.trim();
    }
    const ps = child.querySelectorAll('p');
    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }
    return null;
  });
  return { policyData };
}

export default function decorate(block) {
  const extractedData = extractPolicyContainerData(block);
  const labeledData = labelPolicyData(extractedData.policyData);
  const blockElement = document.createElement('div');
  blockElement.className = 'policy';

  if (labeledData.isActive && labeledData.isActive.toLowerCase() === 'inactive') {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info single';
    alertDiv.innerHTML = '<div><p>The policy is currently being updated. Please check again later.</p></div>';
    blockElement.appendChild(alertDiv);
  } else {
    const policyDetail = renderPolicyDetail(labeledData);
    blockElement.appendChild(policyDetail);
  }

  block.textContent = '';
  block.appendChild(blockElement);
}
