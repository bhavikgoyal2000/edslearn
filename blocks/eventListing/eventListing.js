// eventListing.js

export default async function decorate(block) {

  // ---------------------------------------
  // 1. HARDCODED JSON (replace later with fetch)
  // ---------------------------------------
  const data = {
    "title": "Tuesday, November 18, 2025",
    "navigation": {
      "previousLabel": "PREVIOUS DAY",
      "nextLabel": "NEXT DAY"
    },
    "events": [
      {
        "timeDisplay": "2:00 pm — 5:00 pm",
        "title": "Care for Custodians",
        "description": "Thank you card making with aululac",
        "location": "MGSC TBL1 Lobby Information Table 1",
        "host": "Residence Hall Association (HRL)",
        "type": "(none)",
        "links": {
          "export": "#",
          "email": "#",
          "eventPage": "#"
        },
        "expanded": true
      },
      {
        "timeDisplay": "4:00 pm — 6:30 pm",
        "title": "National Security & Intelligence Community Networking Reception",
        "description": "",
        "location": "CNST 115 Meeting Room",
        "host": "School of Public Affairs",
        "type": "Networking",
        "links": {
          "export": "#",
          "email": "#",
          "eventPage": "#"
        }
      },
      {
        "timeDisplay": "5:00 pm — 6:00 pm",
        "title": "Leadership Listening Party",
        "description": "",
        "location": "MGSC 327* Meeting Room",
        "host": "Leadership Office",
        "type": "Meeting",
        "links": {
          "export": "#",
          "email": "#",
          "eventPage": "#"
        }
      },
      {
        "timeDisplay": "5:30 pm — 6:30 pm",
        "title": "BRASA Game Night",
        "description": "",
        "location": "DMTL 110 Classroom",
        "host": "BRASA Student Group",
        "type": "Social",
        "links": {
          "export": "#",
          "email": "#",
          "eventPage": "#"
        }
      }
    ]
  };

  block.innerHTML = '';
  block.classList.add('eventListing');

  const header = document.createElement("div");
  header.className = "eventListing-header";
  header.innerHTML = `
    <h2 class="eventListing-title">${data.title}</h2>
    <div class="eventListing-nav">
      <button>${data.navigation.previousLabel}</button>
      <button>${data.navigation.nextLabel}</button>
    </div>
  `;
  block.append(header);
  const list = document.createElement("div");
  list.className = "eventListing-list";

  data.events.forEach((evt) => {

    const row = document.createElement("div");
    row.className = "eventListing-item";

    // Toggle
    const toggle = document.createElement("button");
    toggle.className = "eventListing-toggle";
    toggle.innerHTML = `<span class="eventListing-chevron">▾</span>`;

    // Time
    const timeCol = document.createElement("div");
    timeCol.className = "eventListing-time";
    timeCol.textContent = evt.timeDisplay;

    // Title
    const titleCol = document.createElement("div");
    titleCol.className = "eventListing-titleCol";
    titleCol.innerHTML = `
      <div>${evt.title}</div>
      ${evt.description ? `<small>${evt.description}</small>` : ""}
    `;

    // Location
    const locCol = document.createElement("div");
    locCol.className = "eventListing-location";
    locCol.textContent = evt.location;

    row.append(toggle, timeCol, titleCol, locCol);

    // ---------------------------------------
    // 5. DETAILS PANEL
    // ---------------------------------------
    const details = document.createElement("div");
    details.className = "eventListing-details";
    details.innerHTML = `
      <dl class="eventListing-meta">
        <div><dt>Host</dt><dd>${evt.host}</dd></div>
        <div><dt>Type</dt><dd>${evt.type}</dd></div>
        <div><dt>Info</dt><dd><a href="${evt.links.eventPage}">Event Page</a></dd></div>
      </dl>

      <div class="eventListing-actions">
        <a href="${evt.links.export}">Export</a>
        <a href="${evt.links.email}">Email</a>
      </div>
    `;

    row.append(details);

    // Toggle behavior
    toggle.addEventListener("click", () => {
      const expanded = details.classList.toggle("expanded");
      const chev = toggle.querySelector(".eventListing-chevron");
      chev.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";
    });

    // Start open?
    if (evt.expanded) {
      details.classList.add("expanded");
      toggle.querySelector(".eventListing-chevron").style.transform = "rotate(180deg)";
    }

    list.append(row);
  });

  block.append(list);
}
