const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Validiert eine hochgeladene Datei
 */
function validateFile(file, options = {}) {
    const {
        maxSize = 5 * 1024 * 1024, // Standard: 5MB
        allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
        minSize = 1024 // Standard: 1KB
    } = options;

    if (!file) {
        throw new Error('Keine Datei vorhanden');
    }

    if (file.size > maxSize) {
        throw new Error(`Datei zu groß (Max: ${maxSize / 1024 / 1024}MB)`);
    }

    if (file.size < minSize) {
        throw new Error('Datei zu klein');
    }

    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(`Ungültiger Dateityp. Erlaubt sind: ${allowedTypes.join(', ')}`);
    }

    return true;
}

/**
 * Verarbeitet und optimiert Bilder
 */
async function processImage(inputPath, outputPath, options = {}) {
    const {
        width = 1200,
        height = null,
        quality = 80,
        format = 'jpeg'
    } = options;

    try {
        const image = sharp(inputPath)
            .rotate() // Automatische Rotation basierend auf EXIF
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .removeMetadata() // Entfernt EXIF-Daten

        // Format-spezifische Optimierungen
        if (format === 'jpeg') {
            image.jpeg({ quality, mozjpeg: true });
        } else if (format === 'png') {
            image.png({ quality, compressionLevel: 9 });
        }

        await image.toFile(outputPath);
        return outputPath;
    } catch (error) {
        throw new Error(`Bildverarbeitung fehlgeschlagen: ${error.message}`);
    }
}

/**
 * Generiert Thumbnails für Bilder
 */
async function generateThumbnail(inputPath, outputPath, options = {}) {
    const {
        width = 200,
        height = 200,
        quality = 70
    } = options;

    try {
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'cover',
                position: 'centre'
            })
            .jpeg({ quality })
            .toFile(outputPath);

        return outputPath;
    } catch (error) {
        throw new Error(`Thumbnail-Generierung fehlgeschlagen: ${error.message}`);
    }
}

/**
 * Extrahiert Ergebnisse aus PDF-Dateien
 */
async function parsePdfResults(pdfPath) {
    try {
        const dataBuffer = await fs.readFile(pdfPath);
        const data = await pdfParse(dataBuffer);

        // Regex für Ergebniszeilen
        const resultRegex = /(\d+)\s+(\d+)\s+([A-Za-z\s]+)\s+(\d+:\d+\.\d+)/g;
        const results = [];

        let match;
        while ((match = resultRegex.exec(data.text)) !== null) {
            results.push({
                rank: parseInt(match[1]),
                bibNumber: parseInt(match[2]),
                name: match[3].trim(),
                time: match[4]
            });
        }

        return results;
    } catch (error) {
        throw new Error(`PDF-Verarbeitung fehlgeschlagen: ${error.message}`);
    }
}

/**
 * Säubert und normalisiert Dateinamen
 */
function sanitizeFilename(filename) {
    // Entferne Pfade
    const basename = path.basename(filename);
    
    // Entferne ungültige Zeichen
    let cleanName = basename
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Entferne Akzente
        .replace(/[^a-zA-Z0-9.-]/g, '-') // Ersetze ungültige Zeichen
        .replace(/--+/g, '-')            // Entferne doppelte Bindestriche
        .toLowerCase();

    // Füge Zeitstempel und Zufallswert hinzu
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(cleanName);
    const name = path.basename(cleanName, ext);

    return `${name}-${timestamp}-${random}${ext}`;
}

/**
 * Erstellt Upload-Verzeichnisse
 */
async function ensureUploadDirs(basePath) {
    const dirs = ['athletes', 'courses', 'results', 'thumbnails'];
    
    for (const dir of dirs) {
        const dirPath = path.join(basePath, dir);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
}

/**
 * Bereinigt alte Upload-Dateien
 */
async function cleanupOldUploads(basePath, maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 Tage
    try {
        const files = await fs.readdir(basePath);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(basePath, file);
            const stats = await fs.stat(filePath);

            if (now - stats.mtimeMs > maxAge) {
                await fs.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Fehler beim Bereinigen alter Uploads:', error);
    }
}

module.exports = {
    validateFile,
    processImage,
    generateThumbnail,
    parsePdfResults,
    sanitizeFilename,
    ensureUploadDirs,
    cleanupOldUploads
}; 