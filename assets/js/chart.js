// Performance figures: Existing Agents & Cocoa-Agent
(function () {

    const EXISTING_AGENTS = [
        { name: 'Codex',                sub: 'GPT-5.4',           score: 45.1 },
        { name: 'OpenClaw',             sub: 'GPT-5.4',           score: 45.1 },
        { name: 'OpenClaw',             sub: 'Claude Sonnet 4.6', score: 34.0 },
        { name: 'ChatGPT Agent',        sub: null,                 score: 26.8 },
        { name: 'Claude Code',          sub: 'Claude Sonnet 4.6',  score: 25.5 },
        { name: 'OpenAI Deep Research', sub: 'o4-mini',             score:  3.3 },
    ];

    const COCOA_AGENTS = [
        { name: 'GPT-5.4',           sub: null, score: 36.6 },
        { name: 'Gemini-3.1-pro',    sub: null, score: 30.7 },
        { name: 'Gemini-Flash-3.0',  sub: null, score: 19.6 },
        { name: 'Claude Sonnet 4.6', sub: null, score: 15.7 },
        { name: 'Kimi-k2.5',         sub: null, score: 11.5 },
        { name: 'Qwen3.5-397B-A13B', sub: null, score:  9.8 },
    ];

    const MAX_SCORE = 100;

    // Interpolate between light cocoa and dark cocoa based on score
    // Low score → light (#D7CCC8), High score → dark (#3E2723)
    function scoreToColor(score) {
        const t = Math.max(0, Math.min(1, score / MAX_SCORE));
        const light = [215, 204, 200]; // #D7CCC8
        const dark  = [ 62,  39,  35]; // #3E2723
        const r = Math.round(light[0] + t * (dark[0] - light[0]));
        const g = Math.round(light[1] + t * (dark[1] - light[1]));
        const b = Math.round(light[2] + t * (dark[2] - light[2]));
        return `rgb(${r},${g},${b})`;
    }

    function injectStyles() {
        if (document.getElementById('perf-figure-styles')) return;
        const style = document.createElement('style');
        style.id = 'perf-figure-styles';
        style.textContent = `
.perf-figure-wrap {
    margin: 16px 0 32px;
    padding: 24px 28px;
    background: #F5EFE9;
    border-radius: 10px;
    font-family: var(--font-main);
}

.perf-axis-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 4px;
}

.perf-axis-spacer {
    flex-shrink: 0;
    width: 200px;
}

.perf-axis-ticks {
    flex: 1;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
}

.perf-axis-tick {
    font-family: Manrope, sans-serif;
    font-size: 11px;
    color: #bbb;
    min-width: 24px;
    text-align: center;
}

.perf-axis-tick:first-child { text-align: left; }
.perf-axis-tick:last-child  { text-align: right; }

.perf-score-spacer {
    flex-shrink: 0;
    width: 42px;
}

.perf-bar-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid #f0f0f0;
}

.perf-bar-row:last-child {
    border-bottom: none;
}

.perf-bar-label {
    flex-shrink: 0;
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}

.perf-model-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.perf-model-sub {
    font-size: 11px;
    color: #aaa;
    white-space: nowrap;
    line-height: 1.3;
}

.perf-bar-track {
    flex: 1;
    height: 22px;
    background: #e8dfd8;
    border-radius: 4px;
    overflow: hidden;
}

.perf-bar-fill {
    height: 100%;
    border-radius: 4px;
    width: 0;
    transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: var(--delay, 0s);
}

.perf-figure-wrap.animate .perf-bar-fill {
    width: var(--target-width);
}

.perf-bar-score {
    flex-shrink: 0;
    width: 42px;
    text-align: right;
    font-family: Manrope, sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #7a6057;
}

@media (max-width: 560px) {
    .perf-axis-spacer { width: 130px; }
    .perf-bar-label   { width: 130px; }
    .perf-model-name  { font-size: 12.5px; }
}
        `;
        document.head.appendChild(style);
    }

    function buildFigure(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Axis row
        const axisRow = document.createElement('div');
        axisRow.className = 'perf-axis-row';

        const spacer = document.createElement('div');
        spacer.className = 'perf-axis-spacer';

        const ticks = document.createElement('div');
        ticks.className = 'perf-axis-ticks';
        ['0%', '25%', '50%', '75%', '100%'].forEach(t => {
            const tick = document.createElement('div');
            tick.className = 'perf-axis-tick';
            tick.textContent = t;
            ticks.appendChild(tick);
        });

        const scoreSpacer = document.createElement('div');
        scoreSpacer.className = 'perf-score-spacer';

        axisRow.appendChild(spacer);
        axisRow.appendChild(ticks);
        axisRow.appendChild(scoreSpacer);
        container.appendChild(axisRow);

        // Bar rows
        data.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = 'perf-bar-row';

            const color = scoreToColor(item.score);
            const targetWidth = (item.score / MAX_SCORE) * 100;
            const delay = i * 0.08;

            // Label
            const label = document.createElement('div');
            label.className = 'perf-bar-label';
            label.title = item.name + (item.sub ? ' · ' + item.sub : '');

            const nameEl = document.createElement('div');
            nameEl.className = 'perf-model-name';
            nameEl.textContent = item.name;
            label.appendChild(nameEl);

            if (item.sub) {
                const subEl = document.createElement('div');
                subEl.className = 'perf-model-sub';
                subEl.textContent = item.sub;
                label.appendChild(subEl);
            }

            // Bar
            const track = document.createElement('div');
            track.className = 'perf-bar-track';

            const fill = document.createElement('div');
            fill.className = 'perf-bar-fill';
            fill.style.setProperty('--target-width', targetWidth + '%');
            fill.style.setProperty('--delay', delay + 's');
            fill.style.background = color;
            track.appendChild(fill);

            // Score
            const score = document.createElement('div');
            score.className = 'perf-bar-score';
            score.textContent = item.score + '%';

            row.appendChild(label);
            row.appendChild(track);
            row.appendChild(score);
            container.appendChild(row);
        });

        // Animate on scroll into view
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => container.classList.add('animate'));
                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.2 });
        observer.observe(container);
    }

    function init() {
        injectStyles();
        buildFigure('chart-existing', EXISTING_AGENTS);
        buildFigure('chart-cocoa', COCOA_AGENTS);
    }

    // Exposed for reuse in other pages (e.g. blog)
    window.buildPerfFigure = function (containerId, dataset) {
        injectStyles();
        buildFigure(containerId, dataset === 'existing' ? EXISTING_AGENTS : COCOA_AGENTS);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
