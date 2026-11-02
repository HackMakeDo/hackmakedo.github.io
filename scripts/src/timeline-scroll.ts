/* Spine fill, reached-node reveal, year ticker, and the oldest/newest order toggle. */
(function () {
    const tl = document.getElementById('tl');
    const ticker = document.getElementById('ticker');
    if (!tl || !ticker) return;
    let entries = Array.from(tl.querySelectorAll<HTMLElement>('.entry'));

    function onScroll() {
        const vh = window.innerHeight;
        const r = tl!.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        tl!.style.setProperty('--p', p.toFixed(4));

        let current = entries[0];
        for (let i = 0; i < entries.length; i++) {
            const er = entries[i].getBoundingClientRect();
            if (er.top < vh * 0.6) { entries[i].classList.add('reached'); current = entries[i]; }
            else { entries[i].classList.remove('reached'); }
        }
        ticker!.textContent = r.top > vh * 0.6 ? entries[0].getAttribute('data-year') : current.getAttribute('data-year');
        (ticker as HTMLElement).hidden = r.bottom < vh * 0.4;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    /* reorder the real DOM so reading order matches the visual order */
    const orderBtn = document.getElementById('order-btn');
    const orderStatus = document.getElementById('order-status');
    let newestFirst = false;
    if (orderBtn && orderStatus) {
        orderBtn.addEventListener('click', () => {
            newestFirst = !newestFirst;
            const list = entries.slice().reverse();
            list.forEach((el) => tl!.appendChild(el));
            entries = list;
            orderBtn.innerHTML = newestFirst ? 'Newest first &#8645; Switch to oldest first' : 'Oldest first &#8645; Switch to newest first';
            orderStatus.textContent = newestFirst ? 'Timeline now shows newest first' : 'Timeline now shows oldest first';
            if (tl!.getBoundingClientRect().top < 0) tl!.scrollIntoView({ block: 'start' });
            onScroll();
        });
    }

    onScroll();
})();
