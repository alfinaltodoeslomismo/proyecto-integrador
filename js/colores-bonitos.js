const paletteContainer = document.getElementById('palette');
const genBtn = document.getElementById('generate');
const countSelect = document.getElementById('card-count');
const formatBtn = document.getElementById('toggle-format');
const toast = document.getElementById('toast');

let colors = [];
let format = 'hex';

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if(max===r) h = (g-b)/d + (g<b?6:0); else if(max===g) h = (b-r)/d + 2; else h = (r-g)/d + 4;
        h /= 6;
    }
    return `HSL(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}

function render() {
    paletteContainer.innerHTML = '';
    const visibleCount = parseInt(countSelect.value);
    
    // Always prioritize locked colors at the start of the visible range
    colors.sort((a, b) => (b.locked === a.locked) ? 0 : b.locked ? 1 : -1);

    colors.slice(0, visibleCount).forEach((item, index) => {
        const displayValue = format === 'hex' ? item.hex.toUpperCase() : hexToHsl(item.hex);
        const card = document.createElement('div');
        card.className = 'color-card';
        card.onclick = (e) => {
            if(!e.target.closest('.lock-btn')) copyToClipboard(displayValue);
        };

        card.innerHTML = `
            <div class="color-badge">${displayValue}</div>
            <div class="color-box" style="background: ${item.hex}">
                <button class="lock-btn ${item.locked ? 'active' : ''}" onclick="toggleLock(event, ${index})">
                    ${item.locked ? 'LOCKED' : 'LOCK'}
                </button>
            </div>
        `;
        paletteContainer.appendChild(card);
    });
}

function generate() {
    colors = colors.map(c => c.locked ? c : { hex: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), locked: false });
    render();
}

window.toggleLock = (e, index) => {
    e.stopPropagation();
    colors[index].locked = !colors[index].locked;
    render();
};

window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
};

countSelect.onchange = render; // Simply re-renders based on the new slice

formatBtn.onclick = () => {
    format = format === 'hex' ? 'hsl' : 'hex';
    formatBtn.innerText = `Format: ${format.toUpperCase()}`;
    render();
};

genBtn.onclick = generate;

// Initial state: Pre-fill 9 slots so they exist in memory
for(let i=0; i<9; i++) {
    colors.push({ hex: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), locked: false });
}
render();
