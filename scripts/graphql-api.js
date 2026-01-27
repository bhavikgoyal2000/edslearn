/* eslint-disable max-len */
import { GRAPHQL_ENDPOINT } from './constants.js';

async function fetchGraphQLData(queryName, path) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const username = 'admin';
    const password = 'admin';

    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3Bpath%3D${encodeURIComponent(path)}?${cacheBuster}`;
    const response = await fetch(GRAPHQL_ENDPOINT_PATH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      return { error: 'An error occurred during the request.', data: null };
    }

    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.', data: null };
  }
}

async function fetchCalendarGQL(queryName, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved, date, visbleRequested, visibleApproved) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const username = 'admin';
    const password = 'admin';

    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    const paramParts = [];

    const addParam = (key, value) => {
      if (value !== null && value !== undefined && value !== '') {
        paramParts.push(`${key}%3D${encodeURIComponent(value)}`);
      }
    };

    addParam('eventStart', eventStartDate);
    addParam('eventEnd', eventEndDate);
    addParam('visibilityLevel', visibilityLevel);
    addParam('visibilityApproved', visibilityApproved);
    addParam('date', date);
    addParam('visbleRequested', visbleRequested);
    addParam('visibleApproved', visibleApproved);

    const paramString = paramParts.length ? `%3B${paramParts.join('%3B')}` : '';

    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}${paramString}?${cacheBuster}`;

    const response = await fetch(GRAPHQL_ENDPOINT_PATH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      return { error: 'An error occurred during the request.', data: null };
    }

    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.', data: null };
  }
}

async function fetchEmergencyNotificationData(queryName, currentTime) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3Bnow%3D${currentTime}?${cacheBuster}`;
    const response = await fetch(GRAPHQL_ENDPOINT_PATH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      return { error: 'An error occurred during the request.', data: null };
    }

    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.', data: null };
  }
}

async function fetchEmergencyNotificationDataFromId(queryName, id) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3Bid%3D${id}?${cacheBuster}`;
    const response = await fetch(GRAPHQL_ENDPOINT_PATH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      return { error: 'An error occurred during the request.', data: null };
    }

    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.', data: null };
  }
}

export async function fetchTopNavData(path) {
  const { data, error } = await fetchGraphQLData('Top-Nav-GraphQL-Query', path);
  if (error) return { data: null };
  const result = data.data.topNavContentFragmentByPath?.item || null;
  return result;
}

export async function fetchFooterData(path) {
  const { data, error } = await fetchGraphQLData('Footer-GraphQL-Query', path);
  if (error) return { data: null };
  const result = data.data.footerContentFragmentByPath?.item || null;
  return result;
}

export async function fetchComponentData(name, path) {
  const { data, error } = await fetchGraphQLData(name, path);
  if (error) return { data: null };
  const result = data.data || null;
  return result;
}

export async function fetchCalendarData(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved, date, visbleRequested, visibleApproved) {
  const { data, error } = await fetchCalendarGQL(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved, date, visbleRequested, visibleApproved);
  if (error) return { data: null };
  const result = data.data || null;
  return result;
}

export async function fetchFilters(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved) {
  const { data, error } = await fetchCalendarGQL(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved);
  if (error) return { data: null };
  const result = data.data || null;
  return result;
}

// eslint-disable-next-line max-len
async function fetchEventsGQL(queryName, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3BeventStart%3D${eventStartDate}%3BeventEnd%3D${eventEndDate}%3BvisibilityLevel%3D${visibilityLevel}%3BvisibilityApproved%3D${visibilityApproved}?${cacheBuster}`;

    const response = await fetch(GRAPHQL_ENDPOINT_PATH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      return { error: 'An error occurred during the request.', data: null };
    }

    return { data };
  } catch (error) {
    return { error: 'An unexpected error occurred.', data: null };
  }
}

// eslint-disable-next-line max-len
export async function fetchCalendarEventsData(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved) {
  // eslint-disable-next-line max-len
  const { data, error } = await fetchEventsGQL(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved);
  if (error) return { data: null };
  const result = data.data || null;
  return result;
}

export async function fetchEmergencyNotifications(name, id) {
  if (id) {
    const { data, error } = await fetchEmergencyNotificationDataFromId(name, id);
    if (error) return { data: null };
    return data;
  }
  const currentTime = new Date().toISOString();
  const { data, error } = await fetchEmergencyNotificationData(name, currentTime);
  if (error) return { data: null };
  return data;
}
