// eslint-disable-next-line import/prefer-default-export
export function cleanUpSrcUrl(src, origin) {
  let imgUrl;
  try {
    imgUrl = new URL(src);
  } catch (e) {
    imgUrl = new URL(src, origin);
  }

  if (imgUrl.host.startsWith('localhost')) {
    return `${imgUrl.pathname}`;
  }

  return `${imgUrl.pathname}`;
}
// --- Utility: Build Image Element ---
export function buildImageElement({ imgSrc, imgAlt }) {

  const wrapperDiv = document.createElement('div');
  if (!imgSrc) return wrapperDiv; // return empty div if no image

  const img = document.createElement('img');
  img.setAttribute('src', imgSrc);
  img.setAttribute('alt', imgAlt || '');
  wrapperDiv.append(img);

  return wrapperDiv;
}