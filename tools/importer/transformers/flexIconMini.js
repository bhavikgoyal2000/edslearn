import { hasGlobalElement } from '../utils/dom-utils.js';
import createItem from './flexIconMiniItem.js';

const flexIconMini = (main, document, params) => {
  let flexIconMini = params.icons;//main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .flex-icon');

  // Group by parent of article (section/class/id)
  const groups = {};
  flexIconMini.forEach(el => {
    // Find the parent article
    const article = el.closest('article.el-mini-flex-item');
    if (!article) return;
    // Find the parent section of the article
    const section = article.closest('section');
    let key = null;
    if (section) {
      if (section.id) key = `id:${section.id}`;
      else if (section.className) key = `class:${section.className.trim().split(/\s+/).join('.')}`;
      else key = section.nodeName.toLowerCase();
    } else {
      // fallback to article's parent if no section found
      const parent = article.parentElement;
      if (parent?.id) key = `id:${parent.id}`;
      else if (parent?.className) key = `class:${parent.className.trim().split(/\s+/).join('.')}`;
      else key = parent?.nodeName?.toLowerCase() || 'unknown';
    }
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(el);
  });

  Object.values(groups).forEach(group => {
    const flexIconMiniBlock = [['Flex Icon Mini']];
    group.forEach(flexIconMiniParent => {
      if (flexIconMiniParent) {
        const isGlobalElement = hasGlobalElement(flexIconMiniParent);
        if (isGlobalElement) {
            flexIconMiniBlock.push([isGlobalElement]);
        } else {
          flexIconMiniBlock.push([false]);
        }
        let flexIconMiniItem = createItem(flexIconMiniParent, document, params);
        if (flexIconMiniItem) {
          flexIconMiniBlock.push(flexIconMiniItem);
        }
      }
    });
    if (flexIconMiniBlock.length > 1) {
      const block = WebImporter.DOMUtils.createTable(flexIconMiniBlock, document);
      main.append(block);
    }
  });
};

export default flexIconMini;