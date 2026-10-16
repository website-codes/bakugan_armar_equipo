'use strict';

(() => {
    const treatmentFilter = document.getElementById('treatmentFilter');
    const treatmentFilterWrap = document.getElementById('treatmentFilterWrap');
    const attributeFilter = document.getElementById('attributeFilter');
    const treatmentData = window.BAKUGAN_TREATMENT_DATA;

    if (!treatmentFilter || !treatmentFilterWrap || !attributeFilter || !treatmentData) {
        throw new Error('No se pudo inicializar el catálogo de tratamientos Bakugan.');
    }

    const treatmentLabels = new Map(
        treatmentData.treatments.map(({ id, label }) => [id, label])
    );
    const additionNames = new Set(
        treatmentData.additions.map(({ name }) => name.toLocaleLowerCase())
    );
    const memberTreatments = new Map();

    for (const [treatmentId, names] of Object.entries(treatmentData.members)) {
        for (const name of names) {
            const key = name.trim().toLocaleLowerCase();
            const treatments = memberTreatments.get(key) || [];
            if (!treatments.includes(treatmentId)) {
                treatments.push(treatmentId);
            }
            memberTreatments.set(key, treatments);
        }
    }

    treatmentFilter.replaceChildren(new Option('Todos los tratamientos', 'all'));
    const sortedTreatments = [...treatmentData.treatments].sort((first, second) =>
        first.label.localeCompare(second.label, 'es', { sensitivity: 'base' })
    );
    for (const { id, label } of sortedTreatments) {
        treatmentFilter.add(new Option(label, id));
    }

    const treatmentTrigger = document.createElement('button');
    treatmentTrigger.type = 'button';
    treatmentTrigger.className = 'treatment-select-trigger';
    treatmentTrigger.setAttribute('aria-haspopup', 'listbox');
    treatmentTrigger.setAttribute('aria-expanded', 'false');

    const treatmentMenu = document.createElement('div');
    treatmentMenu.className = 'treatment-select-menu';
    treatmentMenu.id = 'treatmentSelectMenu';
    treatmentMenu.setAttribute('role', 'listbox');
    treatmentMenu.setAttribute('aria-label', 'Tratamientos');
    treatmentMenu.hidden = true;

    for (const option of treatmentFilter.options) {
        const menuOption = document.createElement('button');
        menuOption.type = 'button';
        menuOption.className = 'treatment-select-option';
        menuOption.dataset.value = option.value;
        menuOption.setAttribute('role', 'option');
        menuOption.textContent = option.textContent;
        treatmentMenu.append(menuOption);
    }

    treatmentTrigger.setAttribute('aria-controls', treatmentMenu.id);
    treatmentFilter.classList.add('treatment-select-native');
    treatmentFilter.tabIndex = -1;
    treatmentFilter.setAttribute('aria-hidden', 'true');
    treatmentFilterWrap.append(treatmentTrigger, treatmentMenu);

    function updateTreatmentMenu() {
        const selectedOption = treatmentFilter.options[treatmentFilter.selectedIndex];
        treatmentTrigger.textContent = selectedOption.textContent;
        for (const option of treatmentMenu.children) {
            const selected = option.dataset.value === treatmentFilter.value;
            option.setAttribute('aria-selected', String(selected));
            option.classList.toggle('is-selected', selected);
        }
    }

    function closeTreatmentMenu(returnFocus = false) {
        treatmentMenu.hidden = true;
        treatmentTrigger.setAttribute('aria-expanded', 'false');
        treatmentFilterWrap.classList.remove('is-open');
        if (returnFocus) {
            treatmentTrigger.focus();
        }
    }

    function openTreatmentMenu() {
        treatmentMenu.hidden = false;
        treatmentTrigger.setAttribute('aria-expanded', 'true');
        treatmentFilterWrap.classList.add('is-open');
        const selectedOption = treatmentMenu.querySelector('[aria-selected="true"]');
        selectedOption?.focus();
        selectedOption?.scrollIntoView({ block: 'nearest' });
    }

    updateTreatmentMenu();

    treatmentTrigger.addEventListener('click', () => {
        if (treatmentMenu.hidden) {
            openTreatmentMenu();
        } else {
            closeTreatmentMenu();
        }
    });

    treatmentTrigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openTreatmentMenu();
        }
    });

    treatmentMenu.addEventListener('click', (event) => {
        const option = event.target.closest('.treatment-select-option');
        if (!option) {
            return;
        }

        treatmentFilter.value = option.dataset.value;
        treatmentFilter.dispatchEvent(new Event('change', { bubbles: true }));
        closeTreatmentMenu(true);
    });

    treatmentMenu.addEventListener('keydown', (event) => {
        const options = Array.from(treatmentMenu.children);
        const currentIndex = options.indexOf(document.activeElement);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowDown') {
            nextIndex = Math.min(currentIndex + 1, options.length - 1);
        } else if (event.key === 'ArrowUp') {
            nextIndex = Math.max(currentIndex - 1, 0);
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = options.length - 1;
        } else if (event.key === 'Escape') {
            event.preventDefault();
            closeTreatmentMenu(true);
            return;
        } else {
            return;
        }

        event.preventDefault();
        options[nextIndex].focus();
        options[nextIndex].scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('click', (event) => {
        if (!treatmentFilterWrap.contains(event.target)) {
            closeTreatmentMenu();
        }
    });

    function getTreatmentId(bakugan) {
        if (treatmentLabels.has(bakugan.treatmentId)) {
            return bakugan.treatmentId;
        }

        if (typeof bakugan.detail !== 'string') {
            throw new TypeError(`El Bakugan ${bakugan.name || 'sin nombre'} no tiene detalle de catálogo.`);
        }

        if (/\(\s*Special Attack\s*\)/i.test(bakugan.detail)) {
            return 'special-attack';
        }

        if (/\(\s*Super Assault\s*\)/i.test(bakugan.detail)) {
            return 'super-assault';
        }

        return 'standard';
    }

    function getTreatmentImage(bakugan, treatmentId, preferredAttribute) {
        const treatmentImage = treatmentData.images?.[treatmentId]?.[bakugan.name];
        if (typeof treatmentImage === 'string') {
            return treatmentImage;
        }

        if (treatmentImage && typeof treatmentImage === 'object') {
            if (typeof treatmentImage[preferredAttribute] === 'string') {
                return treatmentImage[preferredAttribute];
            }

            const treatmentAttributes = treatmentData.treatmentAttributes?.[treatmentId]?.[bakugan.name];
            const attributes = Array.isArray(treatmentAttributes)
                ? treatmentAttributes
                : bakugan.attributes || [];
            const matchingImage = attributes
                .map((attribute) => treatmentImage[attribute])
                .find((image) => typeof image === 'string');

            if (matchingImage) {
                return matchingImage;
            }

            return treatmentImage.darkus || Object.values(treatmentImage)[0];
        }

        return undefined;
    }

    function createVariant(base, treatmentId) {
        const treatmentImage = treatmentData.images?.[treatmentId]?.[base.name];
        const treatmentAttributes = treatmentData.treatmentAttributes?.[treatmentId]?.[base.name];
        return {
            ...base,
            id: `${base.id}-treatment-${treatmentId}`,
            image: getTreatmentImage(base, treatmentId) || base.image,
            ...(Array.isArray(treatmentAttributes)
                ? { attributes: treatmentAttributes }
                : {}),
            ...(treatmentImage && typeof treatmentImage === 'object'
                ? {
                    attributeImages: {
                        ...(base.attributeImages || {}),
                        ...treatmentImage
                    }
                }
                : {}),
            treatmentId
        };
    }

    function addTreatmentCatalogEntries() {
        if (!Array.isArray(BAKUGAN)) {
            throw new TypeError('El catálogo activo de Bakugan no está disponible.');
        }

        for (const addition of treatmentData.additions) {
            const key = addition.name.toLocaleLowerCase();
            const treatments = memberTreatments.get(key) || ['standard'];
            const base = BAKUGAN.find(
                (item) => item.name.toLocaleLowerCase() === key && !item.treatmentId
            ) || {
                ...addition,
                id: `bakugan-wiki-${key.replace(/[^a-z0-9]+/g, '-')}`,
                attributeImages: {}
            };

            for (const treatmentId of treatments) {
                const variantId = `${base.id}-treatment-${treatmentId}`;
                const baseIsPresent = BAKUGAN.some((item) => item.id === base.id);
                if (
                    baseIsPresent &&
                    getTreatmentId(base) === treatmentId
                ) {
                    base.image = getTreatmentImage(base, treatmentId) || base.image;
                    continue;
                }

                if (!BAKUGAN.some((item) => item.id === variantId)) {
                    BAKUGAN.push(createVariant(base, treatmentId));
                }
            }
        }

        const catalogByName = new Map();
        for (const item of BAKUGAN) {
            const key = item.name.toLocaleLowerCase();
            if (!catalogByName.has(key)) {
                catalogByName.set(key, item);
            }
        }

        for (const [key, treatmentIds] of memberTreatments) {
            if (additionNames.has(key)) {
                continue;
            }

            const base = catalogByName.get(key);
            if (!base) {
                throw new Error(`No se encontró el Bakugan "${key}" en el catálogo.`);
            }

            for (const treatmentId of treatmentIds) {
                if (treatmentId === getTreatmentId(base)) {
                    base.image = getTreatmentImage(base, treatmentId) || base.image;
                    continue;
                }

                if (BAKUGAN.some((item) => item.id === `${base.id}-treatment-${treatmentId}`)) {
                    continue;
                }

                BAKUGAN.push(createVariant(base, treatmentId));
            }
        }
    }

    const originalLoadBakuganCatalog = window.loadBakuganCatalog;
    const originalGetPickerItems = window.getPickerItems;
    const originalBuildOptionCard = window.buildOptionCard;
    const originalOpenPicker = window.openPicker;

    if (
        typeof originalLoadBakuganCatalog !== 'function' ||
        typeof originalGetPickerItems !== 'function' ||
        typeof originalBuildOptionCard !== 'function' ||
        typeof originalOpenPicker !== 'function'
    ) {
        throw new Error('No se pudieron conectar los filtros del selector Bakugan.');
    }

    window.loadBakuganCatalog = async function (...args) {
        const result = await originalLoadBakuganCatalog.apply(this, args);
        addTreatmentCatalogEntries();
        return result;
    };

    window.getPickerItems = function () {
        const items = originalGetPickerItems();

        if (state.picker.group !== 'bakugan' || treatmentFilter.value === 'all') {
            return items;
        }

        return items.filter((bakugan) => getTreatmentId(bakugan) === treatmentFilter.value);
    };

    window.buildOptionCard = function (bakugan, group) {
        const card = originalBuildOptionCard(bakugan, group);

        if (group === 'bakugan') {
            const treatmentImage = getTreatmentImage(
                bakugan,
                getTreatmentId(bakugan),
                attributeFilter.value
            );
            const image = card.querySelector('img');
            if (
                typeof treatmentImage === 'string' &&
                treatmentImage.startsWith('https://static.wikia.nocookie.net/') &&
                image
            ) {
                image.referrerPolicy = 'origin';
                image.src = treatmentImage;
            }

            const title = card.querySelector('.option-title');

            if (!title) {
                throw new Error('No se encontró el título de una opción Bakugan.');
            }

            const badge = document.createElement('small');
            badge.className = 'option-subtitle bakugan-treatment-badge';
            badge.textContent = `Tratamiento: ${treatmentLabels.get(getTreatmentId(bakugan))}`;
            title.append(badge);
        }

        return card;
    };

    window.openPicker = function (...args) {
        addTreatmentCatalogEntries();
        treatmentFilter.value = 'all';
        updateTreatmentMenu();
        const result = originalOpenPicker.apply(this, args);
        treatmentFilterWrap.hidden = state.picker.group !== 'bakugan';
        return result;
    };

    treatmentFilter.addEventListener('change', () => {
        updateTreatmentMenu();
        state.picker.page = 0;
        renderPickerResults();
    });

    addTreatmentCatalogEntries();
})();
