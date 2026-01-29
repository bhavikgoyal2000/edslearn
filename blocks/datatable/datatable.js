import { SERVER_URL } from '../../scripts/constants.js';

// Utility to load external scripts only once
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src='${src}']`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Utility to load external CSS only once
function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href='${href}']`)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

// Function to determine file type
function getFileType(url) {
  // Check for .csv, .xlsx, .xls at the end of the path
  const pathMatch = url.match(/\.([a-z0-9]+)(\?|$)/i);
  if (pathMatch) {
    const extension = pathMatch[1].toLowerCase();
    if (extension === 'csv') return 'csv';
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
  }
  // Check for format=csv or format=xlsx in query string (for Google Sheets export)
  const formatMatch = url.match(/[?&]format=(csv|xlsx|xls)/i);
  if (formatMatch) {
    if (formatMatch[1] === 'csv') return 'csv';
    if (['xlsx', 'xls'].includes(formatMatch[1])) return 'excel';
  }
  return 'unknown';
}

// Function to parse CSV text
function parseCSV(text) {
  return text
    .trim()
    .split('\n')
    .map((line) => line.split(',').map((cell) => cell.trim()));
}

// Function to parse Excel file
async function parseExcel(arrayBuffer) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
  const [firstSheetName] = workbook.SheetNames; // fixed prefer-destructuring
  const worksheet = workbook.Sheets[firstSheetName];
  let jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  jsonData = jsonData.filter(
    (row) => row && row.some((cell) => cell !== undefined && cell !== null && cell.toString().trim() !== ''),
  );
  if (jsonData.length === 0) throw new Error('No valid data found in Excel file');
  const maxCols = Math.max(...jsonData.map((row) => row.length));
  jsonData = jsonData.map((row) => {
    const normalizedRow = [...row];
    while (normalizedRow.length < maxCols) normalizedRow.push('');
    return normalizedRow;
  });
  return jsonData;
}

// Function to fetch and parse file based on type
async function fetchAndParseFile(inputUrl) {
  let url = inputUrl;
  // Check for Google Sheets link and convert to CSV export
  let sheetsMatch = inputUrl.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/.*[?&]gid=(\d+)/);
  if (sheetsMatch) {
    const fileId = sheetsMatch[1];
    const gid = sheetsMatch[2];
    url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&id=${fileId}&gid=${gid}`;
  } else {
    // Check for Google Sheets link without gid (default to gid=0)
    sheetsMatch = inputUrl.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetsMatch) {
      const fileId = sheetsMatch[1];
      url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&id=${fileId}&gid=0`;
    }
  }

  const fileType = getFileType(url);
  if (fileType === 'csv') {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSV(text);
  }
  if (fileType === 'excel') {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return parseExcel(arrayBuffer);
  }
  throw new Error('Unsupported file type. Please use CSV or Excel files (.csv, .xlsx, .xls)');
}

// Converts an EaData XML document into a JS object array
function parseEaData(xmlDoc) {
  const rows = xmlDoc.querySelectorAll('EaRow');
  const result = [];
  rows.forEach((row) => {
    const obj = {};
    row.querySelectorAll('EaColumn').forEach((col) => {
      const name = col.getAttribute('name');
      let value = col.textContent?.trim() || '';
      const type = col.getAttribute('type');
      if (type === 'xs:int') value = parseInt(value, 10);
      else if (type === 'xs:date') [value] = [new Date(value).toISOString().split('T')[0]]; // fixed prefer-destructuring
      const txt = document.createElement('textarea');
      txt.innerHTML = value;
      value = txt.value;
      obj[name] = value;
    });
    result.push(obj);
  });
  return result;
}

// Fetches XML from a URL and converts it into a JS object
async function fetchAndParseEaData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const xmlString = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    return parseEaData(xmlDoc);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching or parsing XML:', error);
    return [];
  }
}

// Helper: get header labels
function getHeaderLabels(colHeaders, rows) {
  if (colHeaders?.textContent?.trim()) {
    return colHeaders.textContent.split(',').map((h) => h.trim());
  }
  return rows?.[0] ? [...rows[0]] : [];
}

// Helper: get columns to keep (non-empty)
function getKeepCol(rows) {
  const colCount = rows[0] ? rows[0].length : 0;
  const keepCol = [];
  for (let c = 0; c < colCount; c += 1) {
    const header = rows[0]?.[c]?.toString().trim();
    const hasData = rows.slice(1).some((row) => {
      if (!row || row.length <= c) return false;
      const cell = row[c];
      return cell !== undefined && cell !== null && cell.toString().trim() !== '';
    });
    if (header || hasData) keepCol.push(c);
  }
  return keepCol;
}

// Helper: build table DOM
function buildTable({
  headerLabels,
  rows,
  columnMap,
  isEaData,
  tableId,
  title,
  subtitle,
}) {
  const table = document.createElement('table');
  table.id = tableId.textContent.trim();
  table.classList.add('table-striped', 'table-hover');
  const tableCaption = document.createElement('caption');
  tableCaption.textContent = title.textContent.trim();
  if (subtitle?.textContent.trim()) {
    tableCaption.innerHTML += ` <small>${subtitle.textContent.trim()}</small>`;
  }
  table.appendChild(tableCaption);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerLabels.forEach((label) => {
    if (label?.toString().trim()) {
      const th = document.createElement('th');
      th.textContent = label;
      headerRow.appendChild(th);
    }
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((dataRow) => {
    if (isEaData) {
      const match = dataRow.PAGE_NAME?.match(/\[\[(\d+)\]\]/);
      if (!match) return;
      const [pageNumber] = match; // fixed prefer-destructuring
      dataRow.pageNumber = pageNumber.replace('[[', '').replace(']]', '');
    }
    const tr = document.createElement('tr');
    headerLabels.forEach((header, idx) => {
      const td = document.createElement('td');
      if (isEaData) {
        const key = columnMap[header];
        if (key === 'PAGE_TITLE') {
          const link = document.createElement('a');
          link.href = `https://together.american.edu/page/${dataRow.pageNumber}/action/1` || '#'; // fixed operator-linebreak
          link.textContent = dataRow[key] ?? '';
          td.appendChild(link);
        } else if (header === 'DATE' || header === 'Date') {
          // If value is "2025-11-01,17:00:00" or "2025-11-01,11:00 AM"
          const rawDate = `${dataRow.EVENT_START_DATE},${dataRow.EVENT_START_TIME}`;
          if (rawDate) {
            const [datePart, timePart] = rawDate.split(',').map((v) => v.trim());
            // Split variable declarations for lint compliance
            let hour;
            let minute;
            let ampm;
            let displayTime = '';
            const [year, month, day] = datePart.split('-').map(Number); // use const for destructured values

            // Handle both "HH:MM AM/PM" and "HH:MM:SS" formats
            const ampmMatch = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            const secMatch = timePart.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);

            if (ampmMatch) {
              hour = parseInt(ampmMatch[1], 10);
              minute = parseInt(ampmMatch[2], 10);
              ampm = ampmMatch[3].toUpperCase();
              if (ampm === 'PM' && hour < 12) hour += 12;
              if (ampm === 'AM' && hour === 12) hour = 0;
            } else if (secMatch) {
              hour = parseInt(secMatch[1], 10);
              minute = parseInt(secMatch[2], 10);
              // Convert 24-hour to 12-hour and set AM/PM
              ampm = hour >= 12 ? 'PM' : 'AM';
              displayTime = `${((hour % 12) || 12)}:${minute.toString().padStart(2, '0')} ${ampm}`;
            } else {
              hour = 0;
              minute = 0;
              ampm = 'AM';
              displayTime = '12:00 AM';
            }

            // Create date object in local time with correct hour/minute
            const dateObj = new Date(year, month - 1, day, hour, minute);
            const options = {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            };
            // Compose output manually to avoid "at" and ensure correct time format
            const dateStr = dateObj.toLocaleString('en-US', options);
            if (!displayTime) {
              // If AM/PM format, use locale string for time
              const timeStr = dateObj.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              td.textContent = `${dateStr} ${timeStr}`;
            } else {
              td.textContent = `${dateStr} ${displayTime}`;
            }
          } else {
            td.textContent = '';
          }
        } else if (key === 'EVENT_TAGS') {
          td.textContent = dataRow[key] ? dataRow[key].replace(/~/g, ', ') : '';
        } else if (key === 'CITY, REGION') {
          const { CITY: city = '', REGION: region = '' } = dataRow;
          td.textContent = city && region ? `${city}, ${region}` : city || region || '';
        } else {
          td.textContent = dataRow[key] ?? '';
        }
      } else {
        let cell = dataRow?.[idx] ?? '';
        if (cell) {
          cell = cell.toString().trim();
          if (
            (cell.startsWith('"') && cell.endsWith('"'))
            || (cell.startsWith("'") && cell.endsWith("'"))
          ) {
            const inner = cell.slice(1, -1).trim();
            if (/<a\s+href=/.test(inner)) cell = inner;
          }
          td.innerHTML = /<a\s+href=/.test(cell) ? cell : cell;
        } else {
          td.textContent = '';
        }
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

// Helper: get DataTable options
function getTableOptions(
  headerCount,
  availablePageCounts,
  initialPageCount,
  allowSearch,
  allowSort,
  allowPagination,
  scrollRows,
) {
  const pageCounts = (availablePageCounts.textContent.trim() || '10,25,50,100')
    .split(',')
    .map((count) => parseInt(count.trim(), 10));
  const options = {
    pageLength: initialPageCount.textContent
      ? parseInt(initialPageCount.textContent.trim(), 10)
      : 10,
    searching: allowSearch.textContent.trim() === 'allowSearching',
    ordering: allowSort.textContent.trim() === 'allowSorting',
    paging: allowPagination.textContent.trim() === 'allowPagination',
    lengthMenu: pageCounts,
    stateSave: true,
  };
  if (headerCount > 6) {
    options.fixedHeader = true;
    options.scrollX = true;
  }
  if (scrollRows?.textContent.trim()) {
    options.scrollY = parseInt(scrollRows.textContent.trim(), 10) * 43;
    options.scrollCollapse = true;
  }
  return options;
}

// Helper: initialize DataTable
async function initDataTable(
  table,
  headerCount,
  tableId,
  availablePageCounts,
  initialPageCount,
  allowSearch,
  allowSort,
  allowPagination,
  scrollRows,
  block,
) {
  await loadCSS('https://cdn.datatables.net/v/dt/dt-1.10.15/datatables.min.css');
  await loadScript('https://code.jquery.com/jquery-3.7.1.min.js');
  await loadScript('https://cdn.datatables.net/v/dt/dt-1.10.15/datatables.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js');
  await loadScript('https://cdn.datatables.net/plug-ins/1.13.7/sorting/datetime-moment.js');
  block.textContent = '';
  block.appendChild(table);
  const options = getTableOptions(
    headerCount,
    availablePageCounts,
    initialPageCount,
    allowSearch,
    allowSort,
    allowPagination,
    scrollRows,
  );
  const dataTable = window.jQuery(`#${tableId.textContent.trim()}`).DataTable(options);
  dataTable.columns.adjust().draw(false);
}

export default async function decorate(block) {
  const children = Array.from(block.children).slice(1);
  const [
    hasEngagingNetworkSelected,
    engagingNetworkURL,
    csvPath,
    title,
    subtitle,
    colHeaders,
    tableId,
    // eslint-disable-next-line comma-style
    ,
    allowSearch,
    allowSort,
    allowPagination,
    scrollRows,
    availablePageCounts,
    initialPageCount,
  ] = children;

  const rawPath = csvPath.textContent.trim();
  let fileURL = '';
  let hasEngagingNetworkSelectedFlag = false;

  if (hasEngagingNetworkSelected.textContent.trim() === 'true') {
    fileURL = engagingNetworkURL.textContent.trim();
    hasEngagingNetworkSelectedFlag = true;
  } else if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    fileURL = rawPath;
  } else if (rawPath.startsWith('/')) {
    fileURL = SERVER_URL + rawPath;
  } else {
    fileURL = `${SERVER_URL}/${rawPath}`;
  }

  const loader = document.createElement('div');
  loader.className = 'datatable-loader';
  loader.innerHTML = '<span>Loading...</span>';
  block.textContent = '';
  block.appendChild(loader);

  try {
    if (hasEngagingNetworkSelectedFlag) {
      const eaData = await fetchAndParseEaData(fileURL);
      const columnMap = {
        Date: 'EVENT_START_DATE',
        'Event Name': 'PAGE_TITLE',
        Description: 'EVENT_DESCRIPTION',
        Location: 'CITY, REGION',
        Host: 'EVENT_ORGANIZER',
        Tags: 'EVENT_TAGS',
      };
      const headerLabels = getHeaderLabels(colHeaders, eaData);
      const table = buildTable({
        headerLabels,
        rows: eaData,
        columnMap,
        isEaData: true,
        tableId,
        title,
        subtitle,
      });
      await initDataTable(
        table,
        headerLabels.length,
        tableId,
        availablePageCounts,
        initialPageCount,
        allowSearch,
        allowSort,
        allowPagination,
        scrollRows,
        block,
      );
    } else {
      const rows = await fetchAndParseFile(fileURL);
      if (!rows.length) throw new Error('No data found in file');
      const keepCol = getKeepCol(rows);
      const headerLabels = getHeaderLabels(colHeaders, rows)
        .filter((_, idx) => keepCol.includes(idx));
      const filteredRows = rows.slice(1).map((row) => keepCol.map((c) => row[c]));
      const table = buildTable({
        headerLabels,
        rows: filteredRows,
        columnMap: {},
        isEaData: false,
        tableId,
        title,
        subtitle,
      });
      await initDataTable(
        table,
        keepCol.length,
        tableId,
        availablePageCounts,
        initialPageCount,
        allowSearch,
        allowSort,
        allowPagination,
        scrollRows,
        block,
      );
    }
  } catch (error) {
    block.textContent = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'datatable-error';
    errorDiv.innerHTML = `<p>Error loading data: ${error.message}</p>`;
    block.appendChild(errorDiv);
  }
}
