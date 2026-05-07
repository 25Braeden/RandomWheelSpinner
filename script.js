// Wheel Spinner
let entries = [
    { name: "Option A", weight: 10 },
    { name: "Option B", weight: 20 },
    { name: "Option C", weight: 15 }
];

let currentAngle = 0;
let isSpinning = false;
let showWeights = false;  // Secret — toggled by clicking the center hub
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

    const colors = ['#0f3460', '#e94560', '#16213e', '#c84b31', '#1a4a6e', '#b5373a'];

    entries.forEach((entry, i) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();

        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.stroke();

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

    // Center hub (secret toggle target)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = '#1a1a2e';
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎡", centerX, centerY);

    // Pointer arrow at the top
    const arrowTip  = centerY - radius - 10;  // just outside the wheel rim
    const arrowH    = 36;
    const arrowW    = 22;

    ctx.beginPath();
    ctx.moveTo(centerX,          arrowTip);           // tip (pointing down into wheel)
    ctx.lineTo(centerX - arrowW, arrowTip - arrowH);  // top-left
    ctx.lineTo(centerX + arrowW, arrowTip - arrowH);  // top-right
    ctx.closePath();

    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function showWinnerModal(name, index) {
    document.getElementById('winner-name').textContent = name;
    document.getElementById('winner-modal').classList.add('active');

    document.getElementById('modal-remove-btn').onclick = function () {
        closeModal();
        entries.splice(index, 1);
        if (entries.length === 0) {
            entries = [{ name: "Default Option", weight: 10 }];
        }
        renderEntries();
        drawWheel();
        document.getElementById('result').textContent = '';
    };
}

function closeModal() {
    document.getElementById('winner-modal').classList.remove('active');
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
            showWinnerModal(entries[selectedIndex].name, selectedIndex);
        }
    }

    animate();
}

function addEntry() {
    const name = prompt("Enter option name:", "New Option");
    if (!name || name.trim() === "") return;
    entries.push({ name: name.trim(), weight: 10 });
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

function resetEntries() {
    if (confirm("Reset all options to defaults?")) {
        entries = [
            { name: "Option A", weight: 10 },
            { name: "Option B", weight: 20 },
            { name: "Option C", weight: 15 }
        ];
        renderEntries();
        drawWheel();
        document.getElementById('result').textContent = '';
    }
}

function editWeight(index) {
    if (!showWeights) return;
    const newWeight = parseInt(prompt(`Weight for "${entries[index].name}":`, entries[index].weight));
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

function handleCanvasClick(e) {
    if (isSpinning) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const dist = Math.hypot(clickX - centerX, clickY - centerY);

    if (dist < 50) {
        showWeights = !showWeights;
        renderEntries();
        drawWheel();
    } else {
        spin();
    }
}

window.onload = function () {
    initCanvas();
    renderEntries();
    drawWheel();
    canvas.addEventListener('click', handleCanvasClick);

    document.getElementById('winner-modal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
};
