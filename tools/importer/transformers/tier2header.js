import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { img } from './dom-builder.js';
import { removeCfm } from '../utils/link-utils.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const mkP = (text = '', fieldName, className) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    if (className) {
      p.className = className;
    }
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(text);
    div.appendChild(p);
    }
    return div;
  };

// Build a responsive <picture> similar to the provided DOM example
const buildResponsivePicture = (document, baseSrc, alt) => {
  const picture = document.createElement('picture');

  // webp (large)
  const s1 = document.createElement('source');
  s1.setAttribute('type', 'image/webp');
  s1.setAttribute('srcset', `${baseSrc}?width=2000&format=webply&optimize=medium`);
  s1.setAttribute('media', '(min-width: 600px)');
  picture.appendChild(s1);

  // webp (small)
  const s2 = document.createElement('source');
  s2.setAttribute('type', 'image/webp');
  s2.setAttribute('srcset', `${baseSrc}?width=750&format=webply&optimize=medium`);
  picture.appendChild(s2);

  // jpeg (large)
  const s3 = document.createElement('source');
  s3.setAttribute('type', 'image/jpeg');
  s3.setAttribute('srcset', `${baseSrc}?width=2000&format=jpg&optimize=medium`);
  s3.setAttribute('media', '(min-width: 600px)');
  picture.appendChild(s3);

  // img fallback
  picture.appendChild(
    img({
      src: `${baseSrc}?width=750&format=jpg&optimize=medium`,
      loading: 'lazy',
      alt,
      width: '1310',
      height: '440',
    }),
  );

  return picture;
};

// Wrap a row's content in an inner <div> to match the requested DOM structure
const wrapRow = (document, children = [], fieldName) => {
  const inner = document.createElement('div');
  children.forEach((child) => {
    // Coerce non-nodes (e.g., strings) into <p> nodes to avoid appendChild errors
    let node = child;
    if (!child || typeof child !== 'object' || !('nodeType' in child)) {
      const p = document.createElement('p');
      p.textContent = child != null ? String(child) : '';
      node = p;
    }
    inner.innerHTML = `<!-- field:${fieldName} -->`;
    inner.appendChild(node);
  });
  return inner;
};

const tier2header = (main, document, params) => {
  const { originalURL } = params;

  const header = main.querySelector('header.tier-2');
  if (!header) return;

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const tier2headerSection = mainBody.querySelector('header.tier-2');
  const isGlobal = hasGlobalElement(tier2headerSection) ? 'true' : 'false';
  // Cells represent rows of the Franklin block table
  const cells = [];

  // Block name row (lowercase to match data-block-name="tier2header")
  cells.push(['Tier2Header']);
  cells.push([isGlobal]);
  //cells.push([wrapRow(document)]);
  // Row 1: Empty row <div><div></div></div>
  //cells.push([wrapRow(document)]);
  //cells.push([wrapRow(document)]);

  // --- TITLE ---

  const schoolTitle = header.querySelector('.child.you-are-here');
  if (schoolTitle) {
    const deptTitle = header.querySelector('.schoolDeptTitle');
    if (!deptTitle) {
    const p = document.createElement('p');
    p.textContent = schoolTitle.textContent.trim();
    // Row: <div><div><p>School of Education</p></div></div>
    cells.push([wrapRow(document, [p],'title')]);
    cells.push([wrapRow(document)]);
    } else {
      const p = document.createElement('p');
    p.textContent = deptTitle.textContent.trim();
    // Row: <div><div><p>School of Education</p></div></div>
    cells.push([wrapRow(document)]);
    cells.push([wrapRow(document, [p],'schoolName')]);
    }
    //cells.push([wrapRow(document)]);
  } else {

  const deptTitle = header.querySelector('.schoolDeptTitle');
  if (deptTitle) {
    const p = document.createElement('p');
    p.textContent = deptTitle.textContent.trim();
    // Row: <div><div><p>School of Education</p></div></div>
    cells.push([wrapRow(document)]);
    cells.push([wrapRow(document, [p],'schoolName')]);
    //cells.push([wrapRow(document)]);
  }
}


  // --- IMAGE ---
  let imgSrc = null;
  let imgAlt = 'Header image';

  const pictureSource = header.querySelector('picture > source');
  if (pictureSource?.srcset) {
    imgSrc = cleanUpSrcUrl(pictureSource.srcset, originalURL);
    imgAlt = pictureSource.getAttribute('data-alt') || imgAlt;
  }

  if (!imgSrc) {
    const inlineImg = header.querySelector('img.visible-xs, img.visible-sm');
    if (inlineImg) {
      imgSrc = cleanUpSrcUrl(inlineImg.src, originalURL);
      imgAlt = inlineImg.alt || imgAlt;
    }
  }

  if (!imgSrc) {
    const subHeader = header.querySelector('.sub-header');
    if (subHeader?.style?.backgroundImage) {
      const bgImage = subHeader.style.backgroundImage;
      imgSrc = cleanUpSrcUrl(
        bgImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''),
        originalURL
      );
    }
  }

  let imageRef = null;
  if (imgSrc) {
    imageRef = imgSrc;
    const pictureEl =  buildImageElement({ imgSrc, imgAlt: imgAlt }); //buildResponsivePicture(document, imgSrc, imgAlt);
    // Row: <div><div><picture>...</picture></div></div>
    cells.push([wrapRow(document, [pictureEl],'assetTextDetails_bgImage')]);
  }
  let cta1Text;
  let cta1Link;
  let cta2Text;
  let cta2Link;
  let cta3Text;
  let cta3Link;

  let hasSubCTA1;
  let hasSubCTA2;
  let hasSubCTA3;

  let subCTA1Heading;
  let subCTA2Heading;
  let subCTA3Heading;

  let cta1_subCta1Link;
  let cta1_subCta2Link;
   let cta2_subCta1Link;
  let cta2_subCta2Link;
   let cta3_subCta1Link;
  let cta3_subCta2Link;


  // --- Top-level CTAs (buttons) row ---
  const ctaLis = header.querySelectorAll('.tier-2-cta > li');
  if (ctaLis.length > 0) {
    const buttonPs = [];
    ctaLis.forEach((li, index) => {
      const mainLink = li.querySelector(':scope > a');

      const childLinks = li.querySelectorAll('.cta-content a');
    const hasChildren = childLinks.length > 0;

    // Boolean row
    const boolP = document.createElement('p');
    boolP.textContent = hasChildren ? 'true' : 'false';
    

      if (mainLink && mainLink.textContent.trim()) {

        const pLabel = document.createElement('p');
        pLabel.textContent = mainLink.textContent.trim()

        const p = document.createElement('p');
        p.classList.add('button-container');
        const a = document.createElement('a');
        a.href = removeCfm(mainLink.getAttribute('href')) || '#';
        a.title = mainLink.getAttribute('title') || mainLink.textContent.trim();
        a.classList.add('button');
        a.textContent = mainLink.textContent.trim();
        p.appendChild(a);

        if (index === 0) {
          cta1Text = pLabel;
          cta1Link = mainLink;
          hasSubCTA1 = boolP;
        } else if (index === 1) {
          cta2Text = pLabel;
          cta2Link = mainLink;
          hasSubCTA2 = boolP;
        } else if (index === 2) {
          cta3Text = pLabel;
          cta3Link = mainLink;
          hasSubCTA3 = boolP;
        }

        //buttonPs.push(p);
      }
      const firstCtaContent = li.querySelector('.cta-content');

      if (firstCtaContent) {
      const h2 = firstCtaContent.querySelector('h2');
     const links = firstCtaContent.querySelectorAll('a');
      
      if (index == 0) {
        subCTA1Heading = h2 ? h2.textContent.trim() : '';
        cta1_subCta1Link = links[0] ? links[0] : '';
        cta1_subCta2Link = links[1] ? links[1] : '';
      } else if (index == 1) {
        subCTA2Heading = h2 ? h2.textContent.trim() : '';
        cta2_subCta1Link = links[0] ? links[0] : '';
        cta2_subCta2Link = links[1] ? links[1] : '';
      } else {
        subCTA3Heading = h2 ? h2.textContent.trim() : '';
        cta3_subCta1Link = links[0] ? links[0] : '';
        cta3_subCta2Link = links[1] ? links[1] : '';
      }
    }

    });
    
  }


  //cells.push([wrapRow(document)]); // tab2
  let ctaDiv = document.createElement('div');
  let flag = false;
  if (cta1Link) {
    //cells.push([cta1Link]);
    ctaDiv.append(mkP(cta1Link,'subnav_cta1','button-container'));
    flag = true;
  } 
  
  if (cta2Link) {
    ctaDiv.append(mkP(cta2Link,'subnav_cta2','button-container'));
    flag = true;
  } 
  
  if (cta3Link) {
    ctaDiv.append(mkP(cta3Link,'subnav_cta3','button-container'));
    flag = true;
  }

  if (flag) {
    cells.push([ctaDiv]);
  } else {
    cells.push([wrapRow(document)]);
  }


  let subCtaDiv1 = document.createElement('div');
  let subCtaDiv2 = document.createElement('div');
  let subCtaDiv3 = document.createElement('div');
  let subCTA1flag = false;
  let subCTA2flag = false;
  let subCTA3flag = false;
  if (subCTA1Heading) {
    const div = document.createElement('div');
    const p = document.createElement('p');
    div.append(p);
    subCtaDiv1.append(div);
    subCtaDiv1.append(mkP(subCTA1Heading,'cta1_SubCtaDetailsHeading'));
    subCtaDiv1.append(mkP(cta1_subCta1Link.textContent,'cta1_SubCta1DetailsTextValue'));
    subCtaDiv1.append(mkP(cta1_subCta1Link,'cta1_SubCtaDetailsLink','button-container'));
    subCtaDiv1.append(mkP(cta1_subCta2Link.textContent,'cta1_SubCta2DetailsTextValue'));
    subCtaDiv1.append(mkP(cta1_subCta2Link,'cta1_SubCta2DetailsLink','button-container'));
    subCTA1flag = true;
  }
  
  if (subCTA2Heading) {
    const p = document.createElement('p');
    subCtaDiv2.append(mkP('','cta2SubCtaDetails'));
    subCtaDiv2.append(mkP(subCTA2Heading,'cta2_SubCtaDetailsHeading'));
    subCtaDiv2.append(mkP(cta2_subCta1Link.textContent,'cta2_SubCta1DetailsTextValue'));
    subCtaDiv2.append(mkP(cta2_subCta1Link,'cta2_SubCta1DetailsLink','button-container'));
    subCtaDiv2.append(mkP(cta2_subCta2Link.textContent,'cta2_SubCta2DetailsTextValue'));
    subCtaDiv2.append(mkP(cta2_subCta2Link,'cta2_SubCta2DetailsLink','button-container'));
    subCTA2flag = true;
  } 
  
  if (subCTA3Heading) {
    const div = document.createElement('div');
    const p = document.createElement('p');
    div.append(p);
    subCtaDiv3.append(div);
    subCtaDiv3.append(mkP('','cta3_SubCtaDetailsHeading'));
    subCtaDiv3.append(mkP(cta3_subCta1Link.textContent,'cta3_SubCta1DetailsTextValue'));
    subCtaDiv3.append(mkP(cta3_subCta1Link,'cta3_SubCta1DetailsLink','button-container'));
    subCtaDiv3.append(mkP(cta3_subCta2Link.textContent,'cta3_SubCta2DetailsTextValue'));
    subCtaDiv3.append(mkP(cta3_subCta2Link,'cta3_SubCta2DetailsLink','button-container'));
    subCTA3flag = true;
  }

  cells.push([wrapRow(document, [hasSubCTA1],'hasSubCTA1')]);
  if (subCTA1flag) {
    cells.push([subCtaDiv1]); // CTA1SubCTA Details
  } else {
    cells.push([wrapRow(document)]);
  }
  
  //cells.push([wrapRow(document)]); // tab3
  cells.push([wrapRow(document, [hasSubCTA2],'hasSubCTA2')]);
  if (subCTA2flag) {
    cells.push([subCtaDiv2]); // CTA2SubCTA Details
  } else {
    cells.push([wrapRow(document)]);
  }
  //cells.push([wrapRow(document)]); // tab4
  cells.push([wrapRow(document, [hasSubCTA3],'hasSubCTA3')]);
  
  if (subCTA3flag) {
    cells.push([subCtaDiv3]); // CTA3SubCTA Details
  } else {
    cells.push([wrapRow(document)]);
  }
  
  const block = WebImporter.DOMUtils.createTable(cells, document);
  header.replaceWith(block);
};

export default tier2header;
