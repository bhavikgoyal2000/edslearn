export default async function decorate(block) {
  const header = document.createElement('div');
  header.classList.add('iframe-header');
  const [headingObj, subHeadingObj, descriptionObj, iframeObj] = [...block.children].slice(1);
  if (headingObj) {
    const heading = document.createElement('div');
    heading.classList.add('heading');
    heading.textContent = headingObj.querySelector('p')?.textContent || '';

    header.appendChild(heading);
  }

  if (subHeadingObj) {
    const subheading = document.createElement('div');
    subheading.classList.add('subheading');
    subheading.textContent = subHeadingObj.querySelector('p')?.textContent || '';
    header.appendChild(subheading);
  }

  // Description
  if (descriptionObj) {
    const description = document.createElement('div');
    description.classList.add('description');
    description.textContent = descriptionObj.querySelector('p')?.textContent || '';
    header.appendChild(description);
  }
  block.textContent = ''; // Clear existing content
  block.appendChild(header);

  const iframe = document.createElement('iframe');
  const link = iframeObj?.querySelector('a')?.getAttribute('href') || '';

  iframe.src = link;
  iframe.setAttribute('frameborder', 0);
  iframe.setAttribute('allowfullscreen', '');
  iframe.classList.add('responsive-iframe');
  block.appendChild(iframe);
}
