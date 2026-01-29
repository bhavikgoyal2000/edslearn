// import utility for highlightStrip
const profilelisting = (main, document) => {
  const profileListingElements = main.querySelectorAll('.cs_control .profile-listing');

  if (profileListingElements) {
    profileListingElements.forEach(profileListingEle => {
    const cells = [
      ['Profile Listing'],
      ['']
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    profileListingEle.replaceWith(block);
  });
}
};

export default profilelisting;
