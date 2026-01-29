/* global WebImporter */
const socialLinks = (main, document) => {
  const socialAsides = main.querySelectorAll('.school-social-blogs');
  if (!socialAsides.length) return;

  for (const aside of socialAsides) {
    // --- Owner name ---
    const ownerName = aside.querySelector('.sr-only')?.textContent
      ?.replace(/ on .*/, '')
      .trim() || '';

    // --- Collect links in model order ---
    const links = {
      facebookLink: '',
      twitterLink: '',
      youtubeLink: '',
      instagramLink: '',
      linkedinLink: '',
      pinterestLink: '',
      'social-links_wordpressLink': '',
      'social-links_blogName': '',
      tumblrLink: '',
      flickrLink: '',
      foursquareLink: '',
      blueskyLink: ''
    };

    aside.querySelectorAll('li a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const label = a.querySelector('.sr-only')?.textContent.trim() || '';
      const lower = label.toLowerCase();

      if (lower.includes('facebook')) links.facebookLink = href;
      else if (lower.includes('twitter')) links.twitterLink = href;
      else if (lower.includes('youtube')) links.youtubeLink = href;
      else if (lower.includes('instagram')) links.instagramLink = href;
      else if (lower.includes('linkedin')) links.linkedinLink = href;
      else if (lower.includes('pinterest')) links.pinterestLink = href;
      else if (lower.includes('wordpress') || a.querySelector('.fa-wordpress-simple')) {
        links['social-links_wordpressLink'] = href;
        links['social-links_blogName'] = label; // e.g. "My Blog"
      }
      else if (lower.includes('tumblr')) links.tumblrLink = href;
      else if (lower.includes('flickr')) links.flickrLink = href;
      else if (lower.includes('foursquare')) links.foursquareLink = href;
      else if (lower.includes('bluesky')) links.blueskyLink = href;
    });

    // --- Build vertical table ---
    const tableCells = [['Social Links']]; // first row = block name
    tableCells.push([ownerName]);           // 2nd row = owner name

    [
      links.facebookLink,
      links.twitterLink,
      links.youtubeLink,
      links.instagramLink,
      links.linkedinLink,
      links.pinterestLink,
      links['social-links_wordpressLink'],
      links['social-links_blogName'],
      links.tumblrLink,
      links.flickrLink,
      links.foursquareLink,
      links.blueskyLink
    ].forEach(val => tableCells.push([val || '']));

    const block = WebImporter.DOMUtils.createTable(tableCells, document);
    aside.replaceWith(block);
  }
};

export default socialLinks;
