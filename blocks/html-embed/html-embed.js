import { fetchComponentData } from '../../scripts/graphql-api.js';

export default async function decorate(block) {
  const contentFragmentPath = block.querySelector('p')?.textContent.trim() || null;
  if (!contentFragmentPath) return;
  const contentFragmentJson = await fetchComponentData('HtmlEmbed-GraphQL-Query', contentFragmentPath);
  block.innerHTML = contentFragmentJson.auHtmlEmbedCodeModelByPath.item?.html?.html || '';
}
