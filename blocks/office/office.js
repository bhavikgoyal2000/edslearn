// Gets Authoring data of inline video playlist component
function getData(block) {
  const innerDivs = [...block.children].slice(1);
  const phone = innerDivs[0].textContent.trim();
  const fax = innerDivs[1].textContent.trim();
  const email = innerDivs[2].textContent.trim();
  const deptHours = innerDivs[3].textContent.trim();
  const primaryContactName = innerDivs[4].textContent.trim();
  const primarycontactTitle = innerDivs[5].textContent.trim();
  const room = innerDivs[6].textContent.trim();
  const building = innerDivs[7].textContent.trim();
  const deptName = innerDivs[8].textContent.trim();
  const addressLine2 = innerDivs[9].textContent.trim();
  const city = innerDivs[10].textContent.trim();
  const state = innerDivs[11].textContent.trim();
  const zip = innerDivs[12].textContent.trim();
  const mapsLink = innerDivs[13].textContent.trim();
  const data = {
    phone,
    fax,
    email,
    deptHours,
    primaryContactName,
    primarycontactTitle,
    room,
    building,
    deptName,
    addressLine2,
    city,
    state,
    zip,
    mapsLink,
  };

  return data;
}

export default function decorate(block) {
  const data = getData(block);

  let processedRoom = data.room ? `, ${data.room}` : '';
  if (data.room
    && !data.room.toLowerCase().startsWith('room')
    && !data.room.toLowerCase().startsWith('museum')
    && !data.room.toLowerCase().startsWith('suite')
    && !data.room.toLowerCase().startsWith('level')) {
    processedRoom = `, Room ${data.room}`;
  }
  // Create Office DOM based on authored content
  const emailAddress = data.email && data.email.startsWith('mailto:') ? data.email.replace(/^mailto:/i, '') : data.email;

  const newDOM = `
    <div class="office-contact-info">
      <h2 class="office-header">Contact Us</h2>
      ${data.phone ? `<p class="office-phone"><a href="tel:#${data.phone}#">${data.phone}</a></p>` : ''}
      ${data.fax ? `<p class="office-fax">Fax: ${data.fax}</p>` : ''}
      ${data.email ? `<p class="office-email"><a href="mailto:${emailAddress}">${emailAddress}</a></p>` : ''}
      ${data.deptHours ? `<p class="office-hours">${data.deptHours}</p>` : ''}
    </div>
    <div class="office-primary-contact">
      ${data.primaryContactName ? `<p class="office-primary">Contact:<br/>${data.primaryContactName}</p>` : ''}
      ${data.primaryContactName && data.primarycontactTitle ? `<p class="office-primary-title">${data.primarycontactTitle}</p>` : ''}
      ${data.building ? `<p class="office-building"><a href="${data.mapsLink ? data.mapsLink : `https://google.com/maps/place/${data.building}`}"><span class="office-room">${data.building}${processedRoom}</span> <span class="ion-map" aria-hidden="true"></span><span class="sr-only">on a map</span></a></p>` : ''}
    </div>
    <address class="office-location">
      ${data.deptName ? `<p class="office-dept-name">${data.deptName}</p>` : ''}
      ${data.addressLine2 ? `<p class="office-street">${data.addressLine2}</p>` : ''}
      ${(data.city && data.state) ? `<p class="office-locality">${data.city}, ${data.state} ${data.zip}</p>` : ''}
    </address>
  `;
  block.innerHTML = newDOM;
}
