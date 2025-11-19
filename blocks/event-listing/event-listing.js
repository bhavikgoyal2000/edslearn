export default function decorate(block) {
  block.textContent = '';

  block.innerHTML = `
    <div class="eventcalendar">

      <!-- Search Bar -->
      <div class="search-bar">
        <input type="text" placeholder="Search University Calendar" />
        <button>🔍</button>
      </div>

      <!-- Date Header -->
      <div class="date-header">
        <h1>Monday, November 3, 2025</h1>
        <div class="nav-buttons">
          <button>PREVIOUS DAY</button>
          <button>NEXT DAY</button>
        </div>
      </div>

      <!-- Announcement Banner -->
      <div class="announcement">
        <span class="icon">ℹ</span>
        Fall B last day to withdraw with 25% refund (no refunds after this date)
        <span class="tag red" data-popup="fallb">Fall B</span>
        <span class="tag blue" data-popup="colcas">COL, CAS, SOC, SPA & SPEXS</span>
      </div>

      <!-- Events List -->
      <div class="events">

        <div class="event expandable">
          <div class="event-time">6:00 PM – 7:00 PM</div>
          <div class="event-title">ACLU at AU General Body Meeting</div>
          <div class="event-location">SIS 300 Mueller Family Meeting Room</div>
        </div>

        <div class="event">
          <div class="event-time">7:00 PM – 9:00 PM</div>
          <div class="event-title">Printmaking Workshop</div>
          <div class="event-location">BTLR 600 Butler Boardroom</div>
        </div>

      </div>

      <!-- Popup Modal (hidden by default) -->
      <div class="popup-overlay" id="popup">
        <div class="popup">
          <button class="close-btn">×</button>
          <h2>Academic Calendar Explanations</h2>
          <div class="popup-content">
            <div class="popup-item" id="fallb">
              <strong>Fall B</strong><br>
              Fall B last day to withdraw with 25% refund (no refunds after this date)
            </div>
            <div class="popup-item" id="colcas">
              <strong>COL, CAS, SOC, SPA & SPEXS</strong><br>
              Academic Calendar for Online Programs in SOC, SPA, CAS (excluding School of Education) and SPEXS
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Accordion for events (only first one expandable in your example)
  const expandable = block.querySelector('.event.expandable');
  if (expandable) {
    expandable.addEventListener('click', () => {
      expandable.classList.toggle('open');
    });
  }

  // Tags open popup
  block.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const popupId = tag.getAttribute('data-popup');
      document.getElementById('popup').classList.add('visible');
      document.querySelectorAll('.popup-item').forEach(item => {
        item.style.display = 'block';
      });
    });
  });

  // Close popup
  block.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('popup').classList.remove('visible');
  });

  block.querySelector('.popup-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('popup').classList.remove('visible');
    }
  });
}