(function () {
    'use strict';

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'traps_armaments.css?v=20261017-equipment-attribute10';
    document.head.append(stylesheet);

    const powerSection = document.querySelector('.power-section');
    if (!document.querySelector('#equipmentSlots')) {
        powerSection.insertAdjacentHTML('afterend', `
            <section class="build-section equipment-section" aria-labelledby="equipment-title">
                <div class="section-heading">
                    <div class="section-index">04</div>
                    <div>
                        <h3 id="equipment-title">Trampas y Armamentos</h3>
                        <p>Dos espacios; combina libremente</p>
                    </div>
                    <span class="section-count">03 SLOTS</span>
                </div>
                <div id="equipmentSlots" class="equipment-slots" aria-label="Trampas y Armamentos"></div>
            </section>
        `);
    }
    if (!document.querySelector('#equipmentPickerModal')) {
        document.querySelector('#pickerModal').insertAdjacentHTML('beforebegin', `
            <div id="equipmentPickerModal" class="picker-modal equipment-picker-modal" aria-hidden="true">
                <div class="picker-backdrop" data-close-equipment-picker="true"></div>
                <section class="picker-dialog equipment-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="equipmentPickerTitle">
                    <header class="picker-header">
                        <div class="picker-title-wrap">
                            <p class="eyebrow"><span class="eyebrow-line"></span>SELECTOR DE RECURSOS</p>
                            <h2 id="equipmentPickerTitle">Trampas y Armamentos</h2>
                            <p class="picker-subtitle">Elige un recurso para este espacio</p>
                        </div>
                        <button id="closeEquipmentPickerBtn" class="close-picker" type="button" aria-label="Cerrar selector">×</button>
                    </header>
                    <div class="picker-tools equipment-picker-tools">
                        <label class="search-box" for="equipmentSearch">
                            <span class="search-icon" aria-hidden="true">⌕</span>
                            <input id="equipmentSearch" type="search" placeholder="Buscar trampas o armamentos..." autocomplete="off">
                            <span class="search-shortcut">/</span>
                        </label>
                        <div class="equipment-kind-filter" role="group" aria-label="Filtrar tipo de recurso">
                            <button type="button" data-equipment-filter="all" aria-pressed="true">Todos</button>
                            <button type="button" data-equipment-filter="trap" aria-pressed="false">Trampas</button>
                            <button type="button" data-equipment-filter="armament" aria-pressed="false">Armamentos</button>
                        </div>
                        <div class="results-label"><span class="status-dot"></span><span id="equipmentResultsCount">00 OPCIONES</span></div>
                    </div>
                    <div id="equipmentPickerResults" class="picker-results equipment-picker-results" aria-live="polite"></div>
                    <footer class="picker-footer">
                        <span id="equipmentPickerPageInfo" class="page-info">PAGINA 1 / 1</span>
                        <div class="pagination-controls">
                            <button id="prevEquipmentPageBtn" type="button" class="page-button" aria-label="Página anterior" disabled>←</button>
                            <button id="nextEquipmentPageBtn" type="button" class="page-button" aria-label="Página siguiente" disabled>→</button>
                        </div>
                    </footer>
                </section>
            </div>
        `);
    }

    const equipmentSlots = document.querySelector('#equipmentSlots');
    const modal = document.querySelector('#equipmentPickerModal');
    const search = document.querySelector('#equipmentSearch');
    const results = document.querySelector('#equipmentPickerResults');
    const count = document.querySelector('#equipmentResultsCount');
    const pageInfo = document.querySelector('#equipmentPickerPageInfo');
    const previousPage = document.querySelector('#prevEquipmentPageBtn');
    const nextPage = document.querySelector('#nextEquipmentPageBtn');
    const closeButton = document.querySelector('#closeEquipmentPickerBtn');
    const filters = [...document.querySelectorAll('[data-equipment-filter]')];
    const attributeOrder = ['pyrus', 'aquos', 'haos', 'darkus', 'ventus', 'subterra', 'aurelus'];
    const attributeFilterWrap = document.createElement('label');
    attributeFilterWrap.className = 'equipment-attribute-filter-wrap';
    attributeFilterWrap.htmlFor = 'equipmentAttributeFilter';
    attributeFilterWrap.innerHTML = '<span>Atributo</span>';
    const attributeFilter = document.createElement('select');
    attributeFilter.id = 'equipmentAttributeFilter';
    attributeFilter.setAttribute('aria-label', 'Filtrar por atributo');
    attributeFilter.add(new Option('Todos los atributos', 'all'));
    attributeOrder.forEach((attribute) => {
        if (ATTRIBUTE_LABELS[attribute]) {
            attributeFilter.add(new Option(ATTRIBUTE_LABELS[attribute], attribute));
        }
    });
    attributeFilterWrap.append(attributeFilter);
    filters[0].parentElement.after(attributeFilterWrap);
    const pageSize = 24;
    const selected = { slot: 0, filter: 'all', attribute: 'all', page: 0 };
    const labels = { trap: 'Trampa', armament: 'Armamento' };
    const attributeCodes = {
        pyrus: 'P',
        aquos: 'A',
        haos: 'H',
        darkus: 'D',
        ventus: 'V',
        subterra: 'S',
        aurelus: 'Au'
    };
    const getItemAttributes = (item) => (item.attributes || Object.keys(item.attributeImages || {}))
        .filter((attribute) => ATTRIBUTE_LABELS[attribute]);
    const getDisplayName = (item) => item.selectedAttribute
        ? `${item.name} ${ATTRIBUTE_LABELS[item.selectedAttribute]}`
        : item.name;

    function getAttributeImage(item, attribute) {
        const image = item.attributeImages?.[attribute];
        return typeof image === 'string' && !/\/UNR\.jpg(?:$|\?)/i.test(image) ? image : null;
    }

    if (!state || !equipmentSlots || !modal || typeof window.renderTeam !== 'function') {
        throw new Error('No se pudo conectar el selector de Trampas y Armamentos.');
    }

    state.equipment = Array.isArray(state.equipment) ? state.equipment : [null, null];
    if (state.equipment.length !== 2) {
        state.equipment = [null, null];
    }
    const catalogFromBakugan = BAKUGAN.flatMap((item) => {
        if (item.id.includes('-treatment-')) {
            return [];
        }

        const detail = item.detail || '';
        const kind = /#TR\d{3}/i.test(detail)
            ? 'trap'
            : /(?:BG#|#BG)\d{3}/i.test(detail)
                ? 'armament'
                : null;
        return kind ? [{ ...item, kind }] : [];
    });
    window.TRAPS_AND_ARMAMENTS = Array.isArray(window.TRAPS_AND_ARMAMENTS)
        && window.TRAPS_AND_ARMAMENTS.length
        ? window.TRAPS_AND_ARMAMENTS
        : catalogFromBakugan;

    const originalRenderTeam = window.renderTeam;
    const originalUpdateCount = window.updateCount;
    const originalCreateMetadata = window.createTeamMetadata;
    const originalRestoreMetadata = window.restoreTeamMetadata;

    function setCatalog(items) {
        if (!Array.isArray(items)) {
            throw new TypeError('El catalogo de Trampas y Armamentos debe ser una lista.');
        }

        const ids = new Set();
        window.TRAPS_AND_ARMAMENTS = items.filter((item) => {
            if (
                !item ||
                typeof item.id !== 'string' ||
                typeof item.name !== 'string' ||
                !['trap', 'armament'].includes(item.kind)
            ) {
                return false;
            }
            if (ids.has(item.id)) {
                return false;
            }
            ids.add(item.id);
            return true;
        });

        renderPicker();
        window.renderTeam();
    }

    function renderSlots() {
        equipmentSlots.replaceChildren();

        for (let index = 0; index < 2; index += 1) {
            const item = state.equipment[index];
            const slot = document.createElement('div');
            slot.className = `equipment-slot${item ? ' is-selected' : ''}`;

            const choose = document.createElement('button');
            choose.type = 'button';
            choose.className = 'equipment-slot-button';
            choose.setAttribute('aria-label', item
                ? `Cambiar ${labels[item.kind].toLowerCase()} ${index + 1}: ${getDisplayName(item)}`
                : `Elegir Trampa o Armamento ${index + 1}`);
            choose.addEventListener('click', () => openPicker(index));

            const visual = document.createElement('span');
            visual.className = 'equipment-slot-visual';
            if (item && item.image) {
                const image = document.createElement('img');
                image.src = item.image;
                image.alt = getDisplayName(item);
                image.loading = 'lazy';
                image.addEventListener('error', () => {
                    const fallback = item.baseImage || item.image;
                    if (fallback && image.src !== fallback) {
                        image.src = fallback;
                    } else {
                        image.hidden = true;
                    }
                });
                visual.append(image);
            } else {
                visual.textContent = item ? labels[item.kind].toUpperCase() : '+';
            }

            const title = document.createElement('span');
            title.className = 'equipment-slot-title';
            title.textContent = item ? getDisplayName(item) : `Espacio ${String(index + 1).padStart(2, '0')}`;

            const subtitle = document.createElement('span');
            subtitle.className = 'equipment-slot-subtitle';
            subtitle.textContent = item
                ? `${labels[item.kind]}${item.selectedAttribute ? ` / ${ATTRIBUTE_LABELS[item.selectedAttribute]}` : ''}${item.detail ? ` / ${item.detail}` : ''}`
                : 'Trampa o Armamento';

            choose.append(visual, title, subtitle);
            slot.append(choose);

            equipmentSlots.append(slot);
        }

        const qrSlot = document.createElement('div');
        qrSlot.id = 'equipmentQrSlot';
        qrSlot.className = 'equipment-slot equipment-qr-slot';
        qrSlot.setAttribute('aria-label', 'Espacio reservado para el QR de respaldo');

        const placeholder = document.createElement('div');
        placeholder.className = 'equipment-qr-placeholder';
        placeholder.innerHTML = `
            <span class="equipment-slot-visual">QR</span>
            <span class="equipment-slot-title">Código QR</span>
            <span class="equipment-slot-subtitle">Se genera al guardar</span>
        `;
        qrSlot.append(placeholder);
        equipmentSlots.append(qrSlot);
    }

    function getFilteredItems() {
        const query = search.value.trim().toLocaleLowerCase('es');
        return window.TRAPS_AND_ARMAMENTS.filter((item) => {
            const matchesKind = selected.filter === 'all' || item.kind === selected.filter;
            const attributes = getItemAttributes(item);
            const matchesAttribute = selected.attribute === 'all' || attributes.includes(selected.attribute);
            const text = [
                item.name,
                item.detail,
                labels[item.kind],
                ...attributes.map((attribute) => ATTRIBUTE_LABELS[attribute])
            ].filter(Boolean).join(' ').toLocaleLowerCase('es');
            return matchesKind && matchesAttribute && (!query || text.includes(query));
        });
    }

    function renderPicker() {
        const items = getFilteredItems();
        const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
        selected.page = Math.min(selected.page, pageCount - 1);
        const start = selected.page * pageSize;
        const pageItems = items.slice(start, start + pageSize);

        count.textContent = `${String(items.length).padStart(2, '0')} OPCIONES`;
        pageInfo.textContent = `PÁGINA ${selected.page + 1} / ${pageCount}`;
        previousPage.disabled = selected.page === 0;
        nextPage.disabled = selected.page >= pageCount - 1;
        results.replaceChildren();

        if (!pageItems.length) {
            const empty = document.createElement('p');
            empty.className = 'equipment-empty-state';
            empty.textContent = window.TRAPS_AND_ARMAMENTS.length
                ? 'No hay recursos que coincidan con esta búsqueda.'
                : 'El catálogo de Trampas y Armamentos se agregará aquí.';
            results.append(empty);
            return;
        }

        for (const item of pageItems) {
            const card = document.createElement('article');
            card.className = 'equipment-option';
            const previewAttribute = selected.attribute === 'all' ? null : selected.attribute;
            const previewImage = previewAttribute
                ? getAttributeImage(item, previewAttribute) || item.image
                : item.image;
            const previewItem = { ...item, selectedAttribute: previewAttribute };

            const choose = document.createElement('button');
            choose.type = 'button';
            choose.className = 'equipment-option-select';
            choose.setAttribute('aria-label', `Elegir ${labels[item.kind]} ${getDisplayName(previewItem)}`);
            choose.addEventListener('click', () => selectItem(item, previewAttribute, previewImage));

            if (previewImage) {
                const image = document.createElement('img');
                image.className = 'equipment-option-image';
                image.src = previewImage;
                image.alt = getDisplayName(previewItem);
                image.loading = 'lazy';
                choose.append(image);
            }

            const name = document.createElement('strong');
            name.className = 'equipment-option-name';
            name.textContent = getDisplayName(previewItem);
            const type = document.createElement('span');
            type.className = 'equipment-option-type';
            type.textContent = labels[item.kind];
            choose.append(name, type);

            if (item.detail) {
                const detail = document.createElement('small');
                detail.className = 'equipment-option-detail';
                detail.textContent = item.detail;
                choose.append(detail);
            }

            card.append(choose);
            results.append(card);
        }
    }

    function selectItem(item, attribute = null, previewImage = item.image) {
        state.equipment[selected.slot] = {
            ...item,
            baseImage: item.image,
            selectedAttribute: attribute,
            image: previewImage || item.image
        };
        closePicker();
        window.renderTeam();
    }

    function openPicker(slotIndex) {
        selected.slot = slotIndex;
        selected.page = 0;
        search.value = '';
        selected.filter = 'all';
        selected.attribute = 'all';
        attributeFilter.value = 'all';
        filters.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.equipmentFilter === 'all'));
        });
        renderPicker();
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        search.focus();
    }

    function closePicker() {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    window.setTrapsArmamentsCatalog = setCatalog;
    window.renderTeam = function (...args) {
        const result = originalRenderTeam.apply(this, args);
        renderSlots();
        return result;
    };
    window.updateCount = function (...args) {
        const result = originalUpdateCount.apply(this, args);
        const selectedCount = [
            ...state.bakugan,
            ...state.portal,
            ...state.power,
            ...state.equipment
        ].filter(Boolean).length;
        document.querySelector('#selectedCount').textContent = `${String(selectedCount).padStart(2, '0')} / 14 SELECCIONADOS`;
        return result;
    };
    window.createTeamMetadata = function (...args) {
        const metadata = originalCreateMetadata.apply(this, args);
        metadata.equipment = state.equipment.map((item) => item
            ? { id: item.id, kind: item.kind, attribute: item.selectedAttribute || null }
            : { empty: true });
        return metadata;
    };
    window.restoreTeamMetadata = function (metadata, ...args) {
        const equipment = metadata?.equipment ?? [{ empty: true }, { empty: true }];
        if (!Array.isArray(equipment) || equipment.length !== 2) {
            throw new Error('Los datos de Trampas y Armamentos deben contener dos espacios.');
        }
        const restoredEquipment = equipment.map((slot) => {
            if (slot?.empty === true) {
                return null;
            }
            if (typeof slot?.id !== 'string' || !['trap', 'armament'].includes(slot.kind)) {
                throw new Error('Los datos de Trampas y Armamentos no son validos.');
            }
            const item = window.TRAPS_AND_ARMAMENTS.find((entry) => entry.id === slot.id && entry.kind === slot.kind);
            if (!item) {
                throw new Error(`No se encontro el recurso ${slot.id} en el catalogo actual.`);
            }
            if (slot.attribute && !getItemAttributes(item).includes(slot.attribute)) {
                throw new Error(`El recurso ${item.name} no tiene el atributo ${slot.attribute}.`);
            }
            return {
                ...item,
                baseImage: item.image,
                selectedAttribute: slot.attribute || null,
                image: getAttributeImage(item, slot.attribute) || item.image
            };
        });
        const result = originalRestoreMetadata.call(this, metadata, ...args);
        state.equipment = restoredEquipment;
        window.renderTeam();
        return result;
    };

    search.addEventListener('input', () => {
        selected.page = 0;
        renderPicker();
    });
    attributeFilter.addEventListener('change', () => {
        selected.attribute = attributeFilter.value;
        selected.page = 0;
        renderPicker();
    });
    filters.forEach((button) => button.addEventListener('click', () => {
        selected.filter = button.dataset.equipmentFilter;
        selected.page = 0;
        filters.forEach((filterButton) => {
            filterButton.setAttribute('aria-pressed', String(filterButton === button));
        });
        renderPicker();
    }));
    previousPage.addEventListener('click', () => {
        selected.page = Math.max(0, selected.page - 1);
        renderPicker();
    });
    nextPage.addEventListener('click', () => {
        selected.page += 1;
        renderPicker();
    });
    closeButton.addEventListener('click', closePicker);
    modal.addEventListener('click', (event) => {
        if (event.target.closest('[data-close-equipment-picker="true"]')) {
            closePicker();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closePicker();
        }
    });

    const originalRender = window.renderTeam;
    originalRender.call(window);
    renderSlots();
    window.updateCount();
})();
