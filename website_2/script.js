// get current date (MM/DD/YY) and time
function updateDateTime() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();
    const monthName = months[currentDate.getMonth()];
    const monthDay = currentDate.getDate();
    const year = currentDate.getFullYear();

    document.getElementById('date').textContent = `${monthName} ${monthDay}, ${year}`;

    const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('time').textContent = currentTime;
}

window.addEventListener('load', () => updateDateTime());
setInterval(updateDateTime, 1000); // update datetime every second

// use weather api to get current temperature in st louis
navigator.geolocation.getCurrentPosition(
    async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://cse2004.com/api/weather?latitude=${latitude}&longitude=${longitude}`);
            const weather = await response.json();
            document.getElementById('temp').textContent = `${weather.temperature.degrees}°F`;
            document.getElementById('location').textContent = `St. Louis, MO`;
        } catch (err) {
            document.getElementById('temp').textContent = 'unavailable';
            document.getElementById('location').textContent = 'weather data could not be loaded';
        }
    }, 
    (err) => {
        // geolocation denied or failed
        document.getElementById('temp').textContent = '';
        document.getElementById('location').textContent = 'enable location for weather';
    }
);

// canvas stuff (using canvas api)
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';
let history = []; // keep track of strokes for undo logic

// default black color
let prevColorBtn = document.querySelector('.color-swatch[data-color="#000000"]');
prevColorBtn.style.border = "1.5px solid #7F715D";
prevColorBtn.style.width = "28px";
prevColorBtn.style.height = "28px";

// canvas api error check
if (!ctx) {
    document.querySelector('.canvas-section').innerHTML = 
        '<p style="color:#7F715D; font-size:0.9rem;">your browser does not support the canvas element</p>';
}

// resize canvas based on window size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) {
        return;
    }
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

// user is not drawing if the mouse is up or goes out of bounds
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
        currentColor = btn.dataset.color
        btn.style.border = "1.5px solid #7F715D";
        btn.style.width = "28px"
        btn.style.height = "28px"
        // remove selected color styling on prev color btn
        if(prevColorBtn && prevColorBtn != btn) {
            prevColorBtn.style.border = "none";
            prevColorBtn.style.width = "36px"
            prevColorBtn.style.height = "36px"
        }
        prevColorBtn = btn
    });
});

document.getElementById('undo-btn').addEventListener('click', () => {
    if (history.length > 0) {
        ctx.putImageData(history.pop(), 0, 0);
    }
});

document.getElementById('submit-entry').addEventListener('click', () => {
    const entry = {
        date: new Date().toISOString(),
        image: canvas.toDataURL('image/png'),
    };

    archivedDrawings.push(entry);
    saveEntries();
    currentIndex = archivedDrawings.length - 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history = [];

    showArchive();
});

// archive logic (aka an array that keeps track of entries)
let archivedDrawings = loadEntries();
let currentIndex = archivedDrawings.length - 1;

// load entries from local storage
function loadEntries() {
    try {
        return JSON.parse(localStorage.getItem('kept-entries') || '[]');
    } catch (err) {
        document.querySelector('.archive-section').innerHTML = 
            '<p style="color:#7F715D; font-size:0.9rem;">unable to load archives</p>';
        return [];
    }
}

// save entry into local storage
function saveEntries() {
    try {
        localStorage.setItem('kept-entries', JSON.stringify(archivedDrawings));
    } catch (err) {
        alert('Your entry could not be saved. Storage may be full or disabled.');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString)
    const month = date.getMonth() + 1;
    const monthDay = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${month}/${monthDay}/${year}\n${time}`;
}

function showArchive() {
    const stack = document.querySelector('.archive-stack');
    stack.innerHTML = '';

    if (archivedDrawings.length === 0) {
        stack.innerHTML = '<p style="color:#7F715D; font-size:0.9rem;">no entries yet</p>';
        return;
    }

    currentIndex = Math.max(0, Math.min(currentIndex, archivedDrawings.length - 1));

    const entry = archivedDrawings[currentIndex];

    if (currentIndex > 0) {
        const shadowTop = document.createElement('div');
        shadowTop.className = 'entry-card shadow';
        stack.appendChild(shadowTop);
    }

    const card = document.createElement('div');
    card.className = 'entry-card active';

    const img = document.createElement('img');
    img.src = entry.image;
    img.style.cssText = 'width:100%; height:100%; object-fit:contain; background-color: white;';
    card.appendChild(img);

    const dateLabel = document.createElement('span');
    dateLabel.className = 'entry-date';
    dateLabel.style.whiteSpace = 'pre';
    dateLabel.textContent = formatDate(entry.date);
    card.appendChild(dateLabel);
    stack.appendChild(card);

    if (currentIndex < archivedDrawings.length - 1) {
        const shadowBottom = document.createElement('div');
        shadowBottom.className = 'entry-card shadow';
        stack.appendChild(shadowBottom);
    }
}

document.getElementById('prev-entry').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        showArchive();
    }
});

document.getElementById('next-entry').addEventListener('click', () => {
    if (currentIndex < archivedDrawings.length - 1) {
        currentIndex++;
        showArchive();
    }
});

showArchive();