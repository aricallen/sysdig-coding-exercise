const token = '8aef9517-3070-4090-b55e-83296cee8cd1';
const endpoint = 'https://app-staging.sysdigcloud.com/api/events';
const tableId = 'events-table';
var table = document.getElementById(tableId);

const requestHeaders = {
  Authorization: `Bearer ${token}`
};

const config = { 
  method: 'GET',
  headers: requestHeaders
};

/**
 * only load polyfill if needed
 */
const hasArrayFrom = typeof Array.from === 'function';
if (!hasArrayFrom) {
  const script = document.createElement('SCRIPT');
  script.src = 'js/array.from.polyfill.js';
  document.head.appendChild(script);
}

/**
 * using the keys from an object in the GET response,
 * setup the headers for the table
 * @param  {JSON} response
 * @return {Promise}
 */
const plotHeaders = (response) => {
  const events = response.events;
  const sampleEventData = events[0];
  if (typeof sampleEventData !== 'object') {
    throw new Error('sampleEventData is expected to be of type object');
  }
  const dataKeys = Object.keys(sampleEventData);
  const header = document.createElement('THEAD');
  const headerRow = document.createElement('TR');
  headerRow.classList.add('header-row');
  dataKeys.forEach((dataPoint) => {
    const headerCell = document.createElement('TH');
    headerCell.innerText = dataPoint;
    headerRow.appendChild(headerCell);
  });
  header.appendChild(headerRow);
  table.appendChild(header);
  const returnPromise = new Promise((resolve) => resolve(response));
  return returnPromise;
};

/**
 * parse the response from API call and build out table
 * @param  {Object} response
 *         array of events with data points
 * @return {Promise}
 */
const plotEvents = (response) => {
  const events = response.events;
  if (events.constructor !== Array) {
    throw new Error('plotEvents expects parameter to be of type Array');
  }

  events.forEach((eventLog) => {
    if (typeof eventLog !== 'object') {
      throw new Error('event logs should be of type Object');
    }

    // each event has its own row
    const row = document.createElement('TR');
    row.classList.add('row');

    // get all the data points for each cell
    const eventDataPoints = Object.keys(eventLog);
    eventDataPoints.forEach((eventDataPointKey) => {
      let htmlToDisplay = '';
      const eventDataPoint = eventLog[eventDataPointKey];

      // edge case: for tags
      // check to see if there is another level
      // if there is, represent points as a comma separated list
      if (typeof eventDataPoint === 'object' && Object.keys(eventDataPoint).length !== 0) {
        let multiDataToDisplay = '';
        const multiDataKeys = Object.keys(eventDataPoint);
        multiDataKeys.forEach((multiDataKey) => {
          multiDataToDisplay += `${multiDataKey}: ${eventDataPoint[multiDataKey]}, `;
        });
        // remove trailing comma
        const removeTrailingCommaRegexp = /, $/;
        htmlToDisplay = multiDataToDisplay.replace(removeTrailingCommaRegexp, '');
      } else {
        // a non multi data point
        htmlToDisplay = eventDataPoint;
      }

      const cell = document.createElement('TD');
      cell.classList.add(eventDataPointKey);
      cell.innerHTML = htmlToDisplay;
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  const returnPromise = new Promise((resolve) => resolve(response));
  return returnPromise;
};

const formatTimestamps = () => {
  const timestampCells = Array.from(document.getElementsByClassName('timestamp'));
  timestampCells.forEach((timestampCell) => {
    const timestamp = parseInt(timestampCell.innerText.trim());
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    timestampCell.innerText = formatted;
  });
  // return another promise for potential additional chaining
  return Promise.resolve();
};

/**
 * only load polyfill if needed
 */
const isModernBrowser = typeof window.fetch === 'function';
if (!isModernBrowser) {
  const script = document.createElement('SCRIPT');
  script.src = 'js/window.fetch.polyfill.js';
  document.head.appendChild(script);
}

window.fetch(endpoint, config)
  .then((response) => response.json())
  .catch((error) => console.log('response.json() error:', error))
  .then(plotHeaders)
  .catch((error) => console.log('plotHeaders() error:', error))
  .then(plotEvents)
  .catch((error) => console.log('plotEvents() error:', error))
  .then(formatTimestamps);
