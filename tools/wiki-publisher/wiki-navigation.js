const shell = document.querySelector('.wiki-shell');
const toggle = document.querySelector('.wiki-sidebar-toggle');
const nav = document.querySelector('#wiki-navigation');

function setExpanded(expanded) {
  shell.classList.toggle('wiki-nav-expanded', expanded);
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} documentation sidebar`);
  toggle.title = `${expanded ? 'Collapse' : 'Expand'} sidebar`;
}

toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => {
  const summary = event.target.closest('summary');
  if (summary && toggle.getAttribute('aria-expanded') === 'false') {
    event.preventDefault();
    summary.parentElement.open = true;
    setExpanded(true);
  }
});
nav.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setExpanded(false);
    toggle.focus();
  }
});
