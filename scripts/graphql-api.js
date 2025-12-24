/* eslint-disable max-len */
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

async function fetchCalendarGQL(queryName, eventStartDate, eventEndDate, visibilityLevel, visibilityApproved, date, visbleRequested, visibleApproved) {
  try {
    const username = 'admin';
    const password = 'admin'; // example only

    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    const cacheBuster = `_cb=${Date.now()}`;
    const GRAPHQL_ENDPOINT_PATH = `${GRAPHQL_ENDPOINT}/${queryName}%3BeventStart%3D${eventStartDate}%3BeventEnd%3D${eventEndDate}%3BvisibilityLevel%3D${visibilityLevel}%3BvisibilityApproved%3D${visibilityApproved}%3Bdate%3D${date}%3BvisbleRequested%3D${visbleRequested}%3BvisibleApproved%3D${visibleApproved}?${cacheBuster}`;
    console.log('GRAPHQL_ENDPOINT_PATH:', GRAPHQL_ENDPOINT_PATH);
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
