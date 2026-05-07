// Hidden Weighted Spinner - Equal Visual Slices
let entries = [
    { name: "Option A", weight: 10 },
    { name: "Option B", weight: 20 },
    { name: "Option C", weight: 15 }
];

let currentAngle = 0;
let isSpinning = false;
let showWeights = false;   // Secret toggle
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

    const sliceAngle = (2 * Math.PI) / entries.length;
    let startAngle = currentAngle;

    entries.forEach((entry, i) => {
        // Draw equal slices
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0 ? '#0f3460' : '#e94560';
        ctx.fill();

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

    // Center hub - Secret weight toggle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Small center icon
    ctx.fillStyle = '#1a1a2e';
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎡", centerX, centerY);
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

    const sliceAngle = (2 * Math.PI) / entries.length;
    const targetStart = selectedIndex * sliceAngle;

    const extraSpins = 5 + Math.random() * 4;
    const targetAngle = currentAngle - (extraSpins * 2 * Math.PI) - targetStart - (sliceAngle / 2);

    const duration = 4200;
    const startTime = Date.now();
    const startAngle = currentAngle;

    function animate() {
        const elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / duration, 1);
        progress = 1 - Math.pow(1 - progress, 3);

        currentAngle = startAngle + (targetAngle - startAngle) * progress;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            currentAngle = targetAngle;
            drawWheel();

            document.getElementById('result').innerHTML = 
                `🎉 <span style="color:#ffd700">${entries[selectedIndex].name}</span>`;
        }
    }

    animate();
}

function addEntry() {
    const name = prompt("Enter option name:", "New Option");
    if (!name || name.trim() === "") return;

    entries.push({ name: name.trim(), weight: 10 }); // Default weight
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
    if (!showWeights) return;
    const newWeight = parseInt(prompt(`New weight for "${entries[index].name}":`, entries[index].weight));
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
                ${showWeights ? `<span class="entry-weight">(weight: ${entry.weight})</span>` : ''}
                <div class="entry-actions">
                    ${showWeights ? `<button onclick="editWeight(${i})" class="small-btn">Edit Weight</button>` : ''}
                    <button onclick="removeEntry(${i})" class="small-btn delete-btn">×</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Toggle weight editing mode by clicking the center 🎡
function toggleWeightMode(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const dist = Math.hypot(clickX - centerX, clickY - centerY);
    
    if (dist < 50) {  // Clicked near center
        showWeights = !showWeights;
        renderEntries();
        drawWheel();
    }
}

// Initialize
window.onload = function() {
    initCanvas();
    renderEntries();
    drawWheel();

    // Click wheel to spin (except center)
    canvas.addEventListener('click', (e) => {
        if (isSpinning) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (Math.hypot(clickX - centerX, clickY - centerY) < 50) {
            toggleWeightMode(e);
        } else {
            spin();
        }
    });
};
