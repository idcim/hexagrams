// 渲染卦象的函数
function renderHexagram(lines, size = 'mini') {
    let html = `<div class="hexagram hexagram-${size}">`;
    // 易经从下往上画爻
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
        <h3>解释</h3>
        <p>${hexagram.explanation}</p>
        <h3>六爻</h3>
    `;
    
    hexagram.linesText.forEach(line => {
        html += `
            <div class="line-text">
                <div class="line-title">${line.name}</div>
                <div>${line.text}</div>
            </div>
        `;
    });
    
    modalBody.innerHTML = html;
    modal.style.display = 'block';
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
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
        <button class="btn" onclick="openModal(HEXAGRAMS[${hexagram.id - 1}])">查看详情</button>
    `;
    
    container.innerHTML = html;
}

// 渲染六十四卦网格
function renderGrid() {
    const container = document.getElementById('hexagram-grid');
    let html = '';
    
    HEXAGRAMS.forEach(hexagram => {
        html += `
            <div class="hexagram-card" onclick="openModal(HEXAGRAMS[${hexagram.id - 1}])">
                <div class="card-number">第 ${hexagram.id} 卦</div>
                <div class="mini-hexagram">
                    ${renderHexagram(hexagram.lines, 'mini')}
                </div>
                <div class="card-name">${hexagram.name}</div>
                <div class="card-symbol">${hexagram.symbol}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderDaily();
    renderGrid();
    
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
    
    // 重新起卦按钮
    document.getElementById('refresh-daily').addEventListener('click', () => {
        renderDaily();
    });
});
