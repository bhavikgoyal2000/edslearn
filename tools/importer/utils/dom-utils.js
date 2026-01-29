export function hasGlobalElement(container) {
  let parent = container.closest('.CS_Element_Custom');

  if (!parent) {
    return false;
  }

  let currentNode = container;

  while (currentNode !== parent) {
    let prevSibling = currentNode.previousSibling;
    while (prevSibling) {
      if (prevSibling.nodeType === Node.COMMENT_NODE) {
        const commentContent = prevSibling.nodeValue.trim();
        const commentRegex = /ElementName=([^|]+?)\s*\|.*?isDynamic=(\d+)\s*\|.*?filterOPT=(\d+)\s*\|.*?filter=([^|]+?)\s*\|/;
        const match = commentContent.match(commentRegex);

        if (match) {
          const elementName = match[1]?.trim();
          const isDynamic = match[2] === '1';
          const filterOpt = match[3] === '1';
          const filter = match[4]?.trim();
          return elementName && (isDynamic || filterOpt || (filter && filter.toLowerCase() !== "n/a"));
        }
      }

      prevSibling = prevSibling.previousSibling;
    }
    currentNode = currentNode.parentElement;
  }
  
  return false;
}

export function getRawHTMLDOM(htmlString){
  //const htmlString = params.html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const mainBody = doc.body;
  return mainBody;
}
