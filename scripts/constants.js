const GRAPHQL_ENDPOINT = 'http://localhost:4502/graphql/execute.json/au';
const SERVER_URL = 'http://localhost:4502';
const CAPTCHA_SITE_KEY = '6LfdPSgUAAAAAKUbTSQX3u3EUMcwhisBS05rZ74u';
const BROWSE_MAP = {
  host: 'h',
  eventType: 't',
  location: 'l',
  series: 's',
};

const BROWSE_REVERSE_MAP = {
  h: 'host',
  t: 'eventType',
  l: 'location',
  s: 'series',
};

export {
  GRAPHQL_ENDPOINT, SERVER_URL, CAPTCHA_SITE_KEY, BROWSE_MAP, BROWSE_REVERSE_MAP,
};
