const API_BASE = 'http://localhost:3000/api';
let currentCrawlId = null;
let statusInterval = null;

// DOM Elements
const crawlForm = document.getElementById('crawlForm');
const statusSection = document.getElementById('statusSection');
const scoresSection = document.getElementById('scoresSection');
const pagesSection = document.getElementById('pagesSection');
const refreshBtn = document.getElementById('refreshBtn');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');

// Form Submit
crawlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const maxDepth = parseInt(document.getElementById('maxDepth').value);
    const maxPages = parseInt(document.getElementById('maxPages').value);
    
    try {
        const response = await fetch(`${API_BASE}/crawl`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, maxDepth, maxPages })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentCrawlId = data.crawlId;
            showStatus();
            startStatusPolling();
        } else {
            alert(`Error: ${data.error || 'Failed to start crawl'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Refresh Status Button
refreshBtn.addEventListener('click', () => {
    if (currentCrawlId) {
        fetchStatus();
        fetchScores();
        fetchPages();
    }
});

// Show Status Section
function showStatus() {
    statusSection.classList.remove('hidden');
    scoresSection.classList.remove('hidden');
    pagesSection.classList.remove('hidden');
}

// Poll Status Every 2 Seconds
function startStatusPolling() {
    fetchStatus();
    fetchScores();
    fetchPages();
    
    if (statusInterval) clearInterval(statusInterval);
    
    statusInterval = setInterval(async () => {
        const status = await fetchStatus();
        
        if (status && (status.state === 'completed' || status.state === 'failed')) {
            clearInterval(statusInterval);
            fetchScores();
            fetchPages();
        }
    }, 2000);
}

// Fetch Crawl Status
async function fetchStatus() {
    try {
        const response = await fetch(`${API_BASE}/crawl/${currentCrawlId}/status`);
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('crawlId').textContent = data.crawlId;
            document.getElementById('crawlState').textContent = data.state;
            document.getElementById('crawlState').className = `badge badge-${data.state}`;
            document.getElementById('pagesCrawled').textContent = data.pagesCrawled || 0;
            document.getElementById('startedAt').textContent = data.startedAt ? new Date(data.startedAt).toLocaleString() : '-';
            return data;
        }
    } catch (error) {
        console.error('Error fetching status:', error);
    }
    return null;
}

// Fetch SEO Scores
async function fetchScores() {
    try {
        const response = await fetch(`${API_BASE}/crawl/${currentCrawlId}/seo-score`);
        const data = await response.json();
        
        if (response.ok && data.technicalScore !== undefined) {
            document.getElementById('technicalScore').textContent = data.technicalScore;
            document.getElementById('contentScore').textContent = data.contentScore;
            document.getElementById('overallScore').textContent = data.overallScore;
            
            // Color coding
            setScoreColor('technicalScore', data.technicalScore);
            setScoreColor('contentScore', data.contentScore);
            setScoreColor('overallScore', data.overallScore);
        }
    } catch (error) {
        console.error('Error fetching scores:', error);
    }
}

// Set Score Color Based on Value
function setScoreColor(elementId, score) {
    const element = document.getElementById(elementId);
    element.className = 'score-value';
    
    if (score >= 80) {
        element.classList.add('score-good');
    } else if (score >= 60) {
        element.classList.add('score-medium');
    } else {
        element.classList.add('score-bad');
    }
}

// Fetch Crawled Pages
async function fetchPages() {
    try {
        const response = await fetch(`${API_BASE}/crawl/${currentCrawlId}/pages`);
        const data = await response.json();
        
        if (response.ok && data.pages) {
            renderPagesTable(data.pages);
        }
    } catch (error) {
        console.error('Error fetching pages:', error);
    }
}

// Render Pages Table
function renderPagesTable(pages) {
    const tbody = document.getElementById('pagesTableBody');
    tbody.innerHTML = '';
    
    pages.forEach(page => {
        const row = document.createElement('tr');
        
        const urlCell = document.createElement('td');
        urlCell.innerHTML = `<a href="${page.url}" target="_blank" title="${page.url}">${truncateUrl(page.url)}</a>`;
        
        const statusCell = document.createElement('td');
        statusCell.textContent = page.statusCode;
        statusCell.className = page.statusCode === 200 ? 'status-ok' : 'status-error';
        
        const techCell = document.createElement('td');
        techCell.textContent = '-';
        techCell.className = 'score-cell';
        
        const contentCell = document.createElement('td');
        contentCell.textContent = '-';
        contentCell.className = 'score-cell';
        
        const overallCell = document.createElement('td');
        overallCell.textContent = '-';
        overallCell.className = 'score-cell';
        
        // Fetch individual page scores
        fetchPageScore(page.url, techCell, contentCell, overallCell);
        
        const actionsCell = document.createElement('td');
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'Details';
        detailsBtn.className = 'btn btn-small';
        detailsBtn.onclick = () => showPageDetails(page.url);
        actionsCell.appendChild(detailsBtn);
        
        row.appendChild(urlCell);
        row.appendChild(statusCell);
        row.appendChild(techCell);
        row.appendChild(contentCell);
        row.appendChild(overallCell);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
}

// Fetch Individual Page Score
async function fetchPageScore(pageUrl, techCell, contentCell, overallCell) {
    try {
        const encodedUrl = encodeURIComponent(pageUrl);
        const response = await fetch(`${API_BASE}/crawl/${currentCrawlId}/pages/${encodedUrl}/seo-score`);
        const data = await response.json();
        
        if (response.ok && data.technicalScore !== undefined) {
            techCell.textContent = data.technicalScore;
            contentCell.textContent = data.contentScore;
            overallCell.textContent = data.overallScore;
            
            setScoreCellColor(techCell, data.technicalScore);
            setScoreCellColor(contentCell, data.contentScore);
            setScoreCellColor(overallCell, data.overallScore);
        }
    } catch (error) {
        console.error('Error fetching page score:', error);
    }
}

// Set Score Cell Color
function setScoreCellColor(cell, score) {
    if (score >= 80) {
        cell.style.color = '#22c55e';
        cell.style.fontWeight = 'bold';
    } else if (score >= 60) {
        cell.style.color = '#f59e0b';
        cell.style.fontWeight = 'bold';
    } else {
        cell.style.color = '#ef4444';
        cell.style.fontWeight = 'bold';
    }
}

// Show Page Details Modal
async function showPageDetails(pageUrl) {
    const encodedUrl = encodeURIComponent(pageUrl);
    
    try {
        const [scoreRes, metricsRes, speedRes] = await Promise.all([
            fetch(`${API_BASE}/crawl/${currentCrawlId}/pages/${encodedUrl}/seo-score`),
            fetch(`${API_BASE}/crawl/${currentCrawlId}/pages/${encodedUrl}/seo-metrics`),
            fetch(`${API_BASE}/crawl/${currentCrawlId}/pages/${encodedUrl}/speed`)
        ]);
        
        const scoreData = await scoreRes.json();
        const metricsData = await metricsRes.json();
        const speedData = await speedRes.json();
        
        let html = `
            <h3>Page: ${truncateUrl(pageUrl, 50)}</h3>
            <a href="${pageUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">Open Page →</a>
            
            <h4>SEO Scores</h4>
            <div class="scores-grid">
                <div class="score-card-small">
                    <div class="score-label">Technical</div>
                    <div class="score-value-small" style="color: ${getScoreColor(scoreData.technicalScore)}">${scoreData.technicalScore || '-'}</div>
                </div>
                <div class="score-card-small">
                    <div class="score-label">Content</div>
                    <div class="score-value-small" style="color: ${getScoreColor(scoreData.contentScore)}">${scoreData.contentScore || '-'}</div>
                </div>
                <div class="score-card-small">
                    <div class="score-label">Overall</div>
                    <div class="score-value-small" style="color: ${getScoreColor(scoreData.overallScore)}">${scoreData.overallScore || '-'}</div>
                </div>
            </div>
            
            <h4>SEO Metrics</h4>
            <ul>
                <li>Title Length: ${metricsData.titleLength || 0} chars</li>
                <li>Meta Description: ${metricsData.metaDescriptionLength || 0} chars</li>
                <li>Word Count: ${metricsData.wordCount || 0}</li>
                <li>H1 Count: ${metricsData.h1Count || 0}</li>
                <li>Internal Links: ${metricsData.internalLinkCount || 0}</li>
                <li>Images with Alt: ${metricsData.imagesWithAlt || 0} / ${(metricsData.imagesWithAlt || 0) + (metricsData.imagesWithoutAlt || 0)}</li>
            </ul>
            
            ${speedData.ttfb ? `
            <h4>Performance Metrics</h4>
            <ul>
                <li>TTFB: ${speedData.ttfb}ms</li>
                <li>DOM Load Time: ${speedData.domLoadTime}ms</li>
                <li>Total Load Time: ${speedData.totalLoadTime}ms</li>
            </ul>
            ` : ''}
            
            ${scoreData.technicalDeductions && scoreData.technicalDeductions.length > 0 ? `
            <h4>Technical Issues</h4>
            <ul class="deductions-list">
                ${scoreData.technicalDeductions.map(d => `
                    <li class="deduction-${d.severity}">
                        <strong>${d.severity.toUpperCase()}:</strong> ${d.reason} (-${d.pointsDeducted} points)
                    </li>
                `).join('')}
            </ul>
            ` : ''}
            
            ${scoreData.contentDeductions && scoreData.contentDeductions.length > 0 ? `
            <h4>Content Issues</h4>
            <ul class="deductions-list">
                ${scoreData.contentDeductions.map(d => `
                    <li class="deduction-${d.severity}">
                        <strong>${d.severity.toUpperCase()}:</strong> ${d.reason} (-${d.pointsDeducted} points)
                    </li>
                `).join('')}
            </ul>
            ` : ''}
        `;
        
        document.getElementById('modalBody').innerHTML = html;
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching page details:', error);
    }
}

// Helper: Get Score Color
function getScoreColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
}

// Helper: Truncate URL
function truncateUrl(url, maxLength = 40) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

// Close Modal
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
