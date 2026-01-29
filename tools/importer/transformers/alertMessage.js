/* global WebImporter */
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';
/* global WebImporter */
const alertMessage = (main, document) => {
  const alerts = main.querySelectorAll('div[role="alert"]');
  if (!alerts.length) return;

  const validTypes = ['alert-danger', 'alert-info', 'alert-success', 'alert-warning'];

  alerts.forEach(alert => {
    // --- Determine alert type ---
     const isGlobal = hasGlobalElement(alert) ? 'true' : 'false';
    const typeClass = [...alert.classList].find(
      c => c.startsWith('alert-') && c !== 'alert'
    );
    const alert_type = validTypes.includes(typeClass) ? typeClass : 'alert-info';

    // --- Combine all <p> elements into one string for richtext ---
    let contentHTML = '';
    alert.querySelectorAll('p').forEach(pTag => {
      contentHTML += pTag.outerHTML.trim();
    });

    // --- Build table rows matching the model ---
    const cells = [
      ['Alert Message'],
      [isGlobal] ,          // hidden global flag
      [alert_type],      // select field
      [contentHTML],        // richtext field
    ];

    // --- Create table block ---
    const block = WebImporter.DOMUtils.createTable(cells, document);

    // --- Replace original alert ---
    alert.replaceWith(block);
  });
};

export default alertMessage;
