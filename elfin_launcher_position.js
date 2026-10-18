'use strict';

(() => {
    const positionLauncher = () => {
        const shadowRoot = document.querySelector('#fab-root')?.shadowRoot;
        if (!shadowRoot) {
            return false;
        }

        if (!shadowRoot.querySelector('#elfin-left-launcher-style')) {
            const style = document.createElement('style');
            style.id = 'elfin-left-launcher-style';
            style.textContent = `
                .bpFabWrapper {
                    left: 24px !important;
                    right: auto !important;
                }

                #message-preview-root {
                    left: 24px !important;
                    right: auto !important;
                }
            `;
            shadowRoot.append(style);
        }

        return true;
    };

    if (!positionLauncher()) {
        const observer = new MutationObserver(() => {
            if (positionLauncher()) {
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
