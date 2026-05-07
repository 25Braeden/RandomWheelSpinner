// Weighted Hidden Spinner - script.js
let entries = [
    { name: "Option A", weight: 10 },
    { name: "Option B", weight: 20 },
    { name: "Option C", weight: 5 },
    { name: "Option D", weight: 15 }
];

let currentAngle = 0;
let isSpinning = false;
let canvas, ctx, centerX, centerY, radius;

function initCanvas() {
    canvas = document.getElementById('wheel');
    ctx = canvas.getContext('2d');
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    radius = 230;
}

function drawWheel() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    let startAngle = currentAngle;

    entries.forEach((entry, i) => {
        const sliceAngle = (entry.weight / totalWeight) * 2 * Math.PI;

        // Slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0 ? '#0f3460' : '#e94560';
        ctx.fill();

        // Border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px Arial";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText(entry.name, radius - 30, 8);
        ctx.restore();

        startAngle += sliceAngle;
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 8;
    ctx.stroke();
}

function spin() {
    if (isSpinning || entries.length === 0) return;
    isSpinning = true;
    document.getElementById('result').textContent = '';

    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < entries.length; i++) {
        cumulative += entries[i].weight;
        if (random <= cumulative) {
            selectedIndex = i;
            break;
        }
    }

    // Calculate target angle
    let targetStart = 0;
    for (let i = 0; i < selectedIndex; i++) {
        targetStart += (entries[i].weight / totalWeight) * 2 * Math.PI;
    }

    const extraSpins = 5 + Math.random() * 4;
    const targetAngle = currentAngle - (extraSpins * 2 * Math.PI) 
                        - targetStart 
                        - ((entries[selectedIndex].weight / totalWeight) * Math.PI);

    const duration = 4200;
    const startTime = Date.now();
    const startAngle = currentAngle;

    function animate() {
        const elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        progress = 1 - Math.pow(1 - progress, 3);

        currentAngle = startAngle + (targetAngle - startAngle) * progress;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            currentAngle = targetAngle;
            drawWheel();

            const resultEl = document.getElementById('result');
            resultEl.innerHTML = `🎉 <span style="color:#ffd700">${entries[selectedIndex].name}</span>`;
        }
    }

    animate();
}

function addEntry() {
    const name = prompt("Enter option name:", "New Option");
    if (!name || name.trim() === "") return;

    let weight = parseInt(prompt("Enter hidden weight (positive number):", "10"));
    if (isNaN(weight) || weight <= 0) weight = 10;

    entries.push({ name: name.trim(), weight: weight });
    renderEntries();
    drawWheel();
}

function removeEntry(index) {
    if (confirm("Remove this option?")) {
        entries.splice(index, 1);
        if (entries.length === 0) {
            entries = [{ name: "Default Option", weight: 10 }];
        }
        renderEntries();
        drawWheel();
    }
}

function editWeight(index) {
    const newWeight = parseInt(prompt("New hidden weight for this option:", entries[index].weight));
    if (!isNaN(newWeight) && newWeight > 0) {
        entries[index].weight = newWeight;
        renderEntries();
        drawWheel();
    }
}

function renderEntries() {
    const container = document.getElementById('entryList');
    let html = '';

    entries.forEach((entry, i) => {
        html += `
            <div class="entry-item">
                <span class="entry-name">${entry.name}</span>
                <span class="entry-weight">(weight: ${entry.weight})</span>
                <div class="entry-actions">
                    <button onclick="editWeight(${i})" class="small-btn">Edit Weight</button>
                    <button onclick="removeEntry(${i})" class="small-btn delete-btn">×</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function resetEntries() {
    if (confirm("Reset all options to default?")) {
        entries = [
            { name: "Option A", weight: 10 },
            { name: "Option B", weight: 20 },
            { name: "Option C", weight: 15 }
        ];
        renderEntries();
        drawWheel();
    }
}

// Initialize everything
window.onload = function() {
    initCanvas();
    renderEntries();
    drawWheel();

    // Click wheel to spin
    canvas.addEventListener('click', () => {
        if (!isSpinning) spin();
    });
};
