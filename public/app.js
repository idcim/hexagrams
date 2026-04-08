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
            <div class="modal-name">${hexagram.symbol}</div>
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

// 起卦仪式 - 随机抽卦动画
function divineRitual(container) {
    // 显示起卦中...
    container.innerHTML = `
        <div class="divine-ritual">
            <div class="ritual-text">正在起卦...</div>
            <div class="ritual-loading">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p class="ritual-desc">静心祈愿，静待神明示...</p>
        </div>
    `;
    
    // 随机翻转几个卦，营造仪式感
    let count = 0;
    const totalFlips = 8 + Math.floor(Math.random() * 8); // 8-16 次翻转
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 64);
        const temp = HEXAGRAMS[randomIndex];
        container.querySelector('.divine-ritual').insertBefore(
            renderHexagram(temp.lines, 'large'), 
            container.querySelector('.ritual-text')
        );
        count++;
        if (count >= totalFlips) {
            clearInterval(interval);
            setTimeout(() => {
                // 得到最终结果
                const randomIndex = Math.floor(Math.random() * 64);
                const hexagram = HEXAGRAMS[randomIndex];
                let html = `
                    <div class="hexagram-display divine-complete">
                        ${renderHexagram(hexagram.lines, 'large')}
                    </div>
                    <div class="result-text">恭喜您得到：</div>
                    <div class="hexagram-title">${hexagram.id}．${hexagram.name}</div>
                    <div class="hexagram-name">${hexagram.symbol}</div>
                    <div class="hexagram-judgment"><strong>卦辞：</strong>${hexagram.judgment}</div>
                    <div class="hexagram-explanation">${hexagram.explanation}</div>
                    ${hexagram.interpretation ? `<div class="hexagram-interpretation">${hexagram.interpretation}</div>` : ''}
                    <button class="btn btn-primary" onclick="openModal(HEXAGRAMS[${hexagram.id - 1}])">查看完整详解</button>
                `;
                container.innerHTML = html;
            }, 600);
        }
    }, 200);
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
    
    // 重新起卦按钮 - 增加仪式感
    document.getElementById('refresh-daily').addEventListener('click', () => {
        const container = document.getElementById('daily-hexagram');
        divineRitual(container);
    });
});
