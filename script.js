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

function getSpiderSize(size) {
    const sizes = {
        'tiny': 50,
        'small': 70,
        'medium': 100,
        'big': 120,
        'large': 150
    };
    return sizes[size] || 100;
}

function isPositionValid(x, y, size) {
    const newSize = getSpiderSize(size);
    const newRect = {
        left: x,
        top: y,
        right: x + newSize,
        bottom: y + newSize
    };
    
    for (let spider of spiders) {
        const spiderRect = spider.getBoundingClientRect();
        
        if (isOverlapping(newRect, spiderRect)) {
            return false;
        }
    }
    
    return true;
}

function getRandomPosition(size) {
    const spiderSize = getSpiderSize(size);
    const maxAttempts = 100;
    
    for (let i = 0; i < maxAttempts; i++) {
        const x = Math.random() * (window.innerWidth - spiderSize);
        const y = Math.random() * (window.innerHeight - spiderSize);
        
        if (isPositionValid(x, y, size)) {
            return { x, y };
        }
    }
    
    // If we couldn't find a valid position after many attempts, 
    // just return a random position (fallback)
    return {
        x: Math.random() * (window.innerWidth - spiderSize),
        y: Math.random() * (window.innerHeight - spiderSize)
    };
}

function initializeSpiders() {
    const numberOfSpiders = 32;
    
    // Create exactly 2 large spiders first
    for (let i = 0; i < 2; i++) {
        const pos = getRandomPosition('large');
        const spider = createSpider('large', pos.x, pos.y);
        spiders.push(spider);
    }
    
    // Create remaining spiders with random sizes (excluding large)
    for (let i = 2; i < numberOfSpiders; i++) {
        // Generate random size with more variety
        const randomValue = Math.random();
        let randomSize;
        
        if (randomValue < 0.3) {
            randomSize = 'tiny';
        } else if (randomValue < 0.5) {
            randomSize = 'small';
        } else if (randomValue < 0.75) {
            randomSize = 'medium';
        } else {
            randomSize = 'big';
        }
        
        const pos = getRandomPosition(randomSize);
        const spider = createSpider(randomSize, pos.x, pos.y);
        spiders.push(spider);
    }
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

function getOverlapPercentage(rect1, rect2) {
    // Calculate the overlapping rectangle
    const overlapLeft = Math.max(rect1.left, rect2.left);
    const overlapTop = Math.max(rect1.top, rect2.top);
    const overlapRight = Math.min(rect1.right, rect2.right);
    const overlapBottom = Math.min(rect1.bottom, rect2.bottom);
    
    // If there's no overlap
    if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
        return 0;
    }
    
    // Calculate overlap area
    const overlapWidth = overlapRight - overlapLeft;
    const overlapHeight = overlapBottom - overlapTop;
    const overlapArea = overlapWidth * overlapHeight;
    
    // Calculate the area of the smaller rectangle
    const area1 = (rect1.right - rect1.left) * (rect1.bottom - rect1.top);
    const area2 = (rect2.right - rect2.left) * (rect2.bottom - rect2.top);
    const smallerArea = Math.min(area1, area2);
    
    // Return the percentage of overlap relative to the smaller rectangle
    return (overlapArea / smallerArea) * 100;
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
        
        const overlapPercent = getOverlapPercentage(draggedRect, spiderRect);
        
        // Require at least 90% overlap
        if (overlapPercent >= 90) {
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
    splitSpider.style.transition = 'left 0.8s ease, top 0.8s ease';
    
    spider.style.display = 'none';
    draggedSpiderElement.style.display = 'none';
    
    splitSpider.classList.remove('hidden');
    
    // Move to top-middle of page
    setTimeout(() => {
        const targetX = (window.innerWidth / 2) - 75; // 75 is half of spider width (150px)
        const targetY = 20; // 20px from top
        
        splitSpider.style.left = targetX + 'px';
        splitSpider.style.top = targetY + 'px';
    }, 50);
    
    // Wait for movement to complete, then split
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
    }, 1100);
}

enterButton.addEventListener('click', () => {
    alert('Welcome to the game! \n\nThe actual game content would start here.');
});

initializeSpiders();