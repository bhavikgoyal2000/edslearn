import { fetchComponentData } from '../../scripts/graphql-api.js';

function createLoader(msg) {
  const loader = document.createElement('div');
  loader.className = 'profile-detail-graphql-loader';
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>Loading ${msg}...</p>
  `;
  return loader;
}

function createContactLinksSection(data) {
  if (!data?.contactLinks?.html) return null;

  // Create main wrapper divs
  const colDiv = document.createElement('div');
  colDiv.className = 'col-lg-4 col-md-12 col-12';

  const profileSeeAlso = document.createElement('div');
  profileSeeAlso.className = 'profile-see-also';

  const dl = document.createElement('dl');

  // Create title
  const dt = document.createElement('dt');
  dt.textContent = 'See Also';

  // Create dd for contact links and set innerHTML directly
  const ddLinks = document.createElement('dd');
  ddLinks.className = 'bullet';
  ddLinks.innerHTML = data.contactLinks.html;

  // Create extra <dd> Media info section
  const dtInfo = document.createElement('dt');
  dtInfo.textContent = 'For the Media';

  const ddInfo = document.createElement('dd');
  ddInfo.innerHTML = `
    To request an interview for a news story, call AU Communications at 
    <a href="tel:2028855950" class="decor">202-885-5950</a> 
    or <a href="/media/request-an-interview.cfm" class="decor">submit a request</a>.
    Explore all AU Faculty Experts in 
    <a href="/media/auexperts.cfm" class="decor">our media guide</a>.
  `;

  // Build structure
  dl.appendChild(dt);
  dl.appendChild(ddLinks);
  dl.appendChild(dtInfo);
  dl.appendChild(ddInfo);
  profileSeeAlso.appendChild(dl);
  colDiv.appendChild(profileSeeAlso);

  return colDiv;
}

function createHeader(data) {
  const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
  const header = document.createElement('div');
  header.className = 'profile-header';

  const h1 = document.createElement('h1');
  h1.className = 'profile-name';

  // Name
  const spanName = document.createElement('span');
  spanName.setAttribute('itemprop', 'name');
  spanName.textContent = fullName || 'Unnamed Profile';
  h1.appendChild(spanName);

  // Determine profile type and title
  const profileType = data.profileType || 'faculty'; // fallback
  const profileTitle = data.profileTitle || (profileType === 'faculty' ? data.faculty_title : data.staff_title) || '';

  const deptName = profileType === 'faculty' ? data.faculty_dept_name : data.staff_dept_name;

  // Job title
  if (profileTitle) {
    const smallTitle = document.createElement('small');
    smallTitle.setAttribute('itemprop', 'jobTitle');
    smallTitle.textContent = profileTitle;
    h1.appendChild(smallTitle);
  }

  // Department
  if (deptName) {
    const smallDept = document.createElement('small');
    smallDept.setAttribute('itemprop', 'worksFor affiliation memberOf');
    smallDept.textContent = deptName;
    h1.appendChild(smallDept);
  }

  header.appendChild(h1);
  return header;
}

function createContact(data) {
  const footer = document.createElement('div');
  footer.className = 'profile-contact';

  const dl = document.createElement('dl');
  dl.className = 'profile-contact-info';

  const dt = document.createElement('dt');
  dt.textContent = 'Contact';
  dl.appendChild(dt);

  if (data.email) {
    const ddEmail = document.createElement('dd');
    ddEmail.className = 'profile-email';
    ddEmail.innerHTML = `<i class="fa-light fa-envelope"></i> 
      <a href="mailto:${data.email}">${data.email}</a>
      <meta itemprop="email" content="${data.email}">`;
    dl.appendChild(ddEmail);
  }

  if (data.fso_phone) {
    const ddPhone = document.createElement('dd');
    ddPhone.className = 'profile-phone';
    ddPhone.innerHTML = `<i class="fa-light fa-phone"></i>
      <a href="tel:${data.fso_phone.replace(/\D/g, '')}" class="decor">
      <span itemprop="telephone">${data.fso_phone}</span></a>`;
    dl.appendChild(ddPhone);
  }

  if (data.fso_line1) {
    const ddOffice1 = document.createElement('dd');
    ddOffice1.textContent = data.fso_line1;
    dl.appendChild(ddOffice1);
  }

  if (data.fso_line2) {
    const ddOffice2 = document.createElement('dd');
    ddOffice2.textContent = data.fso_line2;
    dl.appendChild(ddOffice2);
  }

  if (data.officeHours) {
    const ddAvail = document.createElement('dd');
    ddAvail.innerHTML = data.officeHours;
    dl.appendChild(ddAvail);
  }

  footer.appendChild(dl);
  return footer;
}

function createBioInfo(data) {
  const dl = document.createElement('dl');
  dl.className = 'profile-info-bio';

  // Additional Positions
  if (data.additionalPositions?.html) {
    const dt = document.createElement('dt');
    dt.textContent = 'Additional Positions at AU';
    dl.appendChild(dt);

    const dd = document.createElement('dd');
    dd.innerHTML = data.additionalPositions.html;
    dl.appendChild(dd);
  }

  // Degrees
  if (data.degrees?.html) {
    const dt = document.createElement('dt');
    dt.textContent = 'Degrees';
    dl.appendChild(dt);

    const dd = document.createElement('dd');
    dd.innerHTML = data.degrees.html;
    dl.appendChild(dd);
  }

  // Bio
  if (data.bio?.html) {
    const dt = document.createElement('dt');
    dt.textContent = 'Bio';
    dl.appendChild(dt);

    const dd = document.createElement('dd');
    dd.innerHTML = data.bio.html;
    dl.appendChild(dd);
  }

  return dl;
}

async function fetchTeachingSection(data) {
  try {
    if (!data?.username) {
      return null;
    }
    // Construct API URL
    const apiUrl = `https://myapps.american.edu/aem_apis/teaching/profileteachingsection.cfm?eaglenetid=${encodeURIComponent(data.username)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return null;
  }
}

async function createTeaching(data) {
  if (!data?.username) return null;

  try {
    // Fetch teaching data using external API
    const teachingData = await fetchTeachingSection(data);

    // Check for valid response and Remove the teaching section if it exists
    if (!teachingData || Object.keys(teachingData).length === 0) {
      const sectionId = `teaching-section-${data.username}`;
      const sectionEl = document.getElementById(sectionId);
      sectionEl.remove();
      return null;
    }

    // Create the Teaching section DOM
    const section = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = 'Teaching';
    section.appendChild(h2);

    const teachingList = document.createElement('div');
    teachingList.className = 'profile-teaching-list';
    section.appendChild(teachingList);

    // Loop through each term (e.g., "Spring 2025", "Fall 2025")
    Object.keys(teachingData).forEach((term) => {
      const termCourses = teachingData[term];
      if (!Array.isArray(termCourses) || termCourses.length === 0) return;

      const childDiv = document.createElement('div');
      childDiv.className = 'teaching-item';

      const h3 = document.createElement('h3');
      h3.textContent = term;
      childDiv.appendChild(h3);

      const ul = document.createElement('ul');
      termCourses.forEach((course) => {
        const li = document.createElement('li');
        li.textContent = course.displayItem
          || course.displayTitle
          || course.longTitle
          || '';
        ul.appendChild(li);
      });

      childDiv.appendChild(ul);
      teachingList.appendChild(childDiv);
    });

    // Return the complete DOM section
    const parentId = `teaching-section-${data.username}`;
    const parent = document.getElementById(parentId);
    parent.innerHTML = ''; // Clear loader
    parent.appendChild(section);
    return section;
  } catch (error) {
    return null;
  }
}

function createTeachingParent(data) {
  if (!data?.username) {
    return null;
  }

  const section = document.createElement('section');
  section.id = `teaching-section-${data.username}`;
  section.className = 'profile-teaching-section';

  const h2 = document.createElement('h2');
  h2.textContent = 'Teaching';
  section.appendChild(h2);

  const teachingList = document.createElement('div');
  teachingList.className = 'profile-teaching-list';

  const loader = createLoader('Teaching Info');
  teachingList.appendChild(loader);

  section.appendChild(teachingList);

  return section;
}

function createAffiliations(data) {
  const htmlContent = data.partnerships?.html;
  if (!htmlContent) return null;

  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.textContent = 'Partnerships & Affiliations';
  section.appendChild(h2);

  const affiliationDiv = document.createElement('div');
  affiliationDiv.className = 'profile-affiliations';
  affiliationDiv.innerHTML = htmlContent;

  // if affiliationDiv contains <ul> tag than add the class "cols-3-2-1"
  if (affiliationDiv.querySelector('ul')) {
    affiliationDiv.querySelector('ul').classList.add('cols-3-2-1');
  }

  section.appendChild(affiliationDiv);
  return section;
}

function createActivities(data) {
  const htmlContent = data.scholarly?.html;
  if (!htmlContent) return null;

  const section = document.createElement('section');

  const h2 = document.createElement('h2');
  h2.textContent = 'Scholarly, Creative & Professional Activities';
  section.appendChild(h2);

  // Row container
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = htmlContent;

  section.appendChild(row);
  return section;
}

function createProfilePicAndResume(data, options = {}) {
  const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
  const { name = fullName || 'Profile Photo', resumeLabel = 'View Resume' } = options;

  // Main container
  const container = document.createElement('div');
  container.className = 'profile-image-cv';
  if (!data.photo) return container;

  // Figure + image
  // eslint-disable-next-line no-underscore-dangle
  if (data.photo && data.photo._publishUrl) {
    const figure = document.createElement('figure');

    const img = document.createElement('img');
    // eslint-disable-next-line no-underscore-dangle
    const folderPath = data._path.substring(0, data._path.lastIndexOf('/'));
    img.src = `${folderPath}/${data.username}.jpg`;
    img.className = 'profile-pic is-decorative';
    img.alt = `Photograph of ${name}`;

    figure.appendChild(img);

    // Add meta tags
    const metaUrl = document.createElement('meta');
    metaUrl.setAttribute('itemprop', 'url');
    // eslint-disable-next-line no-underscore-dangle
    metaUrl.content = data.photo._publishUrl;
    figure.appendChild(metaUrl);

    const metaWidth = document.createElement('meta');
    metaWidth.setAttribute('itemprop', 'width');
    metaWidth.content = '300';
    figure.appendChild(metaWidth);

    const metaHeight = document.createElement('meta');
    metaHeight.setAttribute('itemprop', 'height');
    metaHeight.content = '300';
    figure.appendChild(metaHeight);

    container.appendChild(figure);
  }

  // Resume link (Google Docs Viewer embed)
  // eslint-disable-next-line no-underscore-dangle
  if (data.resume && data.resume._publishUrl) {
    const p = document.createElement('p');
    p.className = 'text-left';

    const a = document.createElement('a');
    // eslint-disable-next-line no-underscore-dangle
    a.href = `https://docs.google.com/gview?url=${encodeURIComponent(data.resume._publishUrl)}&embedded=true`;
    a.className = 'btn btn-default btn-block';
    a.textContent = resumeLabel;

    p.appendChild(a);
    container.appendChild(p);
  }

  return container;
}

function renderProfile(data) {
  const main = document.createElement('div');
  main.className = 'section';

  const rowDiv = document.createElement('div');
  rowDiv.className = 'row';
  main.appendChild(rowDiv);

  const colLeft = document.createElement('div');
  colLeft.className = 'col-lg-8 col-md-12 col-12';

  colLeft.appendChild(createProfilePicAndResume(data));
  colLeft.appendChild(createHeader(data));
  colLeft.appendChild(createContact(data));
  colLeft.appendChild(createBioInfo(data));
  rowDiv.appendChild(colLeft);

  if (data.profileType !== 'staff') {
    const colRight = createContactLinksSection(data);
    if (colRight) rowDiv.appendChild(colRight);
  }

  const other = document.createElement('div');
  other.className = 'other-content';

  const sections = [
    createTeachingParent(data),
    createAffiliations(data),
    createActivities(data),
  ];

  sections.forEach((sec) => {
    if (sec) other.appendChild(sec);
  });

  main.appendChild(other);

  return main;
}

function determineProfileTypeAndTitle(cfData) {
  if (!cfData) return { profileType: null, profileTitle: null };

  let profileType = null;
  let profileTitle = null;

  // --- Determine profileType ---
  // Priority: forceDisplay
  if (cfData.forceDisplay === 'staff') {
    profileType = 'staff';
  } else if (cfData.forceDisplay === 'none' || cfData.forceDisplay === 'faculty') {
    profileType = 'faculty';
  } else if (cfData.faculty_dept_id && !cfData.staff_dept_id) {
    profileType = 'faculty';
  } else if (cfData.staff_dept_id && !cfData.faculty_dept_id) {
    profileType = 'staff';
  }

  // --- Determine profileTitle ---
  // Priority: forceTitle
  if (cfData.forceTitle === 'staff') {
    profileTitle = cfData.staff_title || null;
  } else if (cfData.forceTitle === 'none' || cfData.forceTitle === 'faculty') {
    profileTitle = cfData.faculty_title || null;
  }

  return { profileType, profileTitle };
}

export default async function decorate(block) {
  const allDivs = Array.from(block.children);
  const blocksToProcess = allDivs.slice(1)[0];
  const contentFragmentPath = blocksToProcess.querySelector('p')?.textContent.trim() || '';

  if (!contentFragmentPath) {
    block.textContent = 'No content fragment path provided.';
    return;
  }

  const loader = createLoader('Profile Data');
  block.innerHTML = '';
  block.appendChild(loader);

  fetchComponentData('GetProfileDetails', contentFragmentPath)
    .then((cfData) => {
      if (!cfData) throw new Error('No data returned from GraphQL');

      // Predict profile type and title
      const {
        profileType,
        profileTitle,
      } = determineProfileTypeAndTitle(cfData.auProfileModalByPath.item);
      cfData.auProfileModalByPath.item.profileType = profileType;
      cfData.auProfileModalByPath.item.profileTitle = profileTitle;

      // Render based on profile type
      const wrapper = renderProfile(cfData.auProfileModalByPath.item);
      block.innerHTML = ''; // Remove loader
      block.appendChild(wrapper);
      createTeaching(cfData.auProfileModalByPath.item);
    })
    .catch(() => {
      block.innerHTML = 'Failed to load profile content.';
    });
}
