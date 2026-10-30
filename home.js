const toolSearch = document.querySelector('#tool-search');
const toolCards = [...document.querySelectorAll('#tool-cards > [data-type]')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const resultCount = document.querySelector('#catalog-result-count');
const emptyMessage = document.querySelector('#catalog-empty');
let activeFilter = 'all';

function normalizeText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

function updateCatalog() {
  const query = normalizeText(toolSearch.value.trim());
  let visibleAvailable = 0;
  let visiblePreparing = 0;

  toolCards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || card.dataset.type === activeFilter;
    const matchesSearch = !query || normalizeText(card.textContent).includes(query);
    const isVisible = matchesFilter && matchesSearch;
    card.hidden = !isVisible;
    if (!isVisible) return;
    if (card.classList.contains('tool-tile-preparing')) visiblePreparing += 1;
    else visibleAvailable += 1;
  });

  resultCount.textContent = `${visibleAvailable} disponibles · ${visiblePreparing} en preparación`;
  emptyMessage.hidden = visibleAvailable + visiblePreparing !== 0;
}

toolSearch.addEventListener('input', updateCatalog);
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    if (activeFilter === 'all') toolSearch.value = '';
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton.dataset.filter === activeFilter;
      filterButton.classList.toggle('is-active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    updateCatalog();
  });
});
