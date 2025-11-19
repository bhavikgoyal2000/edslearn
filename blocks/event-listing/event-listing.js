export default function decorate(block) {
  block.textContent = '';

  block.innerHTML = `
    <div class="au-calendar">

      <!-- Search -->
      <div class="au-search">
        <input type="text" placeholder="Search University Calendar">
        <span class="ion-search"></span>
      </div>

      <!-- Header -->
      <div class="au-header">
        <h1>Monday, November 3, 2025</h1>
        <div class="au-nav">
          <button>PREVIOUS DAY</button>
          <button>NEXT DAY</button>
        </div>
      </div>

      <!-- Announcement Box -->
      <div class="au-announcement">
        <div class="announce-item">
          <span class="info-icon">i</span>
          Fall B last day to withdraw with 25% refund (no refunds after this date)
          <span class="tag red">@AU</span>
        </div>
        <div class="announce-item">
          <span class="info-icon">i</span>
          Fall B last day to withdraw with 25% refund (no refunds after this date)
          <span class="tag navy" data-popup="olcas">OL: CAS, SOC, SPA & SPEXS</span>
        </div>
      </div>

      <!-- Events -->
      <div class="au-events">

        <!-- Event 1 - Expandable -->
        <div class="au-event expandable">
          <div class="au-event-header">
            <span class="au-arrow">▶</span>
            <div class="au-time">6:00 PM – 7:00 PM</div>
            <div class="au-title">ACLU at AU General Body Meeting</div>
            <div class="au-location">SIS 300 Mueller Family Meeting Room</div>
          </div>
          <div class="au-details">
            <p>ACLU at AU will be hosting another GBM to introduce our new freshman fellows and bring in ACLU of DC staff to discuss current events and opportunities.</p>
            <p><strong>Host</strong> American Civil Liberties Union of DC at AU</p>
            <p><strong>Type</strong> (none)</p>
            <p><strong>More Info</strong> <a href="#">Event Page</a></p>
            <div class="au-actions">
              <a href="#">Export to Calendar</a>
              <a href="#">Email this item</a>
            </div>
          </div>
        </div>

        <!-- Event 2 -->
        <div class="au-event">
          <div class="au-event-header">
            <span class="au-arrow">▶</span>
            <div class="au-time">7:00 PM – 9:00 PM</div>
            <div class="au-title">Printmaking Workshop</div>
            <div class="au-location">BTLR 600 Butler Boardroom</div>
          </div>
        </div>

      </div>

      <!-- REAL AU POPUP -->
      <div class="au-popup-overlay" id="au-popup">
        <div class="au-popup">
          <div class="au-popup-header">
            <h2>Academic Calendar Explanations</h2>
            <button class="au-close">×</button>
          </div>
          <div class="au-popup-body">
            <div class="au-popup-row">
              <span class="au-tag red">Semester Calendar</span>
              <div>AU's standard academic calendar consisting of the Fall & Spring Semesters and the Summer Sessions each year.</div>
            </div>
            <div class="au-popup-row">
              <span class="au-tag gray">Four Term Calendar</span>
              <div>AU's Four Term academic calendar consisting of January – March Term 1, April – June Term 2, July – September Term 3, & October – December Term 4. This calendar is used by Online programs in Kogod School of Business and some courses in Washington College of Law</div>
            </div>
            <div class="au-popup-row">
              <span class="au-tag navy">OL: CAS, SOC, SPA & SPEXS</span>
              <div>Academic Calendar for Online Programs in SOC, SPA, CAS (excluding School of Education) and SPEXS</div>
            </div>
            <div class="au-popup-row">
              <span class="au-tag green">OL: SIS</span>
              <div>Academic Calendar for Online Programs in School of International Service</div>
            </div>
            <div class="au-popup-row">
              <span class="au-tag green">OL: SOE</span>
              <div>Academic Calendar for Online Programs in School of Education</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Accordion
  block.querySelectorAll('.au-event.expandable').forEach(event => {
    const header = event.querySelector('.au-event-header');
    const details = event.querySelector('.au-details');
    const arrow = event.querySelector('.au-arrow');

    header.addEventListener('click', () => {
      const isOpen = event.classList.toggle('open');
      arrow.textContent = isOpen ? '▼' : '▶';
      details.style.display = isOpen ? 'block' : 'none';
    });
  });

  // Tags open popup
  block.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('au-popup').classList.add('visible');
    });
  });

  // Close popup
  block.querySelector('.au-close').addEventListener('click', () => {
    document.getElementById('au-popup').classList.remove('visible');
  });
  block.querySelector('.au-popup-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('au-popup').classList.remove('visible');
    }
  });
}
