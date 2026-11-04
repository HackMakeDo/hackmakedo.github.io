/* WebGL contour-line background, drifting with scroll position.
 *
 * How it works, in short: a full-screen shader samples a noise field (built by
 * layering several "fractal Brownian motion" octaves, the same technique used
 * to generate realistic-looking terrain) and draws contour lines wherever that
 * field crosses certain thresholds — the same trick a topographic map uses to
 * turn continuous elevation data into discrete lines. The noise field is also
 * "domain warped" (bent by a second, independent noise field) so the lines
 * flow and curl instead of looking like a flat grid. Scroll position shifts
 * which part of the field is sampled, and blends between the site's two
 * accent colors as you scroll.
 */
(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const documentRoot = document.documentElement;

    const canvas = document.getElementById('field') as HTMLCanvasElement | null;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    /* The vertex shader just passes through a triangle big enough to cover the
       whole canvas; all the actual drawing happens per-pixel in the fragment
       shader below. */
    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;

        uniform vec2 resolution;      // canvas size in pixels
        uniform float time;           // seconds since start, drives the drift animation
        uniform float scrollProgress; // 0 (top of page) to 1 (bottom); shifts the sampled area
        uniform vec3 backgroundColor;
        uniform vec3 colorA;          // the site's first accent color (--glow-a)
        uniform vec3 colorB;          // the site's second accent color (--glow-b)

        // Pseudo-random hash: turns a 2D point into a "random" number between
        // 0 and 1. Meaningless on its own — it's just the seed for the noise
        // functions below.
        float hash(vec2 point) {
            return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
        }

        // Value noise: smoothly blends between random values at the four
        // corners of a grid cell, giving smooth "blobby" randomness instead
        // of the static hash() alone produces.
        float valueNoise(vec2 point) {
            vec2 cell = floor(point);
            vec2 withinCell = fract(point);
            withinCell = withinCell * withinCell * (3.0 - 2.0 * withinCell); // ease the blend curve
            return mix(
                mix(hash(cell), hash(cell + vec2(1.0, 0.0)), withinCell.x),
                mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), withinCell.x),
                withinCell.y
            );
        }

        // Fractal Brownian motion: layers several octaves of valueNoise at
        // increasing frequency and decreasing strength, the way real terrain
        // has large hills with smaller bumps on top. This is what gives the
        // background its organic, map-like texture instead of a single blurry
        // blob.
        float fractalNoise(vec2 point) {
            float total = 0.0;
            float amplitude = 0.5;
            for (int octave = 0; octave < 5; octave++) {
                total += amplitude * valueNoise(point);
                point = point * 2.03 + vec2(1.7, 9.2);
                amplitude *= 0.5;
            }
            return total;
        }

        void main() {
            // Dividing by resolution.y (not .x) keeps the pattern's
            // proportions correct regardless of the window's aspect ratio.
            vec2 screenUV = gl_FragCoord.xy / resolution.y;
            float scaledTime = time * 0.035; // slows the drift to a gentle pace

            // Where in the noise field this pixel samples from. Shifting by
            // scrollProgress is what makes the pattern move as the page
            // scrolls.
            vec2 samplePos = screenUV * 1.5 + vec2(0.0, scrollProgress * 2.4);

            // "Domain warping": sample fractalNoise twice, offset in time, and
            // use the result to bend the main sample position below. Without
            // this the pattern would look like a static noise grid; with it,
            // the lines appear to flow.
            vec2 domainWarp = vec2(
                fractalNoise(samplePos + scaledTime),
                fractalNoise(samplePos + vec2(5.2, 1.3) - scaledTime)
            );
            float fieldValue = fractalNoise(samplePos + 2.1 * domainWarp);

            // Extract contour lines from the field: fieldValue repeats in
            // bands (like elevation bands on a map), and a pixel counts as
            // "on a line" when it sits near the edge of one of those bands.
            float distanceFromContourLine = abs(fract(fieldValue * 11.0) - 0.5);
            float lineStrength = 1.0 - smoothstep(0.0, 0.055, distanceFromContourLine);

            // Blend the two accent colors two different ways (one each
            // direction), so the line color shifts with both scroll position
            // and the noise field itself.
            vec3 gradientStart = mix(colorA, colorB, scrollProgress);
            vec3 gradientEnd = mix(colorB, colorA, scrollProgress);
            vec3 lineColor = mix(gradientStart, gradientEnd, smoothstep(0.25, 0.75, fieldValue));

            // A soft decorative glow near the top-right of the screen.
            float glow = exp(-length(screenUV - vec2(resolution.x / resolution.y * 0.9, 0.85)) * 1.6);

            vec3 finalColor = backgroundColor + lineColor * lineStrength * 0.2 + gradientStart * glow * 0.1;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function compileShader(type: number, source: string): WebGLShader {
        const shader = gl!.createShader(type)!;
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    /* A single triangle, oversized so it covers the whole canvas — the
       cheapest way to get a full-screen quad for the fragment shader to run
       against. */
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const uniformLocations: Record<string, WebGLUniformLocation | null> = {};
    ['resolution', 'time', 'scrollProgress', 'backgroundColor', 'colorA', 'colorB'].forEach((name) => {
        uniformLocations[name] = gl!.getUniformLocation(program, name);
    });

    /* Converts a CSS hex color (e.g. "#ffb1a4") into the [r, g, b] 0-1 range
       WebGL uniforms expect. */
    function hexToRgb(hexColor: string): [number, number, number] {
        let hex = (hexColor || '').trim().replace('#', '');
        if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
        const parsed = parseInt(hex, 16);
        if (isNaN(parsed)) return [0, 0, 0];
        return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
    }

    let themeColors: { background: [number, number, number]; colorA: [number, number, number]; colorB: [number, number, number] } | null = null;
    let scrollProgress = 0;

    /* Re-reads the site's theme colors from CSS, so the background always
       matches the rest of the page even if the palette changes. */
    function readThemeColors() {
        const computedStyle = getComputedStyle(documentRoot);
        themeColors = {
            background: hexToRgb(computedStyle.getPropertyValue('--bg')),
            colorA: hexToRgb(computedStyle.getPropertyValue('--glow-a')),
            colorB: hexToRgb(computedStyle.getPropertyValue('--glow-b'))
        };
        if (prefersReducedMotion) draw(0);
    }

    function resizeCanvas() {
        /* Renders at a reduced resolution (pixel ratio capped, then scaled
           down further) since this is a full-screen animated background and
           full native resolution would be wasted on something this subtle. */
        const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
        canvas!.width = Math.max(2, Math.floor(window.innerWidth * scale));
        canvas!.height = Math.max(2, Math.floor(window.innerHeight * scale));
        gl!.viewport(0, 0, canvas!.width, canvas!.height);
        if (prefersReducedMotion) draw(0);
    }

    function updateScrollProgress() {
        const viewportHeight = window.innerHeight;
        const maxScrollY = document.documentElement.scrollHeight - viewportHeight;
        scrollProgress = maxScrollY > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScrollY)) : 0;
        if (prefersReducedMotion) draw(0);
    }

    function draw(elapsedMs: number) {
        if (!themeColors) return;
        gl!.uniform2f(uniformLocations.resolution, canvas!.width, canvas!.height);
        gl!.uniform1f(uniformLocations.time, prefersReducedMotion ? 0 : elapsedMs / 1000);
        gl!.uniform1f(uniformLocations.scrollProgress, scrollProgress);
        gl!.uniform3fv(uniformLocations.backgroundColor, themeColors.background);
        gl!.uniform3fv(uniformLocations.colorA, themeColors.colorA);
        gl!.uniform3fv(uniformLocations.colorB, themeColors.colorB);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    function animationFrame(elapsedMs: number) {
        draw(elapsedMs);
        if (!document.hidden) requestAnimationFrame(animationFrame);
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', resizeCanvas);

    readThemeColors();
    resizeCanvas();
    updateScrollProgress();
    if (!prefersReducedMotion) {
        requestAnimationFrame(animationFrame);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(animationFrame); });
    } else {
        draw(0);
    }
})();
