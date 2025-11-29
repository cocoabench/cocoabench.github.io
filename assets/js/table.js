document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('leaderboard-body');
    
    function getLogoPath(organization) {
        return `./assets/logos/${organization.toLowerCase()}.png`;
    }
    
    fetch('./assets/data/data.json')
        .then(response => response.json())
        .then(data => {
            renderTable(data);
            setupColumnHover();
        })
        .catch(error => console.error('Error loading leaderboard data:', error));

    function renderTable(data) {
        tableBody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            const logoPath = getLogoPath(item.organization);
            
            // Generate individual result cells with data-col attribute
            const resultCells = item.results.map((result, index) => {
                const statusClass = result === 1 ? 'pass' : 'fail';
                const link = item.links[index];
                const colIndex = index + 4; // offset by 3 fixed columns + 1
                return `<td class="result-cell" data-col="${colIndex}"><a href="${link}" target="_blank" rel="noopener" class="result-block ${statusClass}" title="Q${index + 1}"></a></td>`;
            }).join('');
            
            row.innerHTML = `
                <td class="rank-cell">${item.rank}</td>
                <td class="model-name"><img src="${logoPath}" alt="${item.organization}" class="model-logo">${item.model}</td>
                <td class="score-cell">${item.pass_rate}%</td>
                ${resultCells}
            `;
            
            tableBody.appendChild(row);
        });
    }

    function setupColumnHover() {
        const table = document.querySelector('.table-wrapper table');
        if (!table) return;

        // Only enable column hover on devices that support hover (not touch)
        const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!hasHover) return;

        // Add data-col to header cells
        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach((th, index) => {
            th.setAttribute('data-col', index + 1);
        });

        // Column hover effect
        table.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('td[data-col], th[data-col]');
            if (!cell) return;
            
            const colIndex = cell.getAttribute('data-col');
            if (!colIndex) return;

            // Highlight all cells in this column
            table.querySelectorAll(`[data-col="${colIndex}"]`).forEach(el => {
                el.classList.add('col-hover');
            });
        });

        table.addEventListener('mouseout', (e) => {
            const cell = e.target.closest('td[data-col], th[data-col]');
            if (!cell) return;
            
            const colIndex = cell.getAttribute('data-col');
            if (!colIndex) return;

            table.querySelectorAll(`[data-col="${colIndex}"]`).forEach(el => {
                el.classList.remove('col-hover');
            });
        });
    }
});
