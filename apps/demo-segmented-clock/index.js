const segments = {
    0: ['a','b','c','d','e','f'],
    1: ['b','c'],
    2: ['a','b','g','e','d'],
    3: ['a','b','g','c','d'],
    4: ['f','g','b','c'],
    5: ['a','f','g','c','d'],
    6: ['a','f','g','c','d','e'],
    7: ['a','b','c'],
    8: ['a','b','c','d','e','f','g'],
    9: ['a','b','c','d','f','g']
};

function createDigit() {
    const digit = document.createElement('div');
    digit.className = 'digit';
    ['a','b','c','d','e','f','g'].forEach(seg => {
        const segment = document.createElement('div');
        segment.className = `segment ${seg}`;
        digit.appendChild(segment);
    });
    return digit;
}

function createColon() {
    const colon = document.createElement('div');
    colon.className = 'colon';
    const dot1 = document.createElement('div');
    dot1.className = 'dot top';
    const dot2 = document.createElement('div');
    dot2.className = 'dot bottom';
    colon.appendChild(dot1);
    colon.appendChild(dot2);
    return colon;
}

function updateDigit(digit, number) {
    const activeSegments = segments[number] || [];
    digit.querySelectorAll('.segment').forEach(seg => {
        seg.style.opacity = activeSegments.includes(seg.className.split(' ')[1]) ? '1' : '0.1';
    });
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const digits = document.querySelectorAll('.digit');
    updateDigit(digits[1], hours[0]);
    updateDigit(digits[2], hours[1]);
    updateDigit(digits[4], minutes[0]);
    updateDigit(digits[5], minutes[1]);
    updateDigit(digits[7], seconds[0]);
    updateDigit(digits[8], seconds[1]);
}

function init() {
    const clock = document.getElementById('clock');
    // Create 6 digits (2 for hours, 2 for minutes, 2 for seconds)
    for (let i = 0; i < 6; i++) {
        clock.appendChild(createDigit());
        if (i === 1 || i === 3) {
            clock.appendChild(createColon());
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}

init(); 