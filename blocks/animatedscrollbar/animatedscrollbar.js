function isScriptLoaded(src) {
  return Array.from(document.scripts).some((script) => script.src === src);
}

function createPicture({ desktopSrc, mobileSrc, alt }) {
  const picture = document.createElement('picture');

  if (mobileSrc) {
    const sourceMobile = document.createElement('source');
    sourceMobile.srcset = mobileSrc;
    sourceMobile.media = '(max-width: 768px)';
    picture.appendChild(sourceMobile);
  }

  if (desktopSrc) {
    const sourceDesktop = document.createElement('source');
    sourceDesktop.srcset = desktopSrc;
    sourceDesktop.media = '(min-width: 769px)';
    picture.appendChild(sourceDesktop);
  }

  const img = document.createElement('img');
  img.src = desktopSrc || mobileSrc;
  img.alt = alt || '';
  picture.appendChild(img);

  return picture;
}

export default function decorate(block) {
  const slides = [];
  const ctas = [];
  const jQueryUrl = 'https://code.jquery.com/jquery-3.7.1.min.js';
  const scrollBoxUrl = `${window.hlx.codeBasePath}/blocks/animatedscrollbar/jquery.scrollbox.min.js`;

  Array.from(block.children).forEach((item) => {
    if (!item) return;

    // Images (expecting mobile + desktop via data attributes)
    item.querySelectorAll('img').forEach((img) => {
      slides.push({
        desktopSrc: img.dataset.desktop || img.getAttribute('src'),
        mobileSrc: img.dataset.mobile || null,
        alt: img.getAttribute('alt') || '',
      });
    });

    // CTA links
    item.querySelectorAll('a').forEach((a) => {
      ctas.push({
        href: a.getAttribute('href') || '#',
        text: a.textContent || '',
        target: a.getAttribute('target') || '',
      });
    });
  });

  function buildSpotlight() {
    block.innerHTML = '';

    const washSpotlight = document.createElement('div');
    washSpotlight.id = 'washspotlight';

    const fader = document.createElement('div');
    fader.id = 'fader';

    const slidesDiv = document.createElement('div');
    slidesDiv.id = 'slides';

    slides.forEach((slide) => {
      slidesDiv.appendChild(createPicture(slide));
    });

    const scrollingAnim = document.createElement('div');
    scrollingAnim.className = 'scrollinganim';

    const stationary = document.createElement('div');
    stationary.className = 'col-xs-6 stationary';
    stationary.innerHTML = '<div>Washington, DC is our</div>';

    const accent = document.createElement('div');
    accent.className = 'spotlight-accent';

    const scrollboxCol = document.createElement('div');
    scrollboxCol.className = 'col-xs-6';
    scrollboxCol.id = 'scrollbox';

    const ul = document.createElement('ul');

    // Duplicate CTA list (ColdFusion parity)
    [...ctas, ...ctas].forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      if (item.target) a.target = item.target;
      li.appendChild(a);
      ul.appendChild(li);
    });

    scrollboxCol.appendChild(ul);

    scrollingAnim.appendChild(stationary);
    scrollingAnim.appendChild(accent);
    scrollingAnim.appendChild(scrollboxCol);

    washSpotlight.appendChild(fader);
    washSpotlight.appendChild(slidesDiv);
    washSpotlight.appendChild(scrollingAnim);

    block.appendChild(washSpotlight);

    const $ = window.jQuery;

    // Initial fade state (matches CF startup)
    $('.spotlight-accent').css({ opacity: 0 });
    $('#fader').css({ opacity: 1 });

    if ($ && $.fn.scrollbox) {
      const $scrollbox = $('#scrollbox');

      $scrollbox.scrollbox({
        linear: true,
        autoPlay: true,
        step: 1,
        delay: 10,
        speed: 1,
        infiniteLoop: true,
        direction: 'vertical',
        listElement: 'ul',
        listItemElement: 'li',

        afterForward() {
          // Rotate slides like ColdFusion
          const $slides = $('#slides');
          $slides.append($slides.children('picture:first'));

          $('.spotlight-accent').animate({ opacity: 1 }, 250);
          $('#fader').animate({ opacity: 0 }, 750);
        },

        afterBackward() {
          $('.spotlight-accent').animate({ opacity: 0 }, 1000);
          $('#fader').animate({ opacity: 1 }, 1000);
        },
      });

      // Event bindings (CF parity)
      $scrollbox.on('resetClock', (e, d) => $scrollbox.scrollbox('resetClock', d));
      $scrollbox.on('forward', () => $scrollbox.scrollbox('forward'));
      $scrollbox.on('backward', () => $scrollbox.scrollbox('backward'));
      $scrollbox.on('pauseHover', () => $scrollbox.scrollbox('pauseHover'));
      $scrollbox.on('forwardHover', () => $scrollbox.scrollbox('forwardHover'));
      $scrollbox.on('speedUp', (e, s) => $scrollbox.scrollbox('speedUp', s));
      $scrollbox.on('speedDown', (e, s) => $scrollbox.scrollbox('speedDown', s));
      $scrollbox.on('updateConfig', (e, o) => $scrollbox.scrollbox('updateConfig', o));
    }
  }

  function loadScrollBox() {
    if (!isScriptLoaded(scrollBoxUrl)) {
      const sb = document.createElement('script');
      sb.src = scrollBoxUrl;
      sb.type = 'text/javascript';
      document.head.appendChild(sb);
      sb.onload = buildSpotlight;
    } else {
      buildSpotlight();
    }
  }

  if (typeof window.jQuery === 'undefined') {
    if (!isScriptLoaded(jQueryUrl)) {
      const jq = document.createElement('script');
      jq.src = jQueryUrl;
      jq.type = 'text/javascript';
      document.head.appendChild(jq);
      jq.onload = loadScrollBox;
    }
  } else {
    loadScrollBox();
  }
}
