export default function decorate(block) {
  const fields = block.children;
  const [commaSeparatedId] = fields;
  if (!commaSeparatedId) return;

  const sectionIds = commaSeparatedId.querySelector('p').textContent;
  if (!sectionIds) return;

  const ids = sectionIds.split(',').map((id) => id.trim());
  const sections = ids
    .map((id) => document.querySelector(`div[data-sectionid="${id}"]`))
    .filter(Boolean);

  // Remove the block's content and use it as a flex row wrapper
  block.textContent = '';
  block.classList.add('section-row');

  // Add alignment classes and move sections into the block
  sections.forEach((section, index) => {
    section.classList.remove('left-rail', 'middle-section', 'right-rail');
    if (index === 0) {
      section.classList.add('left-rail');
    } else if (index === ids.length - 1) {
      section.classList.add('right-rail');
    } else {
      section.classList.add('middle-section');
    }
    block.appendChild(section);
  });
}
