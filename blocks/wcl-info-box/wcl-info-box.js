function creatWclInfoBoxDom(data) {
  const infoBox = document.createElement('div');
  infoBox.className = 'sidebar-infobox';

  if (data.header) {
    const header = document.createElement('h3');
    header.textContent = data.header;
    infoBox.appendChild(header);
  }

  if (data.description) {
    const description = document.createElement('p');
    description.innerHTML = data.description;
    infoBox.appendChild(description);
  }
  return infoBox;
}

function labelWclInfoBoxData(dataArray) {
  return {
    header: dataArray[0] || null,
    description: dataArray[1] || null,
  };
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const data = children.map((child, index) => {
    if (index === 1) {
      return child.innerHTML.trim();
    }
    const ps = child.querySelectorAll('p');
    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }
    return null;
  });
  return { data };
}

export default function decorate(block) {
  const extractedData = extractContainerData(block);
  const labeledData = labelWclInfoBoxData(extractedData.data);
  const infoBoxDom = creatWclInfoBoxDom(labeledData);

  block.textContent = '';
  block.appendChild(infoBoxDom);
}
