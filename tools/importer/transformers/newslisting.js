// import utility for highlightStrip
const newslisting = (main, document) => {
  const newsListingElements = main.querySelectorAll('.cs_control section[data-element="2020 News"]');

  if (newsListingElements) {
    newsListingElements.forEach(newsListingEle => {
    const cells = [
      ['News Listing'],
      [''],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    newsListingEle.replaceWith(block);
 });
}
};

export default newslisting;
