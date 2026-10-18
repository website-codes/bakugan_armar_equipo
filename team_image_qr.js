(function () {
    'use strict';

    const originalSaveTeamAsImage = saveTeamAsImage;
    const MAX_IMAGE_PIXELS = 40000000;
    const MAX_QR_IMAGE_EDGE = 3200;
    const QR_PREFIX = 'BTB2:';
    const ATTRIBUTE_ORDER = Object.keys(ATTRIBUTE_LABELS);

    function getCatalogHashMaps() {
        return [BAKUGAN, PORTAL_CARDS, POWER_CARDS, TRAPS_AND_ARMAMENTS].map((items) => {
            const hashes = new Map();
            const idHashes = new Map();

            for (const item of items) {
                const hash = crc32(new TextEncoder().encode(item.id)).toString(36);
                idHashes.set(item.id, hash);
                if (hashes.has(hash)) {
                    hashes.set(hash, null);
                } else {
                    hashes.set(hash, item.id);
                }
            }

            return { hashes, idHashes };
        });
    }

    function getCardHash(catalog, id) {
        const hash = catalog.idHashes.get(id);
        if (!hash || catalog.hashes.get(hash) !== id) {
            throw new Error('No se pudo preparar el QR porque una carta no es única en el catálogo actual.');
        }
        return hash;
    }

    function getTeamQrData(metadata) {
        const catalogs = getCatalogHashMaps();
        const bakugan = metadata.bakugan.map((slot) => {
            if (slot.empty) {
                return null;
            }
            const attributeIndex = slot.attribute === null
                ? -1
                : ATTRIBUTE_ORDER.indexOf(slot.attribute);
            if (slot.attribute !== null && attributeIndex < 0) {
                throw new Error('No se pudo preparar el QR porque un Bakugan no coincide con el catálogo actual.');
            }
            return [getCardHash(catalogs[0], slot.id), attributeIndex];
        });
        const cardHashes = (slots, catalogIndex) => slots.map((slot) => {
            if (slot.empty) {
                return null;
            }
            return getCardHash(catalogs[catalogIndex], slot.id);
        });
        const equipment = (metadata.equipment || []).map((slot) => {
            if (slot.empty) {
                return null;
            }
            const kindIndex = slot.kind === 'trap' ? 0 : slot.kind === 'armament' ? 1 : -1;
            if (kindIndex < 0) {
                throw new Error('No se pudo preparar el QR porque un accesorio tiene un tipo no válido.');
            }
            const attributeIndex = slot.attribute ? ATTRIBUTE_ORDER.indexOf(slot.attribute) : -1;
            if (slot.attribute && attributeIndex < 0) {
                throw new Error('No se pudo preparar el QR porque un accesorio tiene un atributo no válido.');
            }
            return [getCardHash(catalogs[3], slot.id), kindIndex, attributeIndex];
        });
        if (equipment.length !== 2) {
            throw new Error('No se pudo preparar el QR porque faltan los dos espacios de Trampas y Armamentos.');
        }

        return `${QR_PREFIX}${JSON.stringify([
            bakugan,
            cardHashes(metadata.portal, 1),
            cardHashes(metadata.power, 2),
            equipment
        ])}`;
    }

    function createQrCanvas(metadata) {
        if (typeof window.qrcode !== 'function') {
            throw new Error('No se pudo cargar el generador local de códigos QR.');
        }

        const qr = window.qrcode(0, 'H');
        qr.addData(getTeamQrData(metadata), 'Byte');
        qr.make();

        const moduleCount = qr.getModuleCount();
        const quietZone = 4;
        const pixelsPerModule = 6;
        const canvas = document.createElement('canvas');
        const size = (moduleCount + quietZone * 2) * pixelsPerModule;
        const context = canvas.getContext('2d');

        canvas.width = size;
        canvas.height = size;
        context.fillStyle = '#fff';
        context.fillRect(0, 0, size, size);
        context.fillStyle = '#000';

        for (let row = 0; row < moduleCount; row += 1) {
            for (let column = 0; column < moduleCount; column += 1) {
                if (qr.isDark(row, column)) {
                    context.fillRect(
                        (column + quietZone) * pixelsPerModule,
                        (row + quietZone) * pixelsPerModule,
                        pixelsPerModule,
                        pixelsPerModule
                    );
                }
            }
        }

        canvas.setAttribute('aria-label', 'QR de respaldo para importar el equipo');
        canvas.style.cssText = 'display:block;width:220px;height:220px;background:#fff;';
        return canvas;
    }

    function createExportQr(metadata) {
        const container = document.createElement('div');
        const caption = document.createElement('span');

        container.className = 'equipment-export-qr';
        caption.textContent = 'QR DE RESPALDO · IMPORTACIÓN';
        caption.style.cssText = 'color:#969aa6;font:700 8px Inter,sans-serif;letter-spacing:.14em;';
        container.append(createQrCanvas(metadata), caption);
        return container;
    }

    function showImportError(error) {
        const status = document.querySelector('#saveStatus');
        status.textContent = error.message || 'No se pudo importar el equipo desde la imagen.';
        status.classList.add('is-error');
        console.error('No se pudo importar el equipo desde la imagen:', error);
    }

    function showSaveError(error) {
        const status = document.querySelector('#saveStatus');
        status.textContent = error.message || 'No se pudo generar la imagen del equipo.';
        status.classList.add('is-error');
        console.error('No se pudo generar la imagen del equipo:', error);
    }

    async function getImageFormat(file) {
        if (!file || file.size > MAX_IMPORT_IMAGE_BYTES) {
            throw new Error('La imagen supera el límite de importación de 50 MB.');
        }

        const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
        const startsWith = (...signature) =>
            signature.every((byte, index) => bytes[index] === byte);
        const textAt = (start, length) =>
            String.fromCharCode(...bytes.subarray(start, start + length));

        if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
            return 'png';
        }
        if (startsWith(0xff, 0xd8, 0xff)) {
            return 'jpeg';
        }
        if (textAt(0, 4) === 'RIFF' && textAt(8, 4) === 'WEBP') {
            return 'webp';
        }
        if (textAt(0, 6) === 'GIF87a' || textAt(0, 6) === 'GIF89a') {
            return 'gif';
        }
        if (textAt(0, 2) === 'BM') {
            return 'bmp';
        }
        if (textAt(4, 4) === 'ftyp' && ['avif', 'avis'].includes(textAt(8, 4))) {
            return 'avif';
        }

        throw new Error('El archivo no tiene un formato de imagen compatible (PNG, JPG, WebP, GIF, BMP o AVIF).');
    }

    function getMetadataFromQrData(data) {
        if (typeof data !== 'string' || !data.startsWith(QR_PREFIX)) {
            throw new Error('El QR no corresponde a un equipo de esta aplicación.');
        }

        const decoded = JSON.parse(data.slice(QR_PREFIX.length));
        if (
            !Array.isArray(decoded) ||
            ![3, 4].includes(decoded.length) ||
            !Array.isArray(decoded[0]) ||
            decoded[0].length !== 3 ||
            !Array.isArray(decoded[1]) ||
            decoded[1].length !== 3 ||
            !Array.isArray(decoded[2]) ||
            decoded[2].length !== 6
        ) {
            throw new Error('Los datos del QR no tienen un formato compatible.');
        }

        const catalogs = getCatalogHashMaps();
        const getCatalogId = (catalogIndex, hash) => {
            if (typeof hash !== 'string' || !/^[0-9a-z]+$/.test(hash)) {
                throw new Error('El QR contiene un identificador de carta no válido.');
            }
            const id = catalogs[catalogIndex].hashes.get(hash);
            if (!id) {
                throw new Error('No se encontró una carta del QR o el identificador no es único en este catálogo.');
            }
            return id;
        };
        const bakugan = decoded[0].map((slot) => {
            if (slot === null) {
                return { empty: true };
            }
            if (
                !Array.isArray(slot) ||
                slot.length !== 2 ||
                typeof slot[0] !== 'string' ||
                !Number.isSafeInteger(slot[1]) ||
                slot[1] < -1 ||
                slot[1] >= ATTRIBUTE_ORDER.length
            ) {
                throw new Error('Los datos de Bakugan del QR no son válidos.');
            }
            return {
                id: getCatalogId(0, slot[0]),
                attribute: slot[1] === -1 ? null : ATTRIBUTE_ORDER[slot[1]]
            };
        });
        const toCardSlots = (slots, catalogIndex) => slots.map((hash) => {
            if (hash === null) {
                return { empty: true };
            }
            if (typeof hash !== 'string') {
                throw new Error('Los datos de cartas del QR no son válidos.');
            }
            return { id: getCatalogId(catalogIndex, hash) };
        });
        const equipmentHashes = decoded.length === 4 ? decoded[3] : [null, null];
        if (!Array.isArray(equipmentHashes) || equipmentHashes.length !== 2) {
            throw new Error('Los datos de Trampas y Armamentos del QR no son válidos.');
        }
        const equipment = equipmentHashes.map((slot) => {
            if (slot === null) {
                return { empty: true };
            }
            const attributeIndex = slot?.length === 3 ? slot[2] : -1;
            if (
                !Array.isArray(slot) ||
                ![2, 3].includes(slot.length) ||
                typeof slot[0] !== 'string' ||
                ![0, 1].includes(slot[1]) ||
                !Number.isSafeInteger(attributeIndex) ||
                attributeIndex < -1 ||
                attributeIndex >= ATTRIBUTE_ORDER.length
            ) {
                throw new Error('Los datos de Trampas y Armamentos del QR no son válidos.');
            }
            return {
                id: getCatalogId(3, slot[0]),
                kind: slot[1] === 0 ? 'trap' : 'armament',
                attribute: attributeIndex === -1 ? null : ATTRIBUTE_ORDER[attributeIndex]
            };
        });

        return {
            format: 'bakugan-team-builder',
            version: 1,
            bakugan,
            portal: toCardSlots(decoded[1], 1),
            power: toCardSlots(decoded[2], 2),
            equipment
        };
    }

    async function readQrFromImage(file) {
        if (typeof window.jsQR !== 'function') {
            throw new Error('No se pudo cargar el lector local de códigos QR.');
        }

        let bitmap;
        try {
            bitmap = await createImageBitmap(file);
        } catch (error) {
            throw new Error(`El navegador no pudo abrir la imagen: ${error.message}`);
        }

        try {
            if (
                !bitmap.width ||
                !bitmap.height ||
                bitmap.width * bitmap.height > MAX_IMAGE_PIXELS
            ) {
                throw new Error('La imagen tiene demasiados píxeles para procesar de forma segura.');
            }

            const scale = Math.min(1, MAX_QR_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
            const width = Math.max(1, Math.round(bitmap.width * scale));
            const height = Math.max(1, Math.round(bitmap.height * scale));
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { willReadFrequently: true });

            canvas.width = width;
            canvas.height = height;
            context.drawImage(bitmap, 0, 0, width, height);

            const imageData = context.getImageData(0, 0, width, height);
            const result = window.jsQR(imageData.data, width, height, {
                inversionAttempts: 'attemptBoth'
            });
            if (!result) {
                throw new Error('No se encontró un código QR legible en la imagen.');
            }
            return result.data;
        } finally {
            bitmap.close();
        }
    }

    saveTeamAsImage = async function () {
        const qrSlot = document.querySelector('#equipmentQrSlot');
        const qrPlaceholder = qrSlot?.querySelector('.equipment-qr-placeholder');
        let qrContainer;

        try {
            if (!qrSlot || !qrPlaceholder) {
                throw new Error('No se encontro el tercer espacio para el QR de respaldo.');
            }
            qrContainer = createExportQr(createTeamMetadata());
            qrPlaceholder.hidden = true;
            qrSlot.classList.add('has-qr');
            qrSlot.append(qrContainer);
            await originalSaveTeamAsImage();
        } catch (error) {
            showSaveError(error);
        } finally {
            qrContainer?.remove();
            if (qrPlaceholder) {
                qrPlaceholder.hidden = false;
            }
            qrSlot?.classList.remove('has-qr');
        }
    };

    importTeamFromImage = async function (file) {
        const status = document.querySelector('#saveStatus');
        const button = document.querySelector('#importTeamBtn');
        let metadataError;

        button.disabled = true;
        status.textContent = 'Leyendo los datos del equipo desde la imagen.';
        status.classList.remove('is-error');

        try {
            await catalogLoadTask;
            const format = await getImageFormat(file);

            if (format === 'png') {
                try {
                    restoreTeamMetadata(await readTeamMetadata(file));
                    closePicker();
                    status.textContent = 'Equipo importado desde los metadatos de la imagen.';
                    return;
                } catch (error) {
                    metadataError = error;
                }
            }

            try {
                const qrData = await readQrFromImage(file);
                restoreTeamMetadata(getMetadataFromQrData(qrData));
                closePicker();
                status.textContent = format === 'png'
                    ? 'No se pudieron usar los metadatos; el equipo se importó desde el QR de respaldo.'
                    : 'Equipo importado desde el QR de respaldo de la imagen.';
            } catch (qrError) {
                const reason = metadataError
                    ? ` Metadatos: ${metadataError.message}`
                    : '';
                throw new Error(`No se pudo importar el equipo. No se encontró un QR válido.${reason} QR: ${qrError.message}`);
            }
        } catch (error) {
            showImportError(error);
        } finally {
            button.disabled = false;
        }
    };
})();
