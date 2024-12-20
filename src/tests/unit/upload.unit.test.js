const { 
    validateFile,
    processImage,
    generateThumbnail,
    parsePdfResults,
    sanitizeFilename
} = require('../../utils/upload');
const path = require('path');
const testConfig = require('../fixtures/config');

describe('Upload Utilities Unit Tests', () => {
    describe('validateFile', () => {
        test('sollte gültige Dateien akzeptieren', () => {
            const file = {
                size: 1024 * 1024, // 1MB
                mimetype: 'image/jpeg',
                originalname: 'test.jpg'
            };
            
            expect(validateFile(file, {
                maxSize: 2 * 1024 * 1024,
                allowedTypes: ['image/jpeg', 'image/png']
            })).toBe(true);
        });

        test('sollte zu große Dateien ablehnen', () => {
            const file = {
                size: 6 * 1024 * 1024, // 6MB
                mimetype: 'image/jpeg',
                originalname: 'large.jpg'
            };
            
            expect(() => validateFile(file, {
                maxSize: 5 * 1024 * 1024,
                allowedTypes: ['image/jpeg']
            })).toThrow('Datei zu groß');
        });

        test('sollte ungültige Dateitypen ablehnen', () => {
            const file = {
                size: 1024,
                mimetype: 'text/plain',
                originalname: 'test.txt'
            };
            
            expect(() => validateFile(file, {
                maxSize: 1024 * 1024,
                allowedTypes: ['image/jpeg']
            })).toThrow('Ungültiger Dateityp');
        });
    });

    describe('processImage', () => {
        test('sollte Bilder optimieren', async () => {
            const inputPath = path.join(__dirname, '../fixtures', testConfig.testFiles.athlete.valid.path);
            const outputPath = path.join(__dirname, '../../uploads/test-processed.jpg');

            await processImage(inputPath, outputPath, {
                width: 800,
                quality: 80
            });

            const fs = require('fs');
            const processedSize = fs.statSync(outputPath).size;
            const originalSize = fs.statSync(inputPath).size;

            expect(processedSize).toBeLessThan(originalSize);
        });

        test('sollte EXIF-Daten bereinigen', async () => {
            const inputPath = path.join(__dirname, '../fixtures/athletes/with-exif.jpg');
            const outputPath = path.join(__dirname, '../../uploads/test-no-exif.jpg');

            await processImage(inputPath, outputPath);

            const ExifReader = require('exifreader');
            const tags = await ExifReader.load(outputPath);
            
            expect(tags.GPSLatitude).toBeUndefined();
            expect(tags.GPSLongitude).toBeUndefined();
        });
    });

    describe('generateThumbnail', () => {
        test('sollte Thumbnails erstellen', async () => {
            const inputPath = path.join(__dirname, '../fixtures', testConfig.testFiles.course.map.path);
            const outputPath = path.join(__dirname, '../../uploads/test-thumb.jpg');

            await generateThumbnail(inputPath, outputPath, {
                width: 200,
                height: 200
            });

            const sharp = require('sharp');
            const metadata = await sharp(outputPath).metadata();

            expect(metadata.width).toBe(200);
            expect(metadata.height).toBe(200);
        });
    });

    describe('parsePdfResults', () => {
        test('sollte Ergebnisliste aus PDF extrahieren', async () => {
            const pdfPath = path.join(__dirname, '../fixtures', testConfig.testFiles.results.pdf.path);
            const results = await parsePdfResults(pdfPath);

            expect(Array.isArray(results)).toBe(true);
            expect(results[0]).toHaveProperty('rank');
            expect(results[0]).toHaveProperty('bibNumber');
            expect(results[0]).toHaveProperty('name');
            expect(results[0]).toHaveProperty('time');
        });

        test('sollte mit ungültigen PDFs umgehen', async () => {
            const invalidPdfPath = path.join(__dirname, '../fixtures/results/invalid.pdf');
            
            await expect(parsePdfResults(invalidPdfPath))
                .rejects
                .toThrow('Ungültiges PDF-Format');
        });
    });

    describe('sanitizeFilename', () => {
        test('sollte Dateinamen säubern', () => {
            expect(sanitizeFilename('test file.jpg')).toBe('test-file.jpg');
            expect(sanitizeFilename('../../hack.jpg')).toBe('hack.jpg');
            expect(sanitizeFilename('täst.jpg')).toBe('taest.jpg');
            expect(sanitizeFilename('test/\\file.jpg')).toBe('test-file.jpg');
        });

        test('sollte einzigartige Namen generieren', () => {
            const name1 = sanitizeFilename('test.jpg');
            const name2 = sanitizeFilename('test.jpg');
            
            expect(name1).not.toBe(name2);
        });
    });
});

// Mock für Sharp Bildverarbeitung
jest.mock('sharp', () => {
    return jest.fn().mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(true),
        metadata: jest.fn().mockResolvedValue({
            width: 200,
            height: 200
        })
    }));
});

// Mock für PDF Parser
jest.mock('pdf-parse', () => {
    return jest.fn().mockImplementation((buffer) => {
        if (buffer.includes('invalid')) {
            throw new Error('Ungültiges PDF-Format');
        }
        return Promise.resolve({
            text: `
                1 23 Max Mustermann 1:23.45
                2 45 Hans Schmidt 1:24.56
                3 12 Peter Meyer 1:25.67
            `
        });
    });
}); 