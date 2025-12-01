/**
 * Example Showcase Component
 * Renders interactive examples with tabs, supporting text, images, and embeds
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('example-showcase');
    if (!container) return;

    fetch('./assets/data/examples.json')
        .then(response => response.json())
        .then(data => {
            renderExamples(container, data.examples);
            setupTabInteraction(container);
        })
        .catch(error => console.error('Error loading examples:', error));
});

/**
 * Simple Markdown parser for reasoning text
 * Supports: **bold**, *italic*, `code`, ```code blocks```, tables, and paragraphs
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
        return `%%%CODEBLOCK%%%<pre><code>${code.trim()}</code></pre>%%%ENDCODEBLOCK%%%`;
    });
    
    // Tables - detect and convert markdown tables
    html = html.replace(/(\|[^\n]+\|\n)(\|[-:| ]+\|\n)((?:\|[^\n]+\|\n?)+)/g, (match, headerRow, separator, bodyRows) => {
        // Parse header
        const headers = headerRow.trim().split('|').filter(cell => cell.trim());
        const headerHtml = headers.map(h => `<th>${h.trim()}</th>`).join('');
        
        // Parse body rows
        const rows = bodyRows.trim().split('\n').filter(row => row.trim());
        const bodyHtml = rows.map(row => {
            const cells = row.split('|').filter(cell => cell !== '');
            const cellsHtml = cells.map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cellsHtml}</tr>`;
        }).join('');
        
        return `%%%TABLE%%%<table class="md-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>%%%ENDTABLE%%%`;
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
            // Don't wrap special blocks in p tags
            if (para.includes('%%%CODEBLOCK%%%') || para.includes('%%%TABLE%%%')) {
                return para;
            }
            // Convert single newlines to <br> within paragraphs
            return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
    
    // Clean up markers
    html = html.replace(/%%%CODEBLOCK%%%|%%%ENDCODEBLOCK%%%|%%%TABLE%%%|%%%ENDTABLE%%%/g, '');
    
    return html;
}

/**
 * Render all examples into the container
 */
function renderExamples(container, examples) {
    // Build tabs HTML
    const tabsHtml = examples.map((ex, index) => `
        <button class="example-tab${index === 0 ? ' active' : ''}" data-example="${ex.id}">
            ${ex.title}
        </button>
    `).join('');

    // Build panels HTML
    const panelsHtml = examples.map((ex, index) => `
        <div class="example-panel${index === 0 ? ' active' : ''}" data-example="${ex.id}">
            ${renderContent(ex)}
            <div class="example-answer">
                <span class="answer-icon">✓</span>
                <span class="answer-label">Answer:</span>
                <span class="answer-value">${escapeHtml(ex.answer)}</span>
            </div>
            <!--<details class="example-reasoning">
                <summary>
                    <span class="reasoning-toggle-icon"></span>
                    Show explanation
                </summary>
                <div class="reasoning-content">
                    ${parseMarkdown(ex.reasoning)}
                </div>
            </details>-->
        </div>
    `).join('');

    container.innerHTML = `
        <div class="example-tabs-wrapper">
            <div class="example-tabs">
                ${tabsHtml}
            </div>
        </div>
        <div class="example-panels">
            ${panelsHtml}
        </div>
    `;
}

/**
 * Render content based on type (text, image, embed)
 */
function renderContent(example) {
    const content = example.content;
    
    switch (example.type) {
        case 'text':
            return `
                <div class="example-content example-content-text">
                    <p class="example-question">${sanitizeHtml(content.question)}</p>
                </div>
            `;
        
        case 'image':
            const imagesHtml = content.images.map(img => `
                <figure class="example-figure">
                    <img src="${img.src}" alt="${escapeHtml(img.alt || '')}" class="example-image" loading="lazy">
                    ${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ''}
                </figure>
            `).join('');
            
            return `
                <div class="example-content example-content-image">
                    <div class="example-images ${content.images.length > 1 ? 'multiple' : ''}">
                        ${imagesHtml}
                    </div>
                    ${content.question ? `<p class="example-question">${sanitizeHtml(content.question)}</p>` : ''}
                </div>
            `;
        
        case 'embed':
            // Direct load iframe - responsive width, fixed height
            // Support embedPosition: 'top' to show iframe before question
            const embedHtml = `
                <div class="example-embed">
                    <iframe 
                        src="${content.url}" 
                        style="height: ${content.height || 400}px;"
                        frameborder="0"
                        loading="lazy"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
            const questionHtml = content.question ? `<p class="example-question">${sanitizeHtml(content.question)}</p>` : '';
            
            const showEmbedFirst = content.embedPosition === 'top';
            
            return `
                <div class="example-content example-content-embed">
                    ${showEmbedFirst ? embedHtml + questionHtml : questionHtml + embedHtml}
                </div>
            `;
        
        default:
            return '<div class="example-content">Unknown content type</div>';
    }
}

/**
 * Setup tab click handlers and embed lazy loading
 */
function setupTabInteraction(container) {
    const tabs = container.querySelectorAll('.example-tab');
    const panels = container.querySelectorAll('.example-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const exampleId = tab.getAttribute('data-example');
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const activePanel = container.querySelector(`.example-panel[data-example="${exampleId}"]`);
            if (activePanel) {
                activePanel.classList.add('active');
            }
        });
    });
    
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitize HTML but allow safe tags (a, em, strong, br)
 */
function sanitizeHtml(text) {
    if (!text) return '';
    
    // First escape everything
    let sanitized = escapeHtml(text);
    
    // Then unescape safe tags
    sanitized = sanitized.replace(/&lt;a\s+href=&quot;([^&]+)&quot;(\s+target=&quot;[^&]+&quot;)?(\s+rel=&quot;[^&]+&quot;)?&gt;/g, 
        '<a href="$1"$2$3>');
    sanitized = sanitized.replace(/&lt;\/a&gt;/g, '</a>');
    sanitized = sanitized.replace(/&lt;em&gt;/g, '<em>');
    sanitized = sanitized.replace(/&lt;\/em&gt;/g, '</em>');
    sanitized = sanitized.replace(/&lt;strong&gt;/g, '<strong>');
    sanitized = sanitized.replace(/&lt;\/strong&gt;/g, '</strong>');
    sanitized = sanitized.replace(/&lt;br&gt;/g, '<br>');
    
    // Convert double newlines to paragraph breaks (br with margin)
    sanitized = sanitized.replace(/\n\n+/g, '<br style="display: block; margin: 0.8em 0; content: \' \';">');
    // Convert single newlines to simple br
    sanitized = sanitized.replace(/\n/g, '<br>');
    
    return sanitized;
}

