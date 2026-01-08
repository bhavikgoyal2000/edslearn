function skipTo(targetId) {
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.tabIndex = -1;
    targetElement.focus();
  }
}

function addSkiptoMainSectionForAccessibility() {
  // Create the container div
  const navDiv = document.createElement('div');
  navDiv.className = 'skip-navigation-bg-blue';
  navDiv.setAttribute('role', 'navigation');
  navDiv.setAttribute('aria-labelledby', 'skip-navigation');

  // Create the skip link
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-navigation';
  skipLink.href = '#a';
  skipLink.className = 'skip-navigation-only skip-navigation-only-focusable';
  skipLink.tabIndex = 1;
  skipLink.textContent = 'Skip to main content';
  skipLink.onclick = (e) => {
    skipTo('main-container');
    e.preventDefault();
    return false;
  };

  // Append the link to the div and the div to the body
  navDiv.appendChild(skipLink);
  document.body.insertBefore(navDiv, document.body.firstChild);
}

addSkiptoMainSectionForAccessibility();
