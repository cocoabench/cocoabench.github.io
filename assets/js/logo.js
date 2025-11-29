// CocoaBench Logo Component
document.addEventListener('DOMContentLoaded', () => {
    const logoContainers = document.querySelectorAll('.logo');
    
    const logoHTML = `
        <div class="logo-icon">
            <svg viewBox="0 0 60 60">
                <g class="solid-group">
                    <path class="pod-body" d="M35 2 C 15 8, 5 32, 12 48 C 15 55, 25 58, 32 60 C 45 58, 55 50, 52 35 C 50 15, 45 5, 35 2 Z" />
                    <path class="pod-ridge-left" d="M35 2 C 22 10, 15 35, 20 50 C 25 55, 30 58, 32 60 C 30 50, 28 20, 35 2 Z" />
                    <path class="pod-ridge-right" d="M35 2 C 42 10, 48 35, 45 50 C 40 55, 35 58, 32 60 C 38 50, 40 20, 35 2 Z" />
                </g>
            </svg>
            <svg viewBox="0 0 60 60">
                <g class="wire-group">
                    <path class="wire-path" d="M35 2 C 15 8, 5 32, 12 48 C 15 55, 25 58, 32 60 C 45 58, 55 50, 52 35 C 50 15, 45 5, 35 2 Z" />
                    <path class="wire-path" d="M34 5 C 24 15, 21 42, 29 55" />
                    <path class="wire-path" d="M35 2 C 32 25, 32 45, 34 58" />
                    <path class="wire-path" d="M36 5 C 44 15, 48 42, 40 55" />
                </g>
            </svg>
        </div>
        <div class="text-group"><span class="cocoa">Cocoa</span><span class="bench">Bench</span></div>
    `;
    
    logoContainers.forEach(logo => {
        logo.innerHTML = logoHTML;
    });
});

