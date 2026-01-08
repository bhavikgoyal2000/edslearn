export default function decorate(block) {
  const innerDivs = [...block.children];

  // Remove migration content reuse tag
  innerDivs.at(-1).remove();

  // Get authored data
  const pictureDiv = innerDivs[0];
  const caption = innerDivs[1];
  const captionHtml = caption.children[0].innerHTML;
  const style = innerDivs[2].textContent.trim();
  const styleElement = innerDivs[2];
  const figure = document.createElement('figure');

  // Move picture content to figure element
  figure.appendChild(pictureDiv.children[0].children[0]);
  pictureDiv.replaceWith(figure);

  // Move caption content to figure element
  const figCaption = document.createElement('figcaption');
  figCaption.innerHTML = captionHtml;
  figure.appendChild(figCaption);

  // Apply figure styles
  if (style) {
    figure.classList.add(style);
  }

  // Remove author divs
  caption.remove();
  styleElement.remove();
}
