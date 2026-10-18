'use strict';

(() => {
    const tierLabels = {
        bronce: 'Bronce',
        plata: 'Plata',
        oro: 'Oro'
    };

    const colorGroups = {
        oro: [
            'Alpha Hydranoid (Card)', 'Black Metal Three', 'Blan Shoult (Card)',
            'Borg Mahisas (Card)', 'Cave Party', 'Darak in Gariable',
            'Decrease Power', 'Destroy Munikis (Card)', 'Dio Descent',
            'Dio Sivac (Card)', 'Flare Dragaon (Card)', 'Fullmetal Dragaon',
            'Fullmetal Gate', 'G-Ganorada (Card)', 'Gavli Anacon (Card)',
            'Gigan Taures (Gate Card)', 'Gif Jinryu (Card)',
            'Golden Dragon, Stand!', 'Gran Panzer (Card)',
            'Gren Dragaon (Card)', 'Gren Dragaon (Second Card)',
            'Hametsu No Savac', 'Helios MK II (Card)', 'Kilan Leoness (Card)',
            'Killer Volca (Card)', 'Kizuna Forever', 'Metal Brave7',
            'Mystic Elico (Japanese Card)', 'Poison Eyes',
            'Saint Aquas (Card)', 'Saint Water', 'Team Battle Master',
            'Van Falco (Card)', 'Well Galow (Card)', 'Zak Jaguard (Card)',
            'Zak! Zak! Zak!', 'Zero Munikis (BTC064)', 'Zero Munikis (Card)'
        ],
        plata: [
            'Asahi-ya!', 'Dark Curtain', 'DarkZone', 'Dragonoid (BB Card)',
            'EarthZone', 'Electrical Storm', 'Fear Ripper (Card)',
            'Fire Works', 'FireZone', 'Flash Lumina', "Fujin's Works",
            'Gaia Silver', 'Gaia-Warp', 'Heaven Bridge', 'Heat Storm',
            'Lightning Refraction', 'Lumina and Darkon',
            'Mother Sea Condition', 'Point Slam',
            'Poisonous Scorpion of Darkness', 'Quick Sand (HSP)',
            'Rumbling Earth', 'Screetch', 'Silver Dragon, Battle!',
            "Sivac's Chair", 'Sky Castle',
            'The Amazing Beasts of Light',
            'Ultimate Dragonoid (Korean Card)',
            'Ultimate Helios (Korean Card)', 'Wind Zone'
        ],
        bronce: [
            'Behind Shot Omega', 'Behind Shot Sigma', 'Broken Order',
            'Cruel Defeat', 'Destroy Trilingual', 'Despair Defeat',
            'Electrical Absorb', 'Exclusive Ability', 'Evil Sacrifice',
            'God Gravity', 'Gravity Ring', 'Hammer Cannon (Card)',
            'Long Journey to Holy Earth', 'Lost Ability', 'Low Power Omega',
            'Low Power Sigma', 'Low Power Victoria', 'Metal Friendship',
            'Metal Powered Suit', 'Metal Triangle', 'Mother Earth', 'Phoenix',
            'Phenomenon', 'Saint Reflection', 'Shadow Support', 'Spot',
            'Splash World', 'SurvivalMatch', 'Three Element Boost',
            'Triple Color Dead', 'Triple Core Beast', 'Triple Element Boost',
            'Tricky Magic', "Victor's Smile"
        ]
    };

    const excludedCards = new Map([
        ['Award', 'Carta de comando japonesa; edición/color por verificar.'],
        ['BakuTech Extension Card Pack', 'Paquete de cartas, no una carta individual.'],
        ['Copper Gate Cards', 'Página de categoría, no una carta individual.'],
        ['Dark Drop', 'Carta de habilidad verde, no carta portal.'],
        ['Fake Gate Cards', 'Página temática, no una carta individual.'],
        ['Gold Gate Cards', 'Página de categoría, no una carta individual.'],
        ['Juggernoid (Card)', 'Carta de personaje HSP, no carta portal de color.'],
        ['Late Tide', 'Carta de habilidad azul, no carta portal.'],
        ['Mind Ghost', 'Carta de comando, no carta portal de color.'],
        ['Rebound', 'Carta especial HSP, no carta portal de color.'],
        ['Robotallian (Card)', 'Carta de personaje HSP, no carta portal de color.'],
        ['Silver Gate Cards', 'Página de categoría, no una carta individual.'],
        ['Transformation', 'Carta de comando HSP, no carta portal de color.'],
        ['Transporter Card', 'Referencia narrativa; no está verificada como carta portal jugable.'],
        ['Whiplash (47/48ah)', 'Carta de habilidad verde, no carta portal.']
    ]);

    const normalizeName = (name) => name.trim().toLocaleLowerCase('en');
    const tierByName = new Map();

    for (const [tier, names] of Object.entries(colorGroups)) {
        for (const name of names) {
            const key = normalizeName(name);
            if (tierByName.has(key)) {
                throw new Error(`La carta "${name}" aparece en más de un color portal.`);
            }
            tierByName.set(key, tier);
        }
    }

    for (const name of excludedCards.keys()) {
        if (tierByName.has(normalizeName(name))) {
            throw new Error(`La carta excluida "${name}" también tiene un color portal.`);
        }
    }

    function correctCatalog(items) {
        if (!Array.isArray(items)) {
            throw new TypeError('El catálogo de cartas portal no tiene un formato válido.');
        }

        const foundColors = new Set();
        const foundExclusions = new Set();

        for (const item of items) {
            if (typeof item.name !== 'string') {
                continue;
            }

            const key = normalizeName(item.name);
            const tier = tierByName.get(key);

            if (tier) {
                foundColors.add(key);
                const series = typeof item.detail === 'string'
                    ? item.detail.split('/').slice(1).join('/').trim()
                    : '';
                item.tier = tier;
                item.detail = `${tierLabels[tier]}${series ? ` / ${series}` : ' / Gate Card'}`;
                continue;
            }

            const exclusionReason = excludedCards.get(item.name);
            if (exclusionReason) {
                foundExclusions.add(item.name);
                item.tier = 'excluded';
                item.detail = `Excluida de colores de carta portal / ${exclusionReason}`;
            }
        }

        const missingColors = [...tierByName.keys()].filter((name) => !foundColors.has(name));
        const missingExclusions = [...excludedCards.keys()].filter((name) => !foundExclusions.has(name));
        if (missingColors.length || missingExclusions.length) {
            throw new Error(
                `Faltan cartas en el catálogo portal. Colores: ${missingColors.join(', ') || 'ninguna'}; `
                + `exclusiones: ${missingExclusions.join(', ') || 'ninguna'}.`
            );
        }

        return items;
    }

    if (Array.isArray(window.PORTAL_CATALOG_DATA)) {
        correctCatalog(window.PORTAL_CATALOG_DATA);
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const request = args[0];
        const requestUrl = request instanceof Request ? request.url : String(request);
        const url = new URL(requestUrl, window.location.href);

        if (!url.pathname.endsWith('/portal_catalog.php') || !response.ok) {
            return response;
        }

        const payload = await response.clone().json();
        payload.items = correctCatalog(payload.items);
        return new Response(JSON.stringify(payload), {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers([...response.headers].filter(([name]) => name.toLowerCase() !== 'content-length'))
        });
    };
})();
