export default function decorate(block) {
  const [placeHolderObj] = block.children;
  const fallbackPlaceholder = placeHolderObj ? placeHolderObj.textContent.trim() : 'Search University Calendar';
  const calendarName = document.querySelector('meta[name="calendarname"]')?.getAttribute('content');

  const placeholderText = calendarName ? `Search ${calendarName} Calendar` : fallbackPlaceholder;

  block.textContent = '';

  const html = `
    <div class="au-calendar-search">

      <!-- Search -->
      <div class="au-search">
        <div class="au-input-wrapper">
            <input type="text" id="searchInput" required>
            <label for="searchInput">${placeholderText}</label>
        </div>
        <button type="button" aria-label="Search" class="calendar-search-button">
          <ion-icon name="search-outline"></ion-icon>
        </button>
      </div>
      </div>`;

  block.innerHTML = html;
}
