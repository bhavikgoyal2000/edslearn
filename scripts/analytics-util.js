/**
 * Creates event listener with provided event ID on provided element that pushes event
 * info to Adobe Data Layer.
 * @param {String} eventId - ID on which to create event listener
 * @param {String} eventTitle - Title of event to specify to Adobe Data Layer
 * @param {Function} getEventInfo - Function which takes event object and returns event info for
 * Adobe Data Layer
 * @param {Element} element - Element on which to apply event listener
 * @param {Function} escapeCondition - Optional - Function which takes event object and returns
 * true if event is not to be pushed to Adobe Data Layer
 */
export default function
createDataLayerEvent(eventId, eventTitle, getEventInfo, element, escapeCondition) {
  element.addEventListener(eventId, (e) => {
    if (escapeCondition instanceof Function && escapeCondition(e)) {
      return;
    }
    const eventInfo = getEventInfo(e);

    // --- Extract site sections from URL ---
    const pathSegments = window.location.pathname
      .replace(/^\/|\/$/g, '')
      .split('/');
    const [siteSection1 = '', siteSection2 = '', siteSection3 = ''] = pathSegments;

    // --- Extract pageType from cq:tags meta tag ---
    let pageType = '';
    const cqTagsMeta = document.head.querySelector('meta[name="cq-tags"]');
    if (cqTagsMeta) {
      const content = cqTagsMeta.content || '';
      // If multiple tags, pick the last non-empty one
      const tags = content.split(',').map((s) => s.trim()).filter(Boolean);
      if (tags.length > 0) {
        // Get last tag, then get type after ":" or "/"
        const lastTag = tags[tags.length - 1];
        pageType = lastTag.split('/').pop().split(':').pop();
      }
    }

    window.adobeDataLayer.push({
      event: eventTitle,
      eventInfo,
      page: {
        name: document.title,
        url: window.location.href,
        referrer: document.referrer,
        language: document.documentElement.lang,
        siteSection1,
        siteSection2,
        siteSection3,
        pageType,
      },
    });
  });
}
