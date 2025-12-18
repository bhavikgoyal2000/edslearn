import { GRAPHQL_ENDPOINT } from './constants.js';

async function fetchGraphQLData(queryName, path) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3Bpath%3D${encodeURIComponent(path)}?${cacheBuster}`;
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

async function fetchAnnouncementsGQL(queryName, date, visbleRequested, visibleApproved) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3Bdate%3D${date}%3BvisbleRequested%3D${visbleRequested}%3BvisibleApproved%3D${visibleApproved}?${cacheBuster}`;
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
async function fetchEventsGQL(queryName, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved) {
  try {
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3BeventStartDate%3D${eventStartDate}%3BeventEndDate%3D${eventEndDate}%3BvisibilityLevel%3D${visibilityLevel}%3BvisibilityApproved%3D${visibilityApproved}?${cacheBuster}`;
    console.log('GRAPHQL_ENDPOINT_PATH:', GRAPHQL_ENDPOINT_PATH);
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

export async function fetchCalendarAnnouncementData(name, date, visbleRequested, visibleApproved) {
  const { data, error } = await fetchAnnouncementsGQL(name, date, visbleRequested, visibleApproved);
  if (error) return { data: null };
  const result = data.data || null;
  return result;
}

// eslint-disable-next-line max-len
export async function fetchCalendarEventsData(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved) {
  // eslint-disable-next-line max-len
  const { data, error } = await fetchEventsGQL(name, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved);
  if (error) return { data: null };
  const result = data.data || null;
  return result;
}
