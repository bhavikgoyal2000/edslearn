import createDataLayerEvent from '../../scripts/analytics-util.js';

function extractSocialLinks(containerSelector) {
  const children = Array.from(containerSelector.children);
  const firstElement = children.shift();
  const ownerName = firstElement
    ? firstElement.querySelector('p')?.textContent.trim() || null
    : null;

  const socialLinks = children.map((child) => {
    const ps = child.querySelectorAll('p');
    if (ps.length === 0) {
      return null;
    }
    if (ps.length === 1) {
      return ps[0].textContent.trim();
    }
    return Array.from(ps).map((p) => p.textContent.trim());
  });
  return { ownerName, socialLinks };
}

function createLabelMap(socialLinks) {
  return {
    Facebook: socialLinks[0],
    Twitter: socialLinks[1],
    Youtube: socialLinks[2],
    Instagram: socialLinks[3],
    Linkedin: socialLinks[4],
    Pinterest: socialLinks[5],
    Wordpress: socialLinks[6],
    Tumblr: socialLinks[7],
    Flickr: socialLinks[8],
    Foursquare: socialLinks[9],
    Bluesky: socialLinks[10],
  };
}

function createIconClassMap() {
  return {
    Facebook: 'fa-facebook-f',
    Twitter: 'fa-x-twitter',
    Youtube: 'fa-youtube',
    Linkedin: 'fa-linkedin-in',
    Instagram: 'fa-instagram',
    Pinterest: 'fa-pinterest',
    Wordpress: 'fa-wordpress',
    Tumblr: 'fa-tumblr',
    Flickr: 'fa-flickr',
    Foursquare: 'fa-foursquare',
    Bluesky: 'fa-bluesky',
  };
}

function extractLinkDetails(platform, link) {
  let href = link;
  let blogName = '';
  if (platform.toLowerCase() === 'wordpress' && Array.isArray(link)) {
    [href, blogName = ''] = link;
  }
  return { href, blogName };
}

function createAnchorElement(href, platform, iconClassMap, ownerName, blogName) {
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const icon = document.createElement('i');
  icon.className = `fa-brands ${iconClassMap[platform]} school-primary`;
  icon.setAttribute('aria-hidden', 'true');

  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = platform.toLowerCase() === 'wordpress'
    ? `${(blogName || 'Blog')} on ${platform}`
    : `${ownerName} on ${platform}`;

  a.appendChild(icon);
  a.appendChild(span);

  return a;
}

function populateSocialLinks(labelMap, iconClassMap, ul, ownerName) {
  Object.entries(labelMap).forEach(([platform, link]) => {
    if (link) {
      const { href, blogName } = extractLinkDetails(platform, link);
      if (href && typeof href === 'string' && href.trim() !== '') {
        const li = document.createElement('li');
        const a = createAnchorElement(href, platform, iconClassMap, ownerName, blogName);

        createDataLayerEvent('click', 'socialClick', () => ({
          network: platform,
          linkURL: a.href,
          placement: 'main | sidebar',
          componentName: 'Social Links',
          componentId: 'social-links',
        }), a);

        li.appendChild(a);
        ul.appendChild(li);
      }
    }
  });
}

function createSocialLinksDOM(result) {
  if (!result || !result.socialLinks || result.socialLinks.length === 0) {
    return null;
  }

  const labelMap = createLabelMap(result.socialLinks);
  const iconClassMap = createIconClassMap();

  const container = document.createElement('div');
  const aside = document.createElement('aside');
  aside.className = 'school-social-blogs clearfix';

  const ul = document.createElement('ul');
  populateSocialLinks(labelMap, iconClassMap, ul, result.ownerName);

  aside.appendChild(ul);
  container.appendChild(aside);

  return container;
}

export default function decorate(block) {
  const slicedBlock = {
    children: Array.from(block.children).slice(1),
  };
  const result = extractSocialLinks(slicedBlock);
  const socialLinksDOM = createSocialLinksDOM(result);
  block.textContent = '';
  block.append(socialLinksDOM);
}
