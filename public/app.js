// 渲染卦象的函数 - 从下到上符合易经传统画法
function renderHexagram(lines, size = 'mini') {
    let html = `<div class="hexagram hexagram-${size}">`;
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        const className = line === 1 ? 'line yang' : 'line yin';
        html += `<div class="${className}"></div>`;
    }
    html += '</div>';
    return html;
}

// 基于日期的伪随机数生成器（这样每天得到同一个卦）
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// 获取今日卦象
function getDailyHexagram() {
    const today = new Date();
    // 用年月日作为种子，保证同一天得到同一个卦
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = Math.floor(seededRandom(seed) * 64);
    return HEXAGRAMS[index];
}

// 打开详情弹窗
function openModal(hexagram) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    let html = `
        <div class="modal-header">
            <div class="modal-hexagram">
                ${renderHexagram(hexagram.lines, 'large')}
            </div>
            <div class="modal-title">${hexagram.id}．${hexagram.name}</div>
            <div class="modal-symbol">${hexagram.symbol}</div>
        </div>
        <h3>卦辞</h3>
        <p><strong>${hexagram.judgment}</strong></p>
        <h3>卦辞解读</h3>
        <p>${hexagram.explanation}</p>
        ${hexagram.interpretation ? `<h3>白话启示</h3><p>${hexagram.interpretation}</p>` : ''}
        <h3>六爻详解</h3>
    `;
    
    hexagram.linesText.forEach(line => {
        html += `
            <div class="line-text">
                <div class="line-title">${line.name}：${line.text}</div>
                <div class="line-interpretation">${line.interpretation}</div>
            </div>
        `;
    });
    
    modalBody.innerHTML = html;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 渲染今日卦象
function renderDaily() {
    const container = document.getElementById('daily-hexagram');
    const hexagram = getDailyHexagram();
    
    let html = `
        <div class="hexagram-display">
            ${renderHexagram(hexagram.lines, 'large')}
        </div>
        <div class="hexagram-title">${hexagram.id}．${hexagram.name}</div>
        <div class="hexagram-name">${hexagram.symbol}</div>
        <div class="hexagram-judgment"><strong>卦辞：</strong>${hexagram.judgment}</div>
        <div class="hexagram-explanation">${hexagram.explanation}</div>
        ${hexagram.interpretation ? `<div class="hexagram-interpretation">${hexagram.interpretation}</div>` : ''}
        <button class="btn btn-primary" onclick="openModal(HEXAGRAMS[${hexagram.id - 1}])">查看完整详解</button>
    `;
    
    container.innerHTML = html;
}

// 渲染六十四卦网格
function renderGrid(filter = '') {
    const container = document.getElementById('hexagram-grid');
    const noResult = document.getElementById('no-result');
    let html = '';
    let count = 0;
    
    HEXAGRAMS.forEach(hexagram => {
        const searchText = `${hexagram.id} ${hexagram.name} ${hexagram.symbol}`.toLowerCase();
        const matches = !filter || searchText.includes(filter.toLowerCase());
        
        if (matches) {
            html += `
                <div class="hexagram-card ${matches ? 'show' : 'hide'}" onclick="openModal(HEXAGRAMS[${hexagram.id - 1}])">
                    <div class="card-number">第 ${hexagram.id} 卦</div>
                    <div class="mini-hexagram">
                        ${renderHexagram(hexagram.lines, 'mini')}
                    </div>
                    <div class="card-name">${hexagram.name}</div>
                    <div class="card-symbol">${hexagram.symbol}</div>
                </div>
            `;
            count++;
        }
    });
    
    container.innerHTML = html;
    
    if (count === 0) {
        noResult.style.display = 'block';
    } else {
        noResult.style.display = 'none';
    }
}

// 深色模式切换
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    let debounceTimer;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            renderGrid(searchInput.value.trim());
        }, 200);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderDaily();
    renderGrid();
    initSearch();
    
    // 关闭按钮
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // 点击遮罩关闭
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
    
    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // 重新起卦按钮 - 这里改为随机抽取一卦
    document.getElementById('refresh-daily').addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * 64);
        const container = document.getElementById('daily-hexagram');
        const hexagram = HEXAGRAMS[randomIndex];
        
        let html = `
            <div class="hexagram-display">
                ${renderHexagram(hexagram.lines, 'large')}
            </div>
            <div class="hexagram-title">${hexagram.id}．${hexagram.name}</div>
            <div class="hexagram-name">${hexagram.symbol}</div>
            <div class="hexagram-judgment"><strong>卦辞：</strong>${hexagram.judgment}</div>
            <div class="hexagram-explanation">${hexagram.explanation}</div>
            ${hexagram.interpretation ? `<div class="hexagram-interpretation">${hexagram.interpretation}</div>` : ''}
            <button class="btn btn-primary" onclick="openModal(HEXAGRAMS[${hexagram.id - 1}])">查看完整详解</button>
        `;
        
        container.innerHTML = html;
    });
});
