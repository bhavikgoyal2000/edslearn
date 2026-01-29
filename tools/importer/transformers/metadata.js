/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')   // must come first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// eslint-disable-next-line no-unused-vars
const createMetadata = (main, document, html, params, urlStr) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.title = escapeHTML(title.textContent.replace(/[\n\t]/gm, ''));
  }

  const desc = document.querySelector('head > meta[property="og:description"]');
  if (desc) {
    meta.description = escapeHTML(desc.getAttribute('content').replace(/[\n\t]/gm, ''));
  }

  const twitter = document.querySelector('head > meta[name="twitter:card"]');
  if (twitter) {
    meta.twitter = escapeHTML(twitter.getAttribute('content').replace(/[\n\t]/gm, ''));
  }

  const img = document.querySelector('head > [property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = cleanUpSrcUrl(img.content);
    meta.image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

export default createMetadata;
