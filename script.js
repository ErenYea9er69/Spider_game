const spiderContainer = document.getElementById('spider-container');
const splitSpider = document.getElementById('split-spider');
const enterButton = document.getElementById('enter-button');
const body = document.body;

let spiders = [];
let draggedSpider = null;
let targetSpider = null;
let gameUnlocked = false;

body.classList.add('initial');

function createSpider(size, x, y) {
    const spider = document.createElement('div');
    spider.className = `spider ${size}`;
    spider.style.left = x + 'px';
    spider.style.top = y + 'px';
    spider.dataset.size = size;
    
    const img = document.createElement('img');
    img.src = 'spider.png';
    img.alt = 'spider';
    spider.appendChild(img);
    
    spider.addEventListener('mousedown', startDrag);
    spider.addEventListener('touchstart', startDrag, { passive: false });
    
    spiderContainer.appendChild(spider);
    return spider;
}

function initializeSpiders() {
    const sizes = [
        'large', 'large', 'large',
        'medium', 'medium', 'medium', 'medium', 'medium',
        'small', 'small', 'small', 'small', 'small', 'small', 'small', 'small'
    ];
    
    sizes.forEach((size, index) => {
        const x = Math.random() * (window.innerWidth - 150);
        const y = Math.random() * (window.innerHeight - 150);
        const spider = createSpider(size, x, y);
        spiders.push(spider);
    });
}

function startDrag(e) {
    if (gameUnlocked) return;
    
    e.preventDefault();
    draggedSpider = e.currentTarget;
    draggedSpider.classList.add('dragging');
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function drag(e) {
    if (!draggedSpider) return;
    
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const rect = draggedSpider.getBoundingClientRect();
    draggedSpider.style.left = (clientX - rect.width / 2) + 'px';
    draggedSpider.style.top = (clientY - rect.height / 2) + 'px';
}

function endDrag(e) {
    if (!draggedSpider) return;
    
    const currentDraggedSpider = draggedSpider;
    
    draggedSpider.classList.remove('dragging');
    
    checkCollision(currentDraggedSpider);
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
    
    draggedSpider = null;
}

function checkCollision(currentDraggedSpider) {
    if (gameUnlocked) return;
    
    const draggedRect = currentDraggedSpider.getBoundingClientRect();
    const draggedSize = currentDraggedSpider.dataset.size;
    
    if (draggedSize !== 'large') return;
    
    spiders.forEach(spider => {
        if (spider === currentDraggedSpider) return;
        if (spider.dataset.size !== 'large') return;
        
        const spiderRect = spider.getBoundingClientRect();
        
        if (isOverlapping(draggedRect, spiderRect)) {
            targetSpider = spider;
            triggerSplit(spider, currentDraggedSpider);
        }
    });
}

function isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function triggerSplit(spider, draggedSpiderElement) {
    gameUnlocked = true;
    
    const rect = spider.getBoundingClientRect();
    splitSpider.style.left = rect.left + 'px';
    splitSpider.style.top = rect.top + 'px';
    splitSpider.style.transform = 'none';
    
    spider.style.display = 'none';
    draggedSpiderElement.style.display = 'none';
    
    splitSpider.classList.remove('hidden');
    
    setTimeout(() => {
        body.classList.remove('initial');
        body.classList.add('transformed');
        
        const splitLeft = splitSpider.querySelector('.split-left');
        const splitRight = splitSpider.querySelector('.split-right');
        splitLeft.classList.add('split-active');
        splitRight.classList.add('split-active');
        
        setTimeout(() => {
            enterButton.classList.remove('hidden');
            enterButton.classList.add('visible');
        }, 1000);
    }, 300);
}

enterButton.addEventListener('click', () => {
    alert('Welcome to the game! 🎮\n\nThe actual game content would start here.');
});

initializeSpiders();