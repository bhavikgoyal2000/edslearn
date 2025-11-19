// blocks/eventlisting/eventlisting.js

export default function decorate(block) {
  // THIS LINE FIXES THE EMPTY DIV PROBLEM
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'eventlisting';

  // =================== FULLY HARDCODED CONTENT ===================
  wrapper.innerHTML = `
    <!-- Header -->
    <div class="eventlisting-header">
      <h2>Tuesday, November 18, 2025</h2>
      <div class="eventlisting-nav">
        <button>PREVIOUS DAY</button>
        <button>NEXT DAY</button>
      </div>
    </div>

    <!-- Event 1 - Care for Custodians (expandable) -->
    <div class="eventlisting-item">
      <div class="eventlisting-row expandable">
        <span class="arrow">▶</span>
        <div class="time">2:00 PM – 5:00 PM</div>
        <div class="details">
          <h3>Care for Custodians</h3>
          <p class="location">MGSC TBL1 Lobby Information Table 1</p>
        </div>
      </div>
      <div class="extra">
        <p>Thank you card making with aulalac</p>
        <p><strong>Host:</strong> Residence Hall Association (HRL)</p>
        <div class="actions">
          <a href="#">Export to Calendar</a>
          <a href="#">Email this item</a>
        </div>
      </div>
    </div>

    <!-- Event 2 -->
    <div class="eventlisting-item">
      <div class="eventlisting-row">
        <span class="arrow no-arrow"></span>
        <div class="time">4:00 PM – 6:30 PM</div>
        <div class="details">
          <h3>National Security & The Intelligence Community Industry Week Networking Reception</h3>
          <p class="location">CNST 115 Meeting Room</p>
        </div>
      </div>
    </div>

    <!-- Event 3 -->
    <div class="eventlisting-item">
      <div class="eventlisting-row">
        <span class="arrow no-arrow"></span>
        <div class="time">5:00 PM – 6:00 PM</div>
        <div class="details">
          <h3>Leadership Listening Party</h3>
          <p class="location">MGSC 327* Meeting Room</p>
        </div>
      </div>
    </div>

    <!-- Event 4 -->
    <div class="eventlisting-item">
      <div class="eventlisting-row">
        <span class="arrow no-arrow"></span>
        <div class="time">5:30 PM – 6:30 PM</div>
        <div class="details">
          <h3>BRASA Game Night</h3>
          <p class="location">DMT 110 Classroom</p>
        </div>
      </div>
    </div>

    <!-- Upcoming Section -->
    <div class="eventlisting-upcoming">
      <h3>After November 18, 2025</h3>
      <div class="upcoming-item">
        <span class="arrow no-arrow"></span>
        <div class="upcoming-day">Wed, 11/19/2025</div>
        <div>
          <strong>Guns Down DC Fundraising</strong><br>
          QUAD-TBL2 Friedheim Quadrangle Info Table
        </div>
      </div>
    </div>
  `;

  // =================== ACCORDION LOGIC (only first event) ===================
  const firstRow = wrapper.querySelector('.expandable');
  const firstExtra = firstRow.nextElementSibling;
  const firstArrow = firstRow.querySelector('.arrow');

  firstRow.addEventListener('click', () => {
    const isOpen = firstExtra.classList.toggle('open');
    firstRow.parentElement.classList.toggle('open', isOpen);
    firstArrow.textContent = isOpen ? '▼' : '▶';
  });

  block.appendChild(wrapper);
}