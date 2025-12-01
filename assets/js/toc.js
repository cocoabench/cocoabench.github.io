/**
 * Table of Contents (TOC) Auto-generator
 * - Desktop: Sticky sidebar on the right
 * - Mobile: Floating button with drawer
 * - Auto-generates from h2, h3, h4 headings
 * - Highlights current section on scroll
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        headingSelector: 'h2, h3, h4',
        containerSelector: '.container',
        minHeadings: 3,  // Minimum headings to show TOC
        scrollOffset: 100,  // Offset for scroll position detection
        smoothScrollOffset: 80  // Offset when clicking TOC link
    };

    // Skip certain headings (e.g., inside special components)
    const SKIP_SELECTORS = [
        '.example-showcase h2',
        '.example-showcase h3',
        '.example-showcase h4'
    ];

    /**
     * Generate a URL-friendly slug from text
     */
    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')  // Keep Chinese characters
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    /**
     * Collect all headings from the page
     */
    function collectHeadings() {
        const container = document.querySelector(CONFIG.containerSelector);
        if (!container) return [];

        const allHeadings = container.querySelectorAll(CONFIG.headingSelector);
        const headings = [];

        allHeadings.forEach((heading, index) => {
            // Skip headings inside certain components
            const shouldSkip = SKIP_SELECTORS.some(selector => 
                heading.matches(selector) || heading.closest(selector.split(' ')[0])?.querySelector(selector.split(' ').slice(1).join(' '))
            );
            
            // More accurate skip check
            let skip = false;
            for (const sel of SKIP_SELECTORS) {
                if (heading.closest('.example-showcase')) {
                    skip = true;
                    break;
                }
            }
            
            if (skip) return;

            // Generate or use existing ID
            if (!heading.id) {
                const baseSlug = slugify(heading.textContent);
                let slug = baseSlug;
                let counter = 1;
                
                // Ensure unique ID
                while (document.getElementById(slug)) {
                    slug = `${baseSlug}-${counter++}`;
                }
                heading.id = slug || `heading-${index}`;
            }

            const level = parseInt(heading.tagName.charAt(1));
            headings.push({
                id: heading.id,
                text: heading.textContent.trim(),
                level: level,
                element: heading
            });
        });

        return headings;
    }

    /**
     * Build nested TOC structure
     */
    function buildTocHtml(headings) {
        if (headings.length === 0) return '';

        let html = '<ul class="toc-list">';
        let prevLevel = headings[0].level;
        let openLists = 0;

        headings.forEach((heading, index) => {
            const levelDiff = heading.level - prevLevel;

            if (levelDiff > 0) {
                // Going deeper - open nested lists
                for (let i = 0; i < levelDiff; i++) {
                    html += '<ul class="toc-sublist">';
                    openLists++;
                }
            } else if (levelDiff < 0) {
                // Going up - close nested lists
                for (let i = 0; i < Math.abs(levelDiff) && openLists > 0; i++) {
                    html += '</ul></li>';
                    openLists--;
                }
            } else if (index > 0) {
                html += '</li>';
            }

            html += `<li class="toc-item toc-level-${heading.level}">
                <a href="#${heading.id}" class="toc-link" data-id="${heading.id}">${heading.text}</a>`;
            
            prevLevel = heading.level;
        });

        // Close remaining lists
        html += '</li>';
        for (let i = 0; i < openLists; i++) {
            html += '</ul></li>';
        }
        html += '</ul>';

        return html;
    }

    /**
     * Create the TOC sidebar element (Notion-style with progress indicator)
     */
    function createTocSidebar(tocHtml, headings) {
        const sidebar = document.createElement('aside');
        sidebar.className = 'toc-sidebar';
        
        // Create progress indicators (one line per heading)
        const indicators = headings.map((h, i) => {
            const width = h.level === 2 ? 24 : (h.level === 3 ? 18 : 12);
            return `<div class="toc-indicator" data-index="${i}" data-id="${h.id}" style="--indicator-width: ${width}px"></div>`;
        }).join('');
        
        sidebar.innerHTML = `
            <div class="toc-indicators">
                ${indicators}
            </div>
            <div class="toc-card">
                <nav class="toc-nav">
                    ${tocHtml}
                </nav>
            </div>
        `;
        return sidebar;
    }

    /**
     * Create the mobile TOC button and drawer
     */
    function createMobileToc(tocHtml) {
        // Floating button
        const button = document.createElement('button');
        button.className = 'toc-mobile-btn';
        button.setAttribute('aria-label', 'Table of Contents');
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="15" y2="12"></line>
                <line x1="3" y1="18" x2="18" y2="18"></line>
            </svg>
        `;

        // Drawer overlay
        const overlay = document.createElement('div');
        overlay.className = 'toc-overlay';

        // Drawer
        const drawer = document.createElement('div');
        drawer.className = 'toc-drawer';
        drawer.innerHTML = `
            <div class="toc-drawer-header">
                <span class="toc-title">Contents</span>
                <button class="toc-close-btn" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <nav class="toc-nav">
                ${tocHtml}
            </nav>
        `;

        return { button, overlay, drawer };
    }

    /**
     * Set up scroll spy to highlight current section
     */
    function setupScrollSpy(headings) {
        const links = document.querySelectorAll('.toc-link');
        const indicators = document.querySelectorAll('.toc-indicator');
        
        function updateActiveLink() {
            let currentId = null;
            let currentIndex = -1;
            const scrollTop = window.scrollY + CONFIG.scrollOffset;

            // Find the current section
            for (let i = headings.length - 1; i >= 0; i--) {
                const heading = headings[i];
                if (heading.element.offsetTop <= scrollTop) {
                    currentId = heading.id;
                    currentIndex = i;
                    break;
                }
            }

            // Update active states for links
            links.forEach(link => {
                if (link.dataset.id === currentId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            // Update active states for indicators
            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        // Throttled scroll handler
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial update
        updateActiveLink();
    }

    /**
     * Set up smooth scrolling for TOC links and indicators
     */
    function setupSmoothScroll() {
        document.addEventListener('click', (e) => {
            // Handle TOC link clicks
            const link = e.target.closest('.toc-link');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                scrollToTarget(targetId);
                return;
            }
            
            // Handle indicator clicks
            const indicator = e.target.closest('.toc-indicator');
            if (indicator) {
                const targetId = indicator.dataset.id;
                scrollToTarget(targetId);
            }
        });
    }
    
    /**
     * Scroll to target element
     */
    function scrollToTarget(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            const targetPosition = target.offsetTop - CONFIG.smoothScrollOffset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            // Close mobile drawer if open
            closeMobileDrawer();
        }
    }

    /**
     * Mobile drawer controls
     */
    let mobileElements = null;

    function openMobileDrawer() {
        if (!mobileElements) return;
        mobileElements.overlay.classList.add('active');
        mobileElements.drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
        if (!mobileElements) return;
        mobileElements.overlay.classList.remove('active');
        mobileElements.drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    function setupMobileControls() {
        if (!mobileElements) return;

        mobileElements.button.addEventListener('click', openMobileDrawer);
        mobileElements.overlay.addEventListener('click', closeMobileDrawer);
        mobileElements.drawer.querySelector('.toc-close-btn').addEventListener('click', closeMobileDrawer);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileDrawer();
        });
    }

    /**
     * Initialize TOC
     */
    function init() {
        // Collect headings
        const headings = collectHeadings();
        
        // Skip if not enough headings
        if (headings.length < CONFIG.minHeadings) {
            return;
        }

        // Build TOC HTML
        const tocHtml = buildTocHtml(headings);

        // Create and insert sidebar (desktop)
        const sidebar = createTocSidebar(tocHtml, headings);
        document.body.appendChild(sidebar);

        // Create and insert mobile elements
        mobileElements = createMobileToc(tocHtml);
        document.body.appendChild(mobileElements.button);
        document.body.appendChild(mobileElements.overlay);
        document.body.appendChild(mobileElements.drawer);

        // Set up interactions
        setupScrollSpy(headings);
        setupSmoothScroll();
        setupMobileControls();

        // Mark body as having TOC
        document.body.classList.add('has-toc');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready, but use setTimeout to ensure it's fully parsed
        setTimeout(init, 0);
    }
})();

