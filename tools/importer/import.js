/* global WebImporter */
/* eslint-disable class-methods-use-this */

// helix-importer-ui <-> node compatibility:
import {
  transformers,
  postTransformers,
} from './transformers/index.js';

export default {
  preprocess: ({ document, url, html, params }) => {
    const icons = document.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .flex-icon');
    params.icons = icons;

    const rankListSpanTags = document.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .nb-div');
    params.rankListIcons = rankListSpanTags;
    params.pageUrl = url;
    params.html = html;

  },


  transformDOM: async ({
    document, url, html, params,
  }) => {
    const main = document.body;

    const p = transformers.map(
      async (fn) => fn.call(this, main, document, params, url),
    );
    await Promise.all(p);

    // remove header/footer/navigation
    WebImporter.DOMUtils.remove(main, [
      'footer#site-footer',
      'header#header-main',
      'div.bg-blue[role="navigation"][aria-labelledby="skip-navigation"]',
       'iframe#universal_pixel_ukdfxr8',
       'div.img[id^="batBeacon"]',
    ]);

    // Remove only <noscript> blocks containing GTM iframe
    const noscripts = main.querySelectorAll('noscript');
    noscripts.forEach((ns) => {
      if (ns.textContent.includes('googletagmanager.com/ns.html?id=GTM-M7XX5D')) {
        ns.remove();
      }
      // remove facebook tracking pixel
      if (ns.querySelectorAll('img[src*="facebook.com/tr"]')) {
        ns.remove();
      }
    });

    // Remove hidden twitter analytics iframe (#rufous-sandbox)
    const twitterAnalytics = main.querySelector('iframe#rufous-sandbox');
    if (twitterAnalytics) {
      twitterAnalytics.remove();
    }

    // Remove onetrust consent SDK
    const consentSdk = main.querySelector('#onetrust-consent-sdk');
    if (consentSdk) {
      consentSdk.remove();
    }

    // Keep the Twitter widget iframe (ignore sandbox/analytics)
    const twitterIframe = main.querySelector(
      'iframe[src*="platform.twitter.com/widgets/widget_iframe"]'
    );
    if (twitterIframe) {
    twitterIframe.remove();
      params.twitterIframe = twitterIframe.outerHTML;
    }

    // apply post-transformers
    postTransformers.forEach(
      (fn) => fn.call(this, main, document, html, params, url),
    );

    return main;
  },

  generateDocumentPath: ({
    document, url,
  }) => WebImporter.FileUtils.sanitizePath(
    new URL(url).pathname.replace(/\.cfm$/, '').replace(/\/$/, ''),
  ),
};
