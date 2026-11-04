/* Rolling odometer digits for the .facts b stat tiles. */
(function () {
    const nums = document.querySelectorAll<HTMLElement>('.facts b');
    if (!nums.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rolls: HTMLElement[] = [];

    nums.forEach((el) => {
        const text = el.textContent?.trim() || '';
        el.setAttribute('aria-label', text);
        el.textContent = '';
        let idx = 0;
        text.split('').forEach((ch) => {
            if (/[0-9]/.test(ch)) {
                const od = document.createElement('span');
                od.className = 'od';
                od.setAttribute('aria-hidden', 'true');
                const strip = document.createElement('span');
                strip.className = 'od-strip';
                strip.style.setProperty('--d', ch);
                strip.style.setProperty('--i', String(idx++));
                for (let d = 0; d <= 9; d++) {
                    const c = document.createElement('span');
                    c.textContent = String(d);
                    strip.appendChild(c);
                }
                od.appendChild(strip);
                el.appendChild(od);
            } else {
                const t = document.createElement('span');
                t.setAttribute('aria-hidden', 'true');
                t.textContent = ch;
                el.appendChild(t);
            }
        });
        rolls.push(el);
    });

    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add('spin'); io.unobserve(en.target); }
        });
    }, { threshold: 0.6 });
    rolls.forEach((el) => io.observe(el));
})();
