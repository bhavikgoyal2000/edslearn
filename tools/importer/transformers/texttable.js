/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';

const texttable = (main, document, params) => {
  const tableEle = main.querySelector('.text-block table');
  if (tableEle) {
    const tableStripped = tableEle.classList.contains('table-striped');
    const colEle = tableEle.querySelectorAll('thead > tr > th');
    const rowsEle = tableEle.querySelectorAll('tbody > tr');

    // Build header row
    const headerRow = ['table-col-4'];
    colEle.forEach(col => {
      headerRow.push(col.textContent.trim());
    });

    // Build data rows
    const dataRows = [];
    rowsEle.forEach(row => {
      const cells = row.querySelectorAll('td');
      const rowArr = ['table-col-4'];
      cells.forEach(cell => {
        rowArr.push(cell.textContent.trim());
      });
      dataRows.push(rowArr);
    });

    // Build final cells array for markdown table
    const cells = [
      ['Table'],
      ['table-4-columns'],
      headerRow,
      ...dataRows
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    tableEle.replaceWith(block);
  }
};
export default texttable;
