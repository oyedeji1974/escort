// Global disclaimer and posting-rules modal
(function () {
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'omnivo-disclaimer-modal';
        modal.style.position = 'fixed';
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.6)';
        modal.style.display = 'none';
        modal.style.zIndex = 99999;
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';

        modal.innerHTML = `
            <div id="omnivo-disclaimer-box" style="background:#fff;max-width:760px;width:94%;padding:22px;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.4);color:#111;">
                <h2 id="omnivo-disclaimer-title" style="margin:0 0 10px;color:#ff5722;font-size:20px"></h2>
                <div id="omnivo-disclaimer-body" style="max-height:56vh;overflow:auto;margin-bottom:18px;font-size:15px;line-height:1.45;color:#222"></div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button id="omnivo-disclaimer-cancel" style="background:#ddd;border:none;padding:10px 14px;border-radius:6px;cursor:pointer">Cancel</button>
                    <button id="omnivo-disclaimer-ok" style="background:#ff5722;color:#fff;border:none;padding:10px 14px;border-radius:6px;cursor:pointer">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    function showModal(title, html, onOk, onCancel) {
        let modal = document.getElementById('omnivo-disclaimer-modal');
        if (!modal) modal = createModal();
        document.getElementById('omnivo-disclaimer-title').innerText = title;
        document.getElementById('omnivo-disclaimer-body').innerHTML = html;
        modal.style.display = 'flex';

        const ok = document.getElementById('omnivo-disclaimer-ok');
        const cancel = document.getElementById('omnivo-disclaimer-cancel');

        function cleanup() {
            ok.removeEventListener('click', onOkClick);
            cancel.removeEventListener('click', onCancelClick);
            modal.style.display = 'none';
        }

        function onOkClick() {
            cleanup();
            if (typeof onOk === 'function') onOk();
        }

        function onCancelClick() {
            cleanup();
            if (typeof onCancel === 'function') onCancel();
        }

        ok.addEventListener('click', onOkClick);
        cancel.addEventListener('click', onCancelClick);
    }

    // Intercept clicks to country links (class "location")
    function attachCountryInterception() {
        document.querySelectorAll('a.location').forEach(a => {
            a.addEventListener('click', function (ev) {
                ev.preventDefault();
                const href = a.href;
                const sessionKey = 'omnivo_country_ok';
                if (sessionStorage.getItem(sessionKey)) {
                    window.location.href = href;
                    return;
                }

                const html = `
                    <p>By continuing to the selected location you acknowledge that Neolist is only a listings platform and is not liable for any damages, losses, or other claims arising from interactions with advertisers or third parties. You should independently verify the identity, services and suitability of any advertiser before engaging.</p>
                    <p>kindly use the report button to report any ad you find suspicious.</p>
                    <p style="font-weight:700;color:#b71c1c">Please confirm you understand and accept these terms before continuing.</p>
                    
                `;

                showModal('Location Disclaimer — Verify Before You Continue', html, function () {
                    // remember for this session
                    try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
                    window.location.href = href;
                }, function () {
                    // User cancelled the disclaimer but should still proceed to the selected location
                    window.location.href = href;
                });
            });
        });
    }

    // Intercept links/buttons that start post flow and require posting rules acceptance
    function attachPostAdInterception() {
        const selectors = [
            'a[href*="post-ad.html"]',
            'a[href*="signup.html"]',
            '.post-ad-container',
            '.floating-post-btn'
        ];

        document.querySelectorAll(selectors.join(',')).forEach(el => {
            el.addEventListener('click', function (ev) {
                // if link already points to external or has target=_blank let it through
                ev.preventDefault();
                const href = (el.tagName === 'A') ? el.href : (el.getAttribute && el.getAttribute('href')) || 'post-ad.html';
                const sessionKey = 'omnivo_posting_rules_ok';
                if (sessionStorage.getItem(sessionKey)) {
                    if (href) window.location.href = href;
                    return;
                }

                const html = `
                    <p>Please read and agree to the posting rules before creating an ad. Violations may result in removal or account suspension.</p>
                    <ul style="margin-top:8px;line-height:1.5">
                        <li>No explicit nudity or sexually explicit images.</li>
                        <li>No sexual content involving minors or non-consenting persons.</li>
                        <li>No illegal services or solicitation of illegal acts.</li>
                        <li>No hate speech, harassment, or discriminatory language.</li>
                        <li>No abusive or profane language in titles or descriptions.</li>
                        <li>Use accurate descriptions and genuine photos — do not misrepresent.</li>
                        <li>Respect local laws and regulations when posting services.</li>
                    </ul>
                    <p style="font-weight:700;color:#b71c1c">By clicking OK you confirm you will follow these rules — Omnivo may remove content that violates them. Omnivo is not liable for user-provided content.</p>
                    <p style="margin-top:10px">If you see an ad that you feel violates these rules, please <a href="/contact.html">report it to us</a> and we will take action.</p>
                `;

                showModal('Posting Rules — Please Accept', html, function () {
                    try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
                    if (href) window.location.href = href;
                });
            });
        });
    }

    // On post-ad page, show rules immediately on page load and block interactions until accepted
    function showRulesOnPostPage() {
        const path = window.location.pathname.toLowerCase();
        if (path.endsWith('post-ad.html') || path.endsWith('/post-ad') || path.endsWith('/post-ad/')) {
            const sessionKey = 'omnivo_posting_rules_ok';
            if (sessionStorage.getItem(sessionKey)) return;

            const html = `
                <p>Before posting an ad, you must accept the posting rules. Ads containing prohibited content will be removed and accounts may be suspended.</p>
                <ul style="margin-top:8px;line-height:1.5">
                    <li>No explicit nudity or sexually explicit images.</li>
                    <li>No sexual content involving minors or non-consenting persons.</li>
                    <li>No illegal services or solicitation of illegal acts.</li>
                    <li>No hate speech, harassment, or discriminatory language.</li>
                    <li>No abusive or profane language in titles or descriptions.</li>
                    <li>Use accurate descriptions and genuine photos — do not misrepresent.</li>
                    <li>Respect local laws and regulations when posting services.</li>
                </ul>
                <p style="font-weight:700;color:#b71c1c">By clicking OK you confirm you will follow these rules — Omnivo may remove content that violates them. Omnivo is not liable for user-provided content.</p>
                <p style="margin-top:10px">If you see an ad that you feel violates these rules, please <a href="/contact.html">report it to us</a> and we will take action.</p>
            `;

            // Delay slightly to ensure DOM is interactive
            setTimeout(function () {
                showModal('Posting Rules — You Must Accept', html, function () {
                    try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
                }, function () {
                    // on cancel, redirect back to home
                    window.location.href = '/index.html';
                });
            }, 80);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        try { attachCountryInterception(); } catch (e) {}
        try { attachPostAdInterception(); } catch (e) {}
        try { showRulesOnPostPage(); } catch (e) {}
    });
})();
