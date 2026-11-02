/* 3D commits/PRs bar chart, built on the global THREE loaded via <script> in timeline.html. */
declare global {
    interface Window {
        THREE?: typeof import('three');
    }
}

type Mesh = import('three').Mesh;
type Material = import('three').Material;
type MeshStandardMaterial = import('three').MeshStandardMaterial;
type Color = import('three').Color;
type WebGLRenderer = import('three').WebGLRenderer;

interface Series {
    key: string;
    cssVar: string;
    z: number;
    unit: string;
    vals: number[];
    mat?: MeshStandardMaterial;
    color?: Color;
}

interface BarData {
    sr: Series;
    year: number;
    val: number;
}

(function () {
    const host = document.getElementById('c3d');
    if (!host) return;
    const details = document.getElementById('c3d-data') as HTMLDetailsElement | null;
    const wrap = document.getElementById('c3d-wrap') as HTMLElement | null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function fallback() {
        if (details) details.open = true;
        if (wrap) wrap.hidden = true;
    }
    if (!window.THREE) { fallback(); return; }
    const THREE = window.THREE;

    /* The accessible <table> inside #c3d-data is the one source of truth for this
       data (it's what screen readers and no-JS visitors get); read the chart's
       numbers from it instead of duplicating them here, so the two can't drift apart. */
    const table = details ? details.querySelector('table') : null;
    const rows = table ? Array.from(table.tBodies[0].rows) : [];
    if (!rows.length) { fallback(); return; }

    const years = rows.map((row) => parseInt(row.cells[0].textContent || '', 10));
    function colVals(colIndex: number): number[] {
        return rows.map((row) => parseInt(row.cells[colIndex].textContent || '', 10) || 0);
    }
    const series: Series[] = [
        { key: 'commits', cssVar: '--glow-a', z: -1.7, unit: 'commits to Umbraco-CMS', vals: colVals(1) },
        { key: 'other', cssVar: '--glow-b', z: 0, unit: 'merged pull requests to other projects', vals: colVals(2) },
        { key: 'own', cssVar: '--c-comm', z: 1.7, unit: 'merged pull requests to his own repositories', vals: colVals(3) }
    ];
    const MAXV = series.reduce((max, sr) => sr.vals.reduce((m, v) => Math.max(m, v), max), 1);
    const MAXH = 6.5, SPACING = 1.1, X0 = -(years.length - 1) * SPACING / 2;

    let renderer: WebGLRenderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        if (!renderer.getContext()) throw new Error('no context');
    } catch (e) { fallback(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.insertBefore(renderer.domElement, host.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(6, 12, 9);
    scene.add(sun);

    const group = new THREE.Group();
    scene.add(group);
    const grid = new THREE.GridHelper(17, 17, 0x888888, 0x888888);
    const gridMat = grid.material as Material & { color: Color };
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    group.add(grid);

    const bars: Mesh[] = [];
    series.forEach((sr) => {
        sr.mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
        sr.vals.forEach((v, i) => {
            if (!v) return;
            const h = Math.max(0.06, v / MAXV * MAXH);
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 0.7), sr.mat!.clone());
            m.position.set(X0 + i * SPACING, h / 2, sr.z);
            const data: BarData = { sr, year: years[i], val: v };
            m.userData = data;
            group.add(m);
            bars.push(m);
        });
    });

    /* year labels */
    const labelsEl = document.getElementById('c3d-labels') as HTMLElement;
    const labels = years.map((y, i) => {
        const el = document.createElement('span');
        el.textContent = String(y);
        labelsEl.appendChild(el);
        return { el, pos: new THREE.Vector3(X0 + i * SPACING, 0, 3.0) };
    });

    const DEF = { yaw: -0.5, pitch: 0.5 };
    let yaw = DEF.yaw, pitch = DEF.pitch, radius = 22, W = 1, H = 1;
    const target = new THREE.Vector3(0, 1.4, 0);
    let interacted = false, visible = false, pending = false, hovered: Mesh | null = null;
    const t0 = performance.now();

    function setCamera(extraYaw?: number) {
        const yw = yaw + (extraYaw || 0);
        camera.position.set(
            target.x + radius * Math.cos(pitch) * Math.sin(yw),
            target.y + radius * Math.sin(pitch),
            target.z + radius * Math.cos(pitch) * Math.cos(yw)
        );
        camera.lookAt(target);
    }

    function resize() {
        const r = host!.getBoundingClientRect();
        W = Math.max(200, Math.round(r.width));
        H = Math.max(200, Math.round(r.height));
        renderer.setSize(W, H, false);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.aspect = W / H;
        const hfov = 2 * Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect);
        radius = Math.max(19, 9.2 / Math.tan(hfov / 2));
        camera.updateProjectionMatrix();
        requestRender();
    }

    function render() {
        pending = false;
        const sway = (!reduce && !interacted && visible) ? Math.sin((performance.now() - t0) / 2600) * 0.14 : 0;
        setCamera(sway);
        renderer.render(scene, camera);
        const v = new THREE.Vector3();
        labels.forEach((l) => {
            v.copy(l.pos).project(camera);
            l.el.style.transform = 'translate(' + ((v.x * 0.5 + 0.5) * W - 14).toFixed(1) + 'px,' + ((-v.y * 0.5 + 0.5) * H).toFixed(1) + 'px)';
        });
        if (sway !== 0 || (!reduce && !interacted && visible)) requestRender();
    }
    function requestRender() { if (!pending) { pending = true; requestAnimationFrame(render); } }

    function readColors() {
        const cs = getComputedStyle(document.documentElement);
        series.forEach((sr) => {
            const c = cs.getPropertyValue(sr.cssVar).trim() || '#3544b1';
            sr.color = new THREE.Color(c);
        });
        bars.forEach((m) => {
            const d = m.userData as BarData;
            const mat = m.material as MeshStandardMaterial;
            mat.color.copy(d.sr.color!);
            mat.emissive.setHex(0x000000);
        });
        const gc = new THREE.Color((cs.getPropertyValue('--muted').trim()) || '#888888');
        gridMat.color.copy(gc);
        requestRender();
    }

    /* interaction */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tip = document.getElementById('c3d-tip') as HTMLElement;
    function pick(clientX: number, clientY: number): Mesh | null {
        const r = host!.getBoundingClientRect();
        mouse.x = ((clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const live = bars.filter((b) => b.visible);
        const hit = raycaster.intersectObjects(live, false)[0];
        return hit ? (hit.object as Mesh) : null;
    }
    function setHover(m: Mesh | null, clientX?: number, clientY?: number) {
        if (hovered && hovered !== m) (hovered.material as MeshStandardMaterial).emissive.setHex(0x000000);
        hovered = m;
        if (!m) { tip.hidden = true; requestRender(); return; }
        (m.material as MeshStandardMaterial).emissive.setHex(0x333333);
        const d = m.userData as BarData;
        tip.textContent = d.year + ': ' + d.val + ' ' + d.sr.unit;
        tip.hidden = false;
        const r = host!.getBoundingClientRect();
        const x = Math.min(Math.max(8, (clientX || 0) - r.left + 12), r.width - tip.offsetWidth - 8);
        const y = Math.max(8, (clientY || 0) - r.top - 36);
        tip.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        requestRender();
    }

    let down: { x: number; y: number; moved: boolean; type: string } | null = null;
    host.addEventListener('pointerdown', (e) => {
        down = { x: e.clientX, y: e.clientY, moved: false, type: e.pointerType };
        interacted = true;
        host.classList.add('drag');
        try { host.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    host.addEventListener('pointermove', (e) => {
        if (down) {
            const dx = e.clientX - down.x, dy = e.clientY - down.y;
            if (Math.abs(dx) + Math.abs(dy) > 4) down.moved = true;
            yaw = Math.max(-1.35, Math.min(1.35, yaw + dx * 0.008));
            if (down.type === 'mouse' || down.type === 'pen') pitch = Math.max(0.12, Math.min(1.25, pitch + dy * 0.006));
            down.x = e.clientX; down.y = e.clientY;
            requestRender();
        } else if (e.pointerType === 'mouse') {
            setHover(pick(e.clientX, e.clientY), e.clientX, e.clientY);
        }
    });
    function end(e: PointerEvent) {
        if (down && !down.moved) setHover(pick(e.clientX, e.clientY), e.clientX, e.clientY);
        down = null;
        host!.classList.remove('drag');
    }
    host.addEventListener('pointerup', end);
    host.addEventListener('pointercancel', () => { down = null; host.classList.remove('drag'); });
    host.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !down) setHover(null); });
    host.addEventListener('keydown', (e) => {
        const k = e.key;
        let used = true;
        if (k === 'ArrowLeft') yaw = Math.max(-1.35, yaw - 0.1);
        else if (k === 'ArrowRight') yaw = Math.min(1.35, yaw + 0.1);
        else if (k === 'ArrowUp') pitch = Math.min(1.25, pitch + 0.08);
        else if (k === 'ArrowDown') pitch = Math.max(0.12, pitch - 0.08);
        else if (k === 'Home') { yaw = DEF.yaw; pitch = DEF.pitch; }
        else used = false;
        if (used) { e.preventDefault(); interacted = true; requestRender(); }
    });

    /* series toggles and reset */
    document.querySelectorAll<HTMLButtonElement>('#c3d-toggles button[data-key]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const on = btn.getAttribute('aria-pressed') !== 'true';
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            bars.forEach((m) => { if ((m.userData as BarData).sr.key === btn.getAttribute('data-key')) m.visible = on; });
            setHover(null);
            requestRender();
        });
    });
    const reset = document.getElementById('c3d-reset');
    if (reset) reset.addEventListener('click', () => { yaw = DEF.yaw; pitch = DEF.pitch; interacted = true; requestRender(); });

    /* only sway while on screen */
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) requestRender(); }, { threshold: 0.2 }).observe(host);
    } else { visible = true; }

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    window.addEventListener('resize', resize);

    readColors();
    resize();
    render();
})();

export {};
