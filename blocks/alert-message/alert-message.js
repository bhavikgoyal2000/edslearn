export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const alertType = parentBlock[0].textContent.trim();
  const alertMessage = parentBlock[1].innerHTML.trim();

  if (alertType && alertMessage) {
    const parentDiv = document.createElement('div');
    parentDiv.classList.add('alert');
    parentDiv.classList.add(alertType);
    parentDiv.classList.add('single');
    parentDiv.innerHTML += alertMessage;

    block.textContent = '';
    block.appendChild(parentDiv);
  } else {
    block.textContent = 'Alert Message or Alert Type is missing.';
  }
}
