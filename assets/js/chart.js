// Performance Bar Chart
// Renders a horizontal bar chart from data.json

(function() {
    const LOGO_MAP = {
        'Anthropic': 'anthropic.png',
        'OpenAI': 'openai.png',
        'Google': 'google.png',
        'Meta': 'meta.png',
        'DeepSeek': 'deepseek.png',
        'Alibaba': 'alibaba.png'
    };

    async function loadData() {
        try {
            const response = await fetch('./assets/data/data.json');
            return await response.json();
        } catch (error) {
            console.error('Failed to load chart data:', error);
            return [];
        }
    }

    function createBarChart(data, container) {
        // Sort by pass_rate descending
        const sortedData = [...data].sort((a, b) => b.pass_rate - a.pass_rate);
        const maxRate = Math.max(...sortedData.map(d => d.pass_rate));

        const chartHTML = sortedData.map((item, index) => {
            const logoFile = LOGO_MAP[item.organization] || '';
            const logoSrc = logoFile ? `./assets/logos/${logoFile}` : '';
            const barWidth = (item.pass_rate / 100) * 100; // percentage width
            const delay = index * 0.08; // stagger animation

            return `
                <div class="bar-row" style="--delay: ${delay}s">
                    <div class="bar-label">
                        ${logoSrc ? `<img src="${logoSrc}" alt="${item.organization}" class="bar-logo">` : ''}
                        <span class="bar-model-name">${item.model}</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill" style="--target-width: ${barWidth}%"></div>
                        <span class="bar-value">${item.pass_rate}%</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = chartHTML;

        // Trigger animation after a short delay
        requestAnimationFrame(() => {
            container.classList.add('animate');
        });
    }

    async function init() {
        const container = document.getElementById('performance-chart');
        if (!container) return;

        const data = await loadData();
        if (data.length > 0) {
            createBarChart(data, container);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

