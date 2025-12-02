/**
 * Solution Gallery Component
 * Displays model solutions for each example with pass/fail indicators
 * Collapsible solution content
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('solution-gallery');
    if (!container) return;

    fetch('./assets/data/examples.json')
        .then(response => response.json())
        .then(data => {
            renderGallery(container, data.examples);
            setupGalleryInteraction(container);
        })
        .catch(error => console.error('Error loading gallery data:', error));
});

/**
 * Get model logo path by keyword matching
 */
function getModelLogo(modelName) {
    const name = modelName.toLowerCase();
    
    if (name.includes('gpt') || name.includes('openai') || name.includes('o1-') || name.includes('o3-')) {
        return './assets/logos/openai.png';
    }
    if (name.includes('claude') || name.includes('anthropic')) {
        return './assets/logos/anthropic.png';
    }
    if (name.includes('gemini') || name.includes('google')) {
        return './assets/logos/google.png';
    }
    if (name.includes('llama') || name.includes('meta')) {
        return './assets/logos/meta.png';
    }
    if (name.includes('deepseek')) {
        return './assets/logos/deepseek.png';
    }
    if (name.includes('qwen') || name.includes('alibaba')) {
        return './assets/logos/alibaba.png';
    }
    
    return null;
}

/**
 * Get ordered list of models (consistent ordering)
 * Each entry can be a string (model name) or object with {name, subtitle, key}
 * - name: display name
 * - subtitle: optional subtitle (e.g., "extended thinking")
 * - key: optional key for looking up in model_solutions (defaults to name)
 */
function getModelOrder() {
    return [
        'ChatGPT Agent',
        { name: 'Gemini-3 Pro', subtitle: 'Thinking', key: 'Gemini-3 Pro Thinking' },
        { name: 'GPT-5.1', subtitle: 'thinking extended', key: 'GPT-5.1' },
        'Claude-Opus-4.5',
        'OpenAI Deep Research',
        { name: 'Gemini-3 Pro', subtitle: 'Thinking + DeepResearch', key: 'Gemini-3 Pro Thinking + DeepResearch' }
    ];
}

/**
 * Parse model entry from getModelOrder()
 * @returns {Object} {name, subtitle, key}
 */
function parseModelEntry(entry) {
    if (typeof entry === 'string') {
        return { name: entry, subtitle: null, key: entry };
    }
    return {
        name: entry.name,
        subtitle: entry.subtitle || null,
        key: entry.key || entry.name
    };
}

/**
 * Render model name with optional subtitle
 */
function renderModelNameGroup(name, subtitle) {
    const subtitleHtml = subtitle 
        ? `<span class="model-subtitle">${subtitle}</span>` 
        : '';
    
    return `
        <span class="model-name-group">
            <span class="model-main-name">${name}</span>
            ${subtitleHtml}
        </span>
    `;
}

/**
 * Simple Markdown parser for solution text
 */
function parseMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Code blocks (must be before inline code)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        return `%%%CODEBLOCK%%%<pre class="gallery-code"><code>${code.trim()}</code></pre>%%%ENDCODEBLOCK%%%`;
    });
    
    // Tables - detect and convert markdown tables
    html = html.replace(/(\|[^\n]+\|\n)(\|[-:| ]+\|\n)((?:\|[^\n]+\|\n?)+)/g, (match, headerRow, separator, bodyRows) => {
        const headers = headerRow.trim().split('|').filter(cell => cell.trim());
        const headerHtml = headers.map(h => `<th>${h.trim()}</th>`).join('');
        
        const rows = bodyRows.trim().split('\n').filter(row => row.trim());
        const bodyHtml = rows.map(row => {
            const cells = row.split('|').filter(cell => cell !== '');
            const cellsHtml = cells.map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cellsHtml}</tr>`;
        }).join('');
        
        return `%%%TABLE%%%<table class="gallery-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>%%%ENDTABLE%%%`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Paragraphs (split by double newline)
    html = html
        .split(/\n\n+/)
        .map(para => {
            para = para.trim();
            if (!para) return '';
            if (para.includes('%%%CODEBLOCK%%%') || para.includes('%%%TABLE%%%')) {
                return para;
            }
            return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
    
    // Clean up markers
    html = html.replace(/%%%CODEBLOCK%%%|%%%ENDCODEBLOCK%%%|%%%TABLE%%%|%%%ENDTABLE%%%/g, '');
    
    return html;
}

/**
 * Render the gallery grid and solution panel
 */
function renderGallery(container, examples) {
    const modelEntries = getModelOrder();
    
    // Build header row with example titles
    const headerCells = examples.map(ex => 
        `<th class="gallery-example-header" title="${ex.title}">${ex.title}</th>`
    ).join('');
    
    // Build model rows
    const modelRows = modelEntries.map(entry => {
        const { name, subtitle, key } = parseModelEntry(entry);
        
        const cells = examples.map(ex => {
            const solution = ex.model_solutions?.[key];
            if (!solution) {
                return `<td class="gallery-cell"><span class="result-block-mini na" title="N/A"></span></td>`;
            }
            const statusClass = solution.status === 'pass' ? 'pass' : 'fail';
            const displayName = subtitle ? `${name} (${subtitle})` : name;
            return `
                <td class="gallery-cell">
                    <button class="result-block-mini ${statusClass}" 
                            data-example-id="${ex.id}" 
                            data-model="${key}"
                            title="${displayName} - ${ex.title}: ${solution.status === 'pass' ? 'Pass' : 'Fail'}">
                    </button>
                </td>
            `;
        }).join('');
        
        const logoPath = getModelLogo(name);
        const logoHtml = logoPath ? `<img src="${logoPath}" alt="" class="gallery-model-logo">` : '';
        
        return `
            <tr class="gallery-model-row">
                <td class="gallery-model-cell">
                    <span class="gallery-model-cell-inner">
                        ${logoHtml}
                        ${renderModelNameGroup(name, subtitle)}
                    </span>
                </td>
                ${cells}
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="gallery-container">
            <div class="gallery-grid-wrapper">
                <table class="gallery-grid">
                    <thead>
                        <tr>
                            <th class="gallery-model-header">Model</th>
                            ${headerCells}
                        </tr>
                    </thead>
                    <tbody>
                        ${modelRows}
                    </tbody>
                </table>
            </div>
            <div class="gallery-legend">
                <div class="gallery-legend-left">
                    <span class="gallery-legend-swatch pass"></span>
                    <span class="gallery-legend-label">Pass</span>
                    <span class="gallery-legend-swatch fail"></span>
                    <span class="gallery-legend-label">Fail</span>
                </div>
                <div class="gallery-legend-text">
                    Click any colored square to inspect that model&rsquo;s solution below.
                </div>
            </div>
            <div class="gallery-solution-panel" id="gallery-solution-panel">
                <!-- Will be populated with first selection -->
            </div>
        </div>
    `;
    
    // Store examples data for later use
    container._examples = examples;
}

/**
 * Setup click handlers for result blocks
 */
function setupGalleryInteraction(container) {
    const blocks = container.querySelectorAll('.result-block-mini[data-example-id]');
    const panel = container.querySelector('#gallery-solution-panel');
    const examples = container._examples;
    
    let activeBlock = null;
    
    // Helper function to select a block
    // @param {boolean} openByDefault - Whether to open the solution panel (default: false)
    function selectBlock(block, openByDefault = false) {
        const exampleId = parseInt(block.getAttribute('data-example-id'));
        const modelName = block.getAttribute('data-model');
        
        // Remove active from previous
        if (activeBlock) {
            activeBlock.classList.remove('active');
        }
        
        // Set new active
        block.classList.add('active');
        activeBlock = block;
        
        // Find example and solution
        const example = examples.find(ex => ex.id === exampleId);
        if (!example) return;
        
        const solution = example.model_solutions?.[modelName];
        if (!solution) return;
        
        // Render solution
        renderSolution(panel, example, modelName, solution, openByDefault);
    }
    
    blocks.forEach(block => {
        block.addEventListener('click', () => {
            const exampleId = parseInt(block.getAttribute('data-example-id'));
            const modelName = block.getAttribute('data-model');
            
            // Toggle active state
            if (activeBlock === block) {
                // Clicking same block - just toggle the details
                const details = panel.querySelector('.solution-details');
                if (details) {
                    details.open = !details.open;
                }
                return;
            }
            
            // Select the new block
            selectBlock(block);
        });
    });
    
    // Auto-select first cell on load and open the solution panel
    if (blocks.length > 0) {
        selectBlock(blocks[0], true);
    }
}


/**
 * Render solution in panel with collapsible content
 * @param {boolean} isOpen - Whether details should be open (default: false)
 */
function renderSolution(panel, example, modelKey, solution, isOpen = false) {
    // Find model entry to get display name and subtitle
    const modelEntries = getModelOrder();
    const entry = modelEntries.find(e => {
        const { key } = parseModelEntry(e);
        return key === modelKey;
    });
    const { name, subtitle } = entry ? parseModelEntry(entry) : { name: modelKey, subtitle: null };
    
    const statusClass = solution.status === 'pass' ? 'pass' : 'fail';
    const statusIcon = solution.status === 'pass' ? '✓' : '✗';
    const statusText = solution.status === 'pass' ? 'Pass' : 'Fail';
    const logoPath = getModelLogo(name);
    const logoHtml = logoPath ? `<img src="${logoPath}" alt="">` : '';
    const openAttr = isOpen ? ' open' : '';
    
    const linkHtml = solution.link 
        ? `<a href="${solution.link}" target="_blank" rel="noopener" class="solution-link">View solution details →</a>` 
        : '';
    
    panel.innerHTML = `
        <details class="solution-details"${openAttr}>
            <summary class="solution-toggle">
                <div class="solution-toggle-left">
                    ${logoHtml}
                    ${renderModelNameGroup(name, subtitle)}
                    <span class="solution-separator">·</span>
                    <span class="solution-example-title">${example.title}</span>
                </div>
                <span class="solution-status ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    ${statusText}
                </span>
                <span class="toggle-icon"></span>
            </summary>
            <div class="solution-content">
                ${parseMarkdown(solution.solution)}
                ${linkHtml}
            </div>
        </details>
    `;
}

