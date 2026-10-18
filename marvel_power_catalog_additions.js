'use strict';

const MARVEL_POWER_CARDS = [
    {
        id: 'power-wiki-194528',
        name: 'Spider Man',
        image: 'https://static.wikia.nocookie.net/bakugan/images/8/80/Spiderman.jpg/revision/latest?cb=20230616113713',
        color: 'red',
        detail: 'Roja / Ability Card / BakuMarvel 1-4mvb'
    },
    {
        id: 'power-marvel-captain-america',
        name: 'Captain America',
        image: 'https://static.wikia.nocookie.net/bakugan/images/8/87/Captain_America.jpg/revision/latest?cb=20230616113614',
        color: 'green',
        detail: 'Verde / Ability Card / BakuMarvel 1-4mvb'
    },
    {
        id: 'power-wiki-230464',
        name: 'Dharak Rush',
        image: '',
        color: 'blue',
        detail: 'Azul / Ability Card / BakuMarvel 1-4mvb'
    }
];

window.POWER_CATALOG_DATA = [
    ...(window.POWER_CATALOG_DATA || []),
    ...MARVEL_POWER_CARDS
];

const originalFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const request = args[0];
    const requestUrl = request instanceof Request ? request.url : String(request);
    const url = new URL(requestUrl, window.location.href);

    if (!url.pathname.endsWith('/power_catalog.php') || !response.ok) {
        return response;
    }

    const payload = await response.clone().json();
    if (!Array.isArray(payload.items)) {
        throw new TypeError('El catálogo de cartas de poder no tiene un formato válido.');
    }

    const existingNames = new Set(payload.items.map((card) =>
        typeof card.name === 'string' ? card.name.trim().toLocaleLowerCase('es') : ''
    ));

    for (const card of MARVEL_POWER_CARDS) {
        const key = card.name.trim().toLocaleLowerCase('es');
        if (!existingNames.has(key)) {
            payload.items.push(card);
            existingNames.add(key);
        }
    }

    payload.count = payload.items.length;
    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return new Response(JSON.stringify(payload), {
        status: response.status,
        statusText: response.statusText,
        headers
    });
};
