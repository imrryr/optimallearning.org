// Website presentation only: section order and links remain wiki-owned.
const paths = {
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  students: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v6q6 5 12 0v-6M22 9v7"/>',
  teachers: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 21l5-4 5 4M7 8h10M7 12h6"/>',
  research: '<path d="M9 3h6M10 3v6l-6 10q-1 2 2 2h12q3 0 2-2l-6-10V3M7 15h10"/>',
  admin: '<path d="M12 3 3 7v5q0 6 9 10 9-4 9-10V7Z"/><path d="m8 12 3 3 5-6"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
  book: '<path d="M12 5v16M12 5Q6 2 2 4v15q4-2 10 2 6-4 10-2V4q-4-2-10 1Z"/>',
  tools: '<path d="m14 6 4 4 3-3a6 6 0 0 1-8 7l-7 7-3-3 7-7a6 6 0 0 1 7-8Z"/>',
};
export const icon = name => `<svg class="wiki-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const sections = {
  'For Students': ['Students', 'students'],
  'For Teachers and Content Creators': ['Teachers & authors', 'teachers'],
  'For Experimenters and Researchers': ['Researchers', 'research'],
  'For Administrators and Deployers': ['Administration', 'admin'],
  'For Developers': ['Developers', 'code'],
  Resources: ['Resources', 'book'],
  'Internal Maintenance': ['Maintenance', 'tools'],
};
export function navigation($, currentPath, escape) {
  $('[id]').removeAttr('id');
  $('a[href]').each((_, el) => { if ($(el).attr('href') === currentPath) $(el).attr('aria-current', 'page'); });
  const groups = [];
  let group;
  for (const element of $.root().children().toArray()) {
    const node = $(element);
    if (element.tagName === 'h2') {
      group = { title: node.text(), heading: node, nodes: [] };
      groups.push(group);
    } else if (element.tagName !== 'hr') {
      if (!group) { group = { title: 'Documentation', nodes: [] }; groups.push(group); }
      group.nodes.push(node);
    }
  }
  return groups.map(group => {
    if (group.heading?.find('a').length && !group.nodes.length) {
      const link = group.heading.find('a').first();
      return `<a class="wiki-nav-home" href="${escape(link.attr('href'))}" title="${escape(group.title)}"${link.attr('aria-current') ? ' aria-current="page"' : ''}>${icon('home')}<span class="wiki-nav-label">${escape(group.title)}</span></a>`;
    }
    const [label, glyph] = sections[group.title] || [group.title, 'book'];
    const active = group.nodes.some(node => node.find('[aria-current]').length || node.is('[aria-current]'));
    return `<details class="wiki-nav-group"${active ? ' open' : ''}><summary aria-label="${escape(label)}" title="${escape(label)}"${active ? ' class="wiki-nav-active-group"' : ''}>${icon(glyph)}<span class="wiki-nav-label">${escape(label)}</span><span class="wiki-nav-chevron" aria-hidden="true">⌄</span></summary><div class="wiki-nav-links">${group.nodes.map(node => $.html(node)).join('')}</div></details>`;
  }).join('');
}
