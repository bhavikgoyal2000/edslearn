export default function decorate(block) {
  const wrapper = document.createElement('section');
  wrapper.classList.add('eventlisting-wrapper');
  block.textContent = 'cdbccdcdb';
  block.appendChild(wrapper);
}
