/* global WebImporter */
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';
import { removeCfm } from '../utils/link-utils.js';

const flexPromoText = (main, document, params) => {
  const flexPromosContainer = main.querySelectorAll('.flex-promo-text');
  if (!flexPromosContainer) return;
  if (!flexPromosContainer.length) return;

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const flexPromoTextSection = mainBody.querySelectorAll('.flex-promo-text');

  for (let i = 0; i < flexPromosContainer.length; i++) {
    const flex = flexPromosContainer[i];
    // --- Parent block ---
    let promoSize = flex.classList.contains('xl') ? 'xl' : '';
    const isGlobal = hasGlobalElement(flexPromoTextSection[i]) ? 'true' : 'false';
    const parentCells = [
      ['Flex Promo Text'],
      [isGlobal],
      [promoSize],

    ];


    // --- Child item block ---
    const title_name = flex.querySelector('header h2')?.textContent.trim() || '';
    const contentHTML = flex.querySelector('.promo-content')?.innerHTML.trim() || '';
    const cta = flex.querySelector('.promo-cta a');

    const flexVariation = flex.classList.contains('solid') ? 'solidBg' : 'outline';
    const flexColor = flex.classList.contains('bg-intern-blue') ? 'bg-intern-blue-color' :
      flex.classList.contains('bg-arboretum-green') ? 'bg-arboretum-green-color' :
      flex.classList.contains('bg-district-gray') ? 'bg-district-gray-color' :
      flex.classList.contains('bg-embassy-blue') ? 'bg-embassy-blue-color' :
      flex.classList.contains('bg-kay-flame-yellow') ? 'bg-kay-flame-yellow-color' :
      flex.classList.contains('bg-rowhouse-red') ? 'bg-rowhouse-red-color' :
      flex.classList.contains('bg-suffragist-purple') ? 'bg-suffragist-purple-color' : '';

    const radio = cta ? 'cta_button' : 'title_link';
    const cta1text = cta ? cta.textContent.trim() : '';

    const ctaUrl = cta ? cta.getAttribute('href') : '';
    const cta1url = removeCfm(ctaUrl);;
    // --- Build CTA element based on type ---
        let ctaElement;
        let ctaTextElement;
        const leftDiv = document.createElement('div');
        if (radio === 'title_link') {
          const h2 = document.createElement('h2');
          h2.className = 'txt-embassy-blue-color';
          const a = document.createElement('a');
          a.setAttribute('href', cta1url);
          a.setAttribute('title', title_name);
          a.setAttribute('aria-label', `More about ${title_name}`);
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.textContent = title_name;
          h2.append(a);

          ctaElement = h2;
        } else {
          const p = document.createElement('p');
          const pText = document.createElement('p');
          p.className = 'promo-cta';
          const a = document.createElement('a');
          a.textContent = cta1text;
          a.setAttribute('href', cta1url);
          a.setAttribute('title', title_name);
          a.setAttribute('aria-label', `Read more about ${title_name}`);
          a.className = `btn btn-colorbg ${flexColor}`;
          p.append(a);
          pText.append(cta1text);
          leftDiv.append(p);
          ctaElement = leftDiv;
          ctaTextElement=pText;
        }

        // --- Content element ---
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = contentHTML;
        const ctaGroup = [cta1text, cta1url];
       parentCells.push([
       flexVariation,
       flexColor,
       title_name,
       contentDiv,
       radio,
       [ctaTextElement,ctaElement]
     ])
     const parentBlock = WebImporter.DOMUtils.createTable(parentCells, document);
    flex.replaceWith(parentBlock);
  }

};

export default flexPromoText;
