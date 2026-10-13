'use strict';

// Catálogo remoto. Las imágenes se solicitan por URL y no se descargan al proyecto.
const FALLBACK_BAKUGAN = [
  { id: 'bakugan-dragonoid', name: 'Pyro Dragonoid', image: 'https://www.clipartmax.com/png/full/174-1741737_pyro-dragonoid-bakugan-dragon.png', detail: 'Pyrus / Dragonoid' },
  { id: 'bakugan-pegatrix', name: 'Haos Pegatrix', image: 'https://www.vhv.rs/dpng/d/215-2151939_haos-pegatrix-bakugan-battle-planet-pegatrix-hd-png.png', detail: 'Haos / Pegatrix' },
  { id: 'bakugan-krakelios', name: 'Aquos Krakelios', image: 'https://www.pngkit.com/png/full/856-8560627_aquos-krakelios-ultra-based-on-the-kraken-a.png', detail: 'Aquos / Krakelios Ultra' },
  { id: 'bakugan-trox', name: 'Ventus Trox', image: 'https://www.pikpng.com/pngl/b/336-3362739_bakugan-battle-planet-trox-clipart.png', detail: 'Ventus / Trox' },
  { id: 'bakugan-drago-green', name: 'Green Drago', image: 'https://p1.hiclipart.com/preview/840/744/980/drago-green-bakugan-battle-brawlers-new-vestroia-game-character-video-games-cartoon-yellow-animal-figure-png-clipart.jpg', detail: 'Drago / New Vestroia' },
  { id: 'bakugan-preyas', name: 'Preyas', image: 'https://p1.hiclipart.com/preview/9/674/424/robot-drago-preyas-ace-grit-shun-kazami-baron-letloy-bakugan-battle-brawlers-new-vestroia-darkus-percival-png-clipart.jpg', detail: 'Aquos / Preyas' },
  { id: 'bakugan-howlkor', name: 'Darkus Howlkor', image: 'https://bakugan.wiki/images/4/4b/Darkus_Howlkor_BAA_%28Open%29.png', detail: 'Darkus / Armored Alliance' },
  { id: 'bakugan-nillious', name: 'Darkus Nillious', image: 'https://bakugan.wiki/images/c/ce/Darkus_Nillious_%28Open%29.png', detail: 'Darkus / Battle Planet' },
  { id: 'bakugan-hydorous', name: 'Hydorous x Batrix', image: 'https://bakugan.wiki/images/1/14/Aquos_Ventus_Hydorous_x_Batrix_%28Open%29.png', detail: 'Aquos + Ventus / Fusión' },
  { id: 'bakugan-nova-drago', name: 'Nova Dragonoid', image: 'https://bakugan.wiki/images/9/94/Pyrus_Nova_Dragonoid_%28Open%29.png', detail: 'Pyrus / Nova Dragonoid' },
  { id: 'bakugan-juggernoid-ventus', name: 'Ventus Juggernoid', image: 'https://bakugandb.com/BakuganImg/Data/01- Battle Brawlers/026- Juggernoid/B1/17- Ventus.jpg', detail: 'Ventus / Battle Brawlers · #026' }
];
const BAKUGAN = Array.isArray(window.BAKUGAN_CATALOG_DATA) && window.BAKUGAN_CATALOG_DATA.length > 0
  ? [...window.BAKUGAN_CATALOG_DATA]
  : [...FALLBACK_BAKUGAN];

const FALLBACK_PORTAL_CARDS = [
  { id: 'portal-cavern', name: 'Cavern Portal', image: 'https://i.ebayimg.com/images/g/IosAAOSwq~NlhcVn/s-l1200.jpg', tier: 'bronce', detail: 'Bronce / Gate Card' },
  { id: 'portal-tricky-gate', name: 'Tricky Gate', image: 'https://bakugan.wiki/images/a/a5/BA215_GA_SM_tricky_gate.png', tier: 'bronce', detail: 'Bronce / Gate Card' },
  { id: 'portal-forth-back', name: 'Forth and Back', image: 'https://bakugan.wiki/images/5/54/Forth_and_Back_%28NA%29.png', tier: 'bronce', detail: 'Bronce / Copper Gate Card' },
  { id: 'portal-vr13', name: 'VR Arena #13', image: 'https://bakugan.wiki/images/7/79/VR_Arena_Number_13_%28NA%29.png', tier: 'plata', detail: 'Plata / Gate Card' },
  { id: 'portal-vr14', name: 'VR Arena #14', image: 'https://bakugan.wiki/images/8/8a/VR_Arena_Number_14_%28NA%29.png', tier: 'plata', detail: 'Plata / Gate Card' },
  { id: 'portal-vr15', name: 'VR Arena #15', image: 'https://bakugan.wiki/images/8/8a/VR_Arena_Number_15_%28NA%29.png', tier: 'plata', detail: 'Plata / Gate Card' },
  { id: 'portal-glamour', name: 'Glamour Gate', image: 'https://i.ebayimg.com/00/s/MTYwMFgxMjEz/z/la0AAOSwNrhnFAzT/$_57.JPG?set_id=880000500F', tier: 'oro', detail: 'Oro / Gate Card' },
  { id: 'portal-golden-lance', name: 'Golden Lance', image: 'https://bakugan.wiki/images/5/5c/Golden_Lance_%28NA%29.png', tier: 'oro', detail: 'Oro / Gate Card' },
  { id: 'portal-mind-tear', name: 'Mind Tear', image: 'https://bakugan.wiki/images/c/c4/Mind_Tear_%28NA%29.png', tier: 'oro', detail: 'Oro / Gate Card' },
  { id: 'portal-golden-shot', name: 'Golden Shot', image: 'https://bakugan.wiki/images/5/5e/Golden_Shot_%28NA%29.png', tier: 'oro', detail: 'Oro / Gate Card' }
];
const PORTAL_CARDS = Array.isArray(window.PORTAL_CATALOG_DATA) && window.PORTAL_CATALOG_DATA.length > 0
  ? [...new Map([...FALLBACK_PORTAL_CARDS, ...window.PORTAL_CATALOG_DATA].map((card) => [card.name.trim().toLocaleLowerCase('es'), card])).values()]
  : [...FALLBACK_PORTAL_CARDS];

const FALLBACK_POWER_CARDS = [
  { id: 'power-perfect-aim', name: 'Perfect Aim', image: 'https://bakugan.wiki/images/5/57/BA222_AB_SM_perfect_aim.png', color: 'red', detail: 'Roja / Ability Card' },
  { id: 'power-blaze', name: 'Blaze', image: 'https://bakugan.wiki/images/8/85/BA168_AB_SM_blaze_F.png', color: 'red', detail: 'Roja / Ability Card' },
  { id: 'power-sword-barrage', name: 'Sword Barrage', image: 'https://bakugan.wiki/images/thumb/5/57/Sword_Barrage_JP_46_CO_BR.png/600px-Sword_Barrage_JP_46_CO_BR.png', color: 'red', detail: 'Roja / Action Card' },
  { id: 'power-darkness', name: 'Power from Darkness', image: 'https://thumbs.coleka.com/media/item/201901/17/bakugan-battle-brawlers-cards-power-from-darkness-38-48.webp', color: 'red', detail: 'Roja / Ability Card' },
  { id: 'power-blue-green', name: 'Blue-Green Combine', image: 'https://bakugan.wiki/images/thumb/4/4f/Blue-Green_Combine_%28JP%29.jpg/450px-Blue-Green_Combine_%28JP%29.jpg', color: 'green', detail: 'Verde / Ability Card' },
  { id: 'power-coredem', name: 'Coredem', image: 'https://i.ebayimg.com/images/g/aH4AAOSwy7dniXd6/s-l1200.png', color: 'green', detail: 'Verde / Ability Card' },
  { id: 'power-darkus', name: 'Darkus', image: 'https://i.ebayimg.com/images/g/nkAAAOSw-VBm8Y1b/s-l1200.jpg', color: 'green', detail: 'Verde / Ability Card' },
  { id: 'power-shades-gray', name: 'Shades of Gray', image: 'https://bakugan.wiki/images/e/ea/Shades_of_Gray_%28NA%29.png', color: 'gray', detail: 'Gris / Ability Card' },
  { id: 'power-black-hole', name: 'Black Hole', image: 'https://bakugan.wiki/images/8/8c/BA295_GA_black_hole_04d.png', color: 'gray', detail: 'Gris / Ability Card' },
  { id: 'power-gpower-increase', name: 'G-Power Increase', image: 'https://i.ebayimg.com/images/g/2GsAAOSw-hxkC4Gb/s-l1200.jpg', color: 'gray', detail: 'Gris / Ability Card' }
];
const POWER_CARDS = Array.isArray(window.POWER_CATALOG_DATA) && window.POWER_CATALOG_DATA.length > 0
  ? [...new Map([...FALLBACK_POWER_CARDS, ...window.POWER_CATALOG_DATA].map((card) => [`${card.color}:${card.name.trim().toLocaleLowerCase('es')}`, card])).values()]
  : [...FALLBACK_POWER_CARDS];

const PAGE_SIZE = 8;
const state = {
  bakugan: [null, null, null],
  portal: [null, null, null],
  power: [null, null, null, null, null, null],
  picker: { group: null, slotIndex: null, filter: null, attributeFilter: 'all', query: '', page: 0 }
};

const COLOR_LABELS = { red: 'Roja', green: 'Verde', gray: 'Gris' };
const TIER_LABELS = { bronce: 'Bronce', plata: 'Plata', oro: 'Oro' };
const ATTRIBUTE_LABELS = { pyrus: 'Pyrus', aquos: 'Aquos', darkus: 'Darkus', haos: 'Haos', ventus: 'Ventus', subterra: 'Subterra', aurelus: 'Aurelus' };
const ASSETS = { bakugan: BAKUGAN, portal: PORTAL_CARDS, power: POWER_CARDS };
const $ = (selector) => document.querySelector(selector);

function remoteImageUrl(url) {
  // wsrv.nl optimiza la solicitud de la imagen remota y permite usarla en capturas compatibles con CORS.
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
}

function makeAssetFrame(item, extraClass = '') {
  const frame = document.createElement('div');
  frame.className = `asset-frame ${extraClass}`.trim();
  const img = document.createElement('img');
  img.className = 'slot-img';
  img.alt = item.name;
  img.loading = 'eager';
  img.decoding = 'async';
  img.crossOrigin = 'anonymous';
  img.referrerPolicy = 'no-referrer';
  const fallback = document.createElement('div');
  fallback.className = 'asset-fallback';
  fallback.innerHTML = `<span>${escapeHTML(item.name)}</span><small>RECURSO REMOTO</small>`;
  img.addEventListener('load', () => frame.classList.remove('is-fallback'));
  img.addEventListener('error', () => {
    // Si el optimizador no puede recuperar un recurso, se intenta la dirección de origen.
    if (!img.dataset.directAttempted) {
      img.dataset.directAttempted = 'true';
      img.crossOrigin = 'anonymous';
      img.src = item.image;
      return;
    }
    frame.classList.add('is-fallback');
  });
  img.src = remoteImageUrl(item.image);
  frame.append(img, fallback);
  return frame;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function renderBakuganSlots() {
  const container = $('#bakuganSlots');
  container.innerHTML = '';
  state.bakugan.forEach((item, index) => {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = `slot-card bakugan-slot ${item ? 'is-filled' : 'is-empty'}`;
    slot.setAttribute('aria-label', item ? `Cambiar Bakugan ${index + 1}: ${item.name}` : `Elegir Bakugan ${index + 1}`);
    const visual = document.createElement('div');
    visual.className = 'slot-visual';
    if (item) visual.append(makeAssetFrame(item));
    else visual.innerHTML = `<span class="slot-plus">+</span><span class="slot-hint">AÑADIR BAKUGAN</span>`;
    const name = document.createElement('div');
    name.className = 'slot-name';
    name.textContent = item ? item.name : `Bakugan ${String(index + 1).padStart(2, '0')}`;
    if (item) {
      const meta = document.createElement('small');
      meta.className = 'slot-meta';
      meta.textContent = [item.selectedAttribute && ATTRIBUTE_LABELS[item.selectedAttribute], item.detail].filter(Boolean).join(' / ');
      name.append(meta);
    }
    slot.append(visual, name);
    slot.addEventListener('click', () => openPicker('bakugan', index));
    container.append(slot);
  });
}

function renderPortalSlots() {
  const container = $('#portalSlots');
  container.innerHTML = '';
  const tiers = ['bronce', 'plata', 'oro'];
  tiers.forEach((tier, index) => {
    const item = state.portal[index];
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.dataset.tier = tier;
    slot.className = `slot-card portal-slot ${item ? 'is-filled' : 'is-empty'}`;
    slot.setAttribute('aria-label', item ? `Cambiar carta portal ${TIER_LABELS[tier]}: ${item.name}` : `Elegir carta portal ${TIER_LABELS[tier]}`);
    const visual = document.createElement('div');
    visual.className = 'slot-visual';
    if (item) {
      visual.append(makeAssetFrame(item));
      const badge = document.createElement('span');
      badge.className = 'slot-type-badge';
      badge.textContent = TIER_LABELS[tier];
      visual.append(badge);
    } else {
      visual.innerHTML = `<span class="slot-plus">+</span><span class="slot-hint">CARTA ${TIER_LABELS[tier].toUpperCase()}</span>`;
    }
    const name = document.createElement('div');
    name.className = 'slot-name';
    name.textContent = item ? item.name : `${TIER_LABELS[tier]} · Portal`;
    if (item) {
      const meta = document.createElement('small');
      meta.className = 'slot-meta';
      meta.textContent = 'Carta portal';
      name.append(meta);
    }
    slot.append(visual, name);
    slot.addEventListener('click', () => openPicker('portal', index, tier));
    container.append(slot);
  });
}

function renderPowerSlots() {
  const container = $('#powerSlots');
  container.innerHTML = '';
  const colors = ['red', 'red', 'green', 'green', 'gray', 'gray'];
  colors.forEach((color, index) => {
    const item = state.power[index];
    const label = COLOR_LABELS[color];
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.dataset.color = color;
    slot.className = `slot-card power-slot ${item ? 'is-filled' : 'is-empty'}`;
    slot.setAttribute('aria-label', item ? `Cambiar carta de poder ${label}: ${item.name}` : `Elegir carta de poder ${label} ${index + 1}`);
    const visual = document.createElement('div');
    visual.className = 'slot-visual';
    if (item) {
      visual.append(makeAssetFrame(item));
      const badge = document.createElement('span');
      badge.className = 'slot-type-badge';
      badge.textContent = label;
      visual.append(badge);
    } else {
      visual.innerHTML = `<span class="slot-plus">+</span><span class="slot-hint">${label.toUpperCase()}</span>`;
    }
    const name = document.createElement('div');
    name.className = 'slot-name';
    name.textContent = item ? item.name : `Poder ${label.toLowerCase()} ${index % 2 + 1}`;
    if (item) {
      const meta = document.createElement('small');
      meta.className = 'slot-meta';
      meta.textContent = 'Carta de poder';
      name.append(meta);
    }
    slot.append(visual, name);
    slot.addEventListener('click', () => openPicker('power', index, color));
    container.append(slot);
  });
}

function updateCount() {
  const count = [...state.bakugan, ...state.portal, ...state.power].filter(Boolean).length;
  $('#selectedCount').textContent = `${String(count).padStart(2, '0')} / 12 SELECCIONADOS`;
}

function renderTeam() {
  renderBakuganSlots();
  renderPortalSlots();
  renderPowerSlots();
  updateCount();
}

function openPicker(group, slotIndex, filter = null) {
  const groupTitles = {
    bakugan: 'Selecciona un Bakugan',
    portal: `Carta portal · ${TIER_LABELS[filter] || 'Portal'}`,
    power: `Carta de poder · ${COLOR_LABELS[filter] || 'Poder'}`
  };
  const subtitles = {
    bakugan: 'Elige una criatura para ocupar este espacio.',
    portal: `Solo se muestran cartas de acabado ${(TIER_LABELS[filter] || 'portal').toLowerCase()}.`,
    power: `Solo se muestran cartas de poder de color ${(COLOR_LABELS[filter] || 'poder').toLowerCase()}.`
  };
  if (!ASSETS[group] || !groupTitles[group]) return;
  state.picker = { group, slotIndex, filter, attributeFilter: 'all', query: '', page: 0 };
  $('#pickerTitle').textContent = groupTitles[group];
  $('#pickerSubtitle').textContent = subtitles[group];
  $('#pickerSearch').value = '';
  $('#pickerSearch').placeholder = group === 'bakugan' ? 'Buscar Bakugan por nombre...' : 'Buscar carta por nombre...';
  $('#attributeFilter').value = 'all';
  $('#attributeFilterWrap').hidden = group !== 'bakugan';
  $('#pickerModal').classList.add('is-open');
  $('#pickerModal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderPickerResults();
  window.setTimeout(() => $('#pickerSearch').focus(), 40);
}

function closePicker() {
  $('#pickerModal').classList.remove('is-open');
  $('#pickerModal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function getPickerItems() {
  const { group, filter, attributeFilter, query } = state.picker;
  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  return ASSETS[group].filter((item) => {
    const filterMatches = !filter || (group === 'portal' ? item.tier === filter : group === 'power' ? item.color === filter : true);
    const searchableText = [item.name, item.detail, ...(item.attributes || []).map((attribute) => ATTRIBUTE_LABELS[attribute])].join(' ').toLocaleLowerCase('es');
    const queryMatches = !normalizedQuery || searchableText.includes(normalizedQuery);
    return filterMatches && queryMatches;
  });
}

function buildOptionCard(item, group) {
  if (group === 'bakugan') {
    const card = document.createElement('article');
    card.className = 'option-card bakugan-option-card';
    card.dataset.kind = group;
    const main = document.createElement('div');
    main.className = 'option-main';
    const previewAttribute = state.picker.attributeFilter;
    const previewImage = previewAttribute === 'all' ? item.image : item.attributeImages?.[previewAttribute];
    const visual = document.createElement('button');
    visual.type = 'button';
    visual.className = 'option-visual';
    if (previewImage) {
      const selectedVersion = previewAttribute === 'all' ? '' : ` en atributo ${ATTRIBUTE_LABELS[previewAttribute]}`;
      visual.setAttribute('aria-label', `Seleccionar ${item.name}${selectedVersion}`);
      visual.append(makeAssetFrame({ ...item, image: previewImage }));
      visual.addEventListener('click', () => selectItem(item, previewAttribute === 'all' ? null : previewAttribute));
    } else {
      visual.classList.add('is-unavailable');
      visual.disabled = true;
      visual.setAttribute('aria-label', `${item.name} no existe en ${ATTRIBUTE_LABELS[previewAttribute]}`);
      const unavailable = document.createElement('div');
      unavailable.className = 'attribute-unavailable';
      const unavailableTitle = document.createElement('strong');
      unavailableTitle.textContent = `No existe en ${ATTRIBUTE_LABELS[previewAttribute]}`;
      const unavailableDetail = document.createElement('span');
      unavailableDetail.textContent = item.name;
      unavailable.append(unavailableTitle, unavailableDetail);
      visual.append(unavailable);
    }
    const text = document.createElement('span');
    text.className = 'option-title';
    text.textContent = item.name;
    const subtitle = document.createElement('small');
    subtitle.className = 'option-subtitle';
    subtitle.textContent = item.detail;
    text.append(subtitle);
    main.append(visual, text);
    card.append(main);

    const variants = document.createElement('div');
    variants.className = 'attribute-variants';
    const availableAttributes = (item.attributes || []).filter((attribute) => ATTRIBUTE_LABELS[attribute]);
    if (previewAttribute !== 'all' && availableAttributes.includes(previewAttribute)) {
      const variantButton = document.createElement('button');
      variantButton.type = 'button';
      variantButton.className = 'attribute-variant is-current';
      variantButton.textContent = `Elegir ${ATTRIBUTE_LABELS[previewAttribute]}`;
      variantButton.setAttribute('aria-label', `Elegir ${item.name} en atributo ${ATTRIBUTE_LABELS[previewAttribute]}`);
      variantButton.addEventListener('click', () => selectItem(item, previewAttribute));
      variants.append(variantButton);
    } else if (previewAttribute === 'all' && availableAttributes.length) {
      availableAttributes.forEach((attribute) => {
        const variantButton = document.createElement('button');
        variantButton.type = 'button';
        variantButton.className = 'attribute-variant';
        variantButton.textContent = ATTRIBUTE_LABELS[attribute];
        variantButton.setAttribute('aria-label', `Elegir ${item.name} en atributo ${ATTRIBUTE_LABELS[attribute]}`);
        variantButton.addEventListener('click', () => selectItem(item, attribute));
        variants.append(variantButton);
      });
    } else if (previewAttribute === 'all') {
      const variantButton = document.createElement('button');
      variantButton.type = 'button';
      variantButton.className = 'attribute-variant is-unlisted';
      variantButton.textContent = 'Sin atributo registrado';
      variantButton.setAttribute('aria-label', `Elegir ${item.name} sin atributo registrado`);
      variantButton.addEventListener('click', () => selectItem(item));
      variants.append(variantButton);
    } else {
      const unavailableLabel = document.createElement('span');
      unavailableLabel.className = 'attribute-unavailable-label';
      unavailableLabel.textContent = `No existe en ${ATTRIBUTE_LABELS[previewAttribute]}`;
      variants.append(unavailableLabel);
    }
    card.append(variants);
    return card;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'option-card';
  button.dataset.kind = group;
  button.setAttribute('aria-label', `Seleccionar ${item.name}`);
  const visual = document.createElement('div');
  visual.className = 'option-visual';
  visual.append(makeAssetFrame(item));
  const text = document.createElement('span');
  text.className = 'option-title';
  text.textContent = item.name;
  const subtitle = document.createElement('small');
  subtitle.className = 'option-subtitle';
  subtitle.textContent = item.detail;
  text.append(subtitle);
  const selectLabel = document.createElement('span');
  selectLabel.className = 'option-select';
  selectLabel.innerHTML = '<span>Seleccionar</span><span>↗</span>';
  button.append(visual, text, selectLabel);
  button.addEventListener('click', () => selectItem(item));
  return button;
}

function renderPickerResults() {
  const items = getPickerItems();
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (state.picker.page >= totalPages) state.picker.page = totalPages - 1;
  const start = state.picker.page * PAGE_SIZE;
  const visibleItems = items.slice(start, start + PAGE_SIZE);
  const results = $('#pickerResults');
  results.innerHTML = '';
  visibleItems.forEach((item) => results.append(buildOptionCard(item, state.picker.group)));
  if (!visibleItems.length) {
    const empty = document.createElement('div');
    empty.className = 'no-results';
    empty.innerHTML = '<div><strong>No encontramos coincidencias</strong>Prueba con otro nombre o elimina parte de la búsqueda.</div>';
    results.append(empty);
  }
  $('#resultsCount').textContent = `${String(items.length).padStart(2, '0')} OPCIONES`;
  $('#pickerPageInfo').textContent = `PÁGINA ${state.picker.page + 1} / ${totalPages}`;
  $('#prevPageBtn').disabled = state.picker.page === 0;
  $('#nextPageBtn').disabled = state.picker.page >= totalPages - 1;
}

function selectItem(item, attribute = null) {
  const { group, slotIndex } = state.picker;
  state[group][slotIndex] = group === 'bakugan'
    ? { ...item, image: item.attributeImages?.[attribute] || item.image, selectedAttribute: attribute }
    : item;
  renderTeam();
  closePicker();
  const selectedVersion = attribute ? ` (${ATTRIBUTE_LABELS[attribute]})` : '';
  $('#saveStatus').textContent = `${item.name}${selectedVersion} añadido al equipo.`;
  $('#saveStatus').classList.remove('is-error');
}

function movePage(direction) {
  const items = getPickerItems();
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  state.picker.page = Math.min(totalPages - 1, Math.max(0, state.picker.page + direction));
  renderPickerResults();
}

async function loadBakuganCatalog() {
  if (window.location.protocol === 'file:') return;

  try {
    const response = await fetch('bakugan_catalog.php', {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog.items) || catalog.items.length === 0 || catalog.count !== catalog.items.length) {
      throw new Error('El catálogo completo de Bakugan no devolvió una lista válida.');
    }
    BAKUGAN.splice(0, BAKUGAN.length, ...catalog.items);
    renderBakuganSlots();
    if ($('#pickerModal').classList.contains('is-open') && state.picker.group === 'bakugan') {
      renderPickerResults();
    }
  } catch (error) {
    console.error('No se pudo cargar el catálogo ampliado de Bakugan:', error);
  }
}

async function loadPowerCatalog() {
  if (window.location.protocol === 'file:') return;

  try {
    const response = await fetch('power_catalog.php', {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog.items) || catalog.items.length <= 500) {
      throw new Error('El catálogo no contiene más de 500 cartas de poder.');
    }
    const mergedCards = new Map();
    [...FALLBACK_POWER_CARDS, ...catalog.items].forEach((card) => {
      mergedCards.set(`${card.color}:${card.name.trim().toLocaleLowerCase('es')}`, card);
    });
    POWER_CARDS.splice(0, POWER_CARDS.length, ...mergedCards.values());
    if ($('#pickerModal').classList.contains('is-open') && state.picker.group === 'power') {
      renderPickerResults();
    }
  } catch (error) {
    console.error('No se pudo cargar el catálogo ampliado de cartas de poder:', error);
  }
}

async function loadPortalCatalog() {
  if (window.location.protocol === 'file:') return;

  try {
    const response = await fetch('portal_catalog.php', {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog.items) || catalog.items.length === 0 || catalog.count !== catalog.items.length) {
      throw new Error('El catálogo de cartas portal no devolvió una lista válida.');
    }
    const mergedCards = new Map();
    [...FALLBACK_PORTAL_CARDS, ...catalog.items].forEach((card) => {
      mergedCards.set(card.name.trim().toLocaleLowerCase('es'), card);
    });
    PORTAL_CARDS.splice(0, PORTAL_CARDS.length, ...mergedCards.values());
    if ($('#pickerModal').classList.contains('is-open') && state.picker.group === 'portal') {
      renderPickerResults();
    }
  } catch (error) {
    console.error('No se pudo cargar el catálogo ampliado de cartas portal:', error);
  }
}

async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      window.setTimeout(done, 12000);
    });
  }));
}

function replaceUnsupportedColorFunctions(value) {
  let result = '';
  let cursor = 0;
  const functionPattern = /\boklab\s*\(/gi;
  let match;

  while ((match = functionPattern.exec(value)) !== null) {
    let depth = 1;
    let end = functionPattern.lastIndex;
    while (end < value.length && depth > 0) {
      if (value[end] === '(') depth += 1;
      else if (value[end] === ')') depth -= 1;
      end += 1;
    }
    if (depth !== 0) continue;

    result += value.slice(cursor, match.index) + 'rgb(128, 128, 128)';
    cursor = end;
    functionPattern.lastIndex = end;
  }

  return (result + value.slice(cursor)).replace(/\bin oklab\b/gi, '');
}

function sanitizeCaptureColors(clonedDocument) {
  clonedDocument.querySelectorAll('style').forEach((styleElement) => {
    if (/oklab/i.test(styleElement.textContent)) {
      styleElement.textContent = replaceUnsupportedColorFunctions(styleElement.textContent);
    }
  });

  const sanitizeStyle = (style) => {
    for (const property of Array.from(style)) {
      const value = style.getPropertyValue(property);
      if (/oklab/i.test(value)) {
        style.setProperty(
          property,
          replaceUnsupportedColorFunctions(value),
          'important'
        );
      }
    }
  };
  const sanitizeRules = (rules) => {
    for (const rule of rules) {
      if (rule.style) sanitizeStyle(rule.style);
      try {
        if (rule.cssRules) sanitizeRules(rule.cssRules);
      } catch (error) {
        if (error.name !== 'SecurityError') throw error;
      }
    }
  };

  for (const styleSheet of clonedDocument.styleSheets) {
    try {
      sanitizeRules(styleSheet.cssRules);
    } catch (error) {
      if (error.name !== 'SecurityError') throw error;
    }
  }

  const elements = clonedDocument.querySelectorAll('*');
  elements.forEach((element) => {
    sanitizeStyle(element.style);
    const computedStyle = clonedDocument.defaultView.getComputedStyle(element);
    for (const property of computedStyle) {
      const value = computedStyle.getPropertyValue(property);
      if (/oklab/i.test(value)) {
        element.style.setProperty(property, replaceUnsupportedColorFunctions(value), 'important');
      }
    }
  });
}

async function saveTeamAsImage() {
  const button = $('#saveTeamBtn');
  const status = $('#saveStatus');
  const captureRoot = $('#equipoCaptura');
  button.disabled = true;
  button.querySelector('span:nth-child(2)').textContent = 'Preparando imagen...';
  status.textContent = 'Cargando las imágenes seleccionadas para la captura.';
  status.classList.remove('is-error');
  try {
    if (typeof window.html2canvas !== 'function') {
      throw new Error('No se pudo cargar el módulo de captura. Comprueba tu conexión a internet y vuelve a intentarlo.');
    }
    await document.fonts.ready;
    await waitForImages(captureRoot);
    const canvas = await window.html2canvas(captureRoot, {
      backgroundColor: '#0d0e13',
      scale: Math.min(2, (window.devicePixelRatio || 1) * 1.25),
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      onclone: sanitizeCaptureColors
    });
    const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('No se pudo crear el archivo PNG.')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `equipo-bakugan-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    status.textContent = 'Imagen PNG preparada. Revisa tus descargas.';
  } catch (error) {
    console.error('No se pudo guardar el equipo:', error);
    status.textContent = error?.message || 'No se pudo generar la imagen. Comprueba la conexión e inténtalo de nuevo.';
    status.classList.add('is-error');
  } finally {
    button.disabled = false;
    button.querySelector('span:nth-child(2)').textContent = 'Guardar equipo';
  }
}

function initialize() {
  renderTeam();
  loadBakuganCatalog();
  loadPowerCatalog();
  loadPortalCatalog();
  $('#captureDate').textContent = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  $('#closePickerBtn').addEventListener('click', closePicker);
  $('#pickerModal').addEventListener('click', (event) => {
    if (event.target.matches('[data-close-picker="true"]')) closePicker();
  });
  $('#pickerSearch').addEventListener('input', (event) => {
    state.picker.query = event.target.value;
    state.picker.page = 0;
    renderPickerResults();
  });
  $('#attributeFilter').addEventListener('change', (event) => {
    state.picker.attributeFilter = event.target.value;
    state.picker.page = 0;
    renderPickerResults();
  });
  $('#prevPageBtn').addEventListener('click', () => movePage(-1));
  $('#nextPageBtn').addEventListener('click', () => movePage(1));
  $('#saveTeamBtn').addEventListener('click', saveTeamAsImage);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#pickerModal').classList.contains('is-open')) closePicker();
    if (event.key === '/' && !$('#pickerModal').classList.contains('is-open') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      // Atajo cómodo: abre el selector del primer Bakugan vacío, o el primero si todos están ocupados.
      const slotIndex = Math.max(0, state.bakugan.findIndex((item) => !item));
      openPicker('bakugan', slotIndex);
    }
  });
}

document.addEventListener('DOMContentLoaded', initialize);
