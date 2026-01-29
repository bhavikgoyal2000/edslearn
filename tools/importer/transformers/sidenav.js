const createNav = (main, document, params) => {
                    const { originalURL } = params;
  const sidenav = main.querySelector('#left-navigation');
    if (sidenav) {
        const cells = [
        ['Side Nav'],
      ];

      const block = WebImporter.DOMUtils.createTable(cells, document);
      sidenav.replaceWith(block);
    }
};
export default createNav;