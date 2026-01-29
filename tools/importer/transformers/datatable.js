/* global WebImporter */
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';
import { img } from './dom-builder.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

  const mkP = (text = '', fieldName) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(text);
    div.appendChild(p);
    }
    return div;
  };

const datatable = (main, document, params) => {
  
  const dataTableElements = main.querySelectorAll('.cs_control div[data-element="2018 DataTable From Spreadsheet"]');

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const dataTableElementsSection = mainBody.querySelectorAll('.cs_control div[data-element="2018 DataTable From Spreadsheet"]');

  if (dataTableElements.length > 0) {
    dataTableElements.forEach((dataTableEle, index) => {
      const table = dataTableEle.querySelector('table');
     const isGlobal = hasGlobalElement(dataTableElementsSection[index]) ? 'true' : 'false';
    const tableId = table ? table.getAttribute('id') : '';
    const title = table.querySelector('caption')?.textContent || '';
    const subTitle = table.querySelector('caption > small')?.textContent || '';
    const isSearching = dataTableEle.querySelector('input[type="search"]') ? 'true' : 'false';
    const isSorting = dataTableEle.querySelector('dataTable sorting') ? 'true' : 'false';
    const hasPagination = dataTableEle.querySelector('.dataTables_paginate') ? 'true' : 'false';

    const selectElement = dataTableEle.querySelector('dataTables_length > label > select');

    const values = selectElement ? Array.from(selectElement.options).map(option => option.value) : [];

    // Join array into a comma-separated string
    const valuesString = values && values.length > 0 ? values.join(',') : '';

    const firstIndex = values && values.length > 0 ? values[0] : '';

    const cells = [
      ['Data Table'],
      [isGlobal],
      [''],
      [''],
      [title],
      [subTitle],
      [''],
      [tableId],
      [''],
      [''],
      [isSearching],
      [isSorting],
      [hasPagination],
      [''],
      [valuesString],
      [firstIndex],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    dataTableEle.replaceWith(block);
    });
    
  }
};
  export default datatable;
