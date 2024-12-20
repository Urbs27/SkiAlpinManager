const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Erstelle Test-Ordner
const dirs = ['athletes', 'courses', 'results', 'gallery'];
dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
});

// Erstelle Test-Bild
function createTestImage(width, height, text, filePath) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Hintergrund
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = '#333333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, width/2, height/2);

    // Speichern
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(filePath, buffer);
}

// Test-Dateien erstellen
const testFiles = {
    // Athletenfotos
    'athletes/valid-photo.jpg': {
        width: 800,
        height: 600,
        text: 'Test Athlete Photo'
    },
    'athletes/too-large.jpg': {
        width: 4000,
        height: 3000,
        text: 'Too Large Photo'
    },

    // Streckenpläne
    'courses/valid-map.jpg': {
        width: 1200,
        height: 800,
        text: 'Test Course Map'
    },
    'courses/course-profile.jpg': {
        width: 1000,
        height: 400,
        text: 'Course Profile'
    },

    // Galeriebilder
    'gallery/image1.jpg': {
        width: 1200,
        height: 800,
        text: 'Gallery Image 1'
    },
    'gallery/image2.jpg': {
        width: 1200,
        height: 800,
        text: 'Gallery Image 2'
    }
};

// Erstelle alle Test-Bilder
Object.entries(testFiles).forEach(([filePath, config]) => {
    createTestImage(
        config.width,
        config.height,
        config.text,
        path.join(__dirname, filePath)
    );
});

// Erstelle Test-PDF
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(path.join(__dirname, 'results/test-results.pdf')));
doc.fontSize(25).text('Test Ergebnisliste', 100, 100);
doc.end();

console.log('Test-Dateien wurden erstellt!'); 