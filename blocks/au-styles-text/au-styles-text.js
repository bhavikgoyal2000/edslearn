export default async function decorate(block) {
  const fields = block.querySelectorAll(':scope > div') || [];

  if (fields.length <= 1) return; // No style selected display as is

  // Apply style class to block
  const style = fields[1].textContent.trim();
  block.classList.add(style);
  fields[1].remove();
}
