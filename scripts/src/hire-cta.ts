/* Copy-email button in the "Available for hire" section. */
(function () {
    const btn = document.getElementById('cta-copy');
    const mail = document.getElementById('cta-mail');
    const status = document.getElementById('cta-copied');
    if (!btn || !mail || !status) return;

    let clearTimer: ReturnType<typeof setTimeout>;
    function announce(text: string) {
        clearTimeout(clearTimer);
        status!.textContent = text;
        clearTimer = setTimeout(() => { status!.textContent = ''; }, 2500);
    }

    btn.addEventListener('click', () => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            announce('Copy not supported here — please select and copy manually.');
            return;
        }
        navigator.clipboard.writeText(mail.textContent?.trim() || '').then(
            () => announce('Copied!'),
            () => announce('Copy failed — please select and copy manually.')
        );
    });
})();
