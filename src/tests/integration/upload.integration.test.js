const request = require('supertest');
const path = require('path');
const app = require('../../app');
const { dbAsync } = require('../../config/database');
const { generateToken } = require('../../utils/auth');
const testConfig = require('../fixtures/config');

describe('Upload Integration Tests', () => {
    let authToken;

    beforeAll(async () => {
        // Test-Datenbank initialisieren
        await dbAsync.run('DELETE FROM athletes');
        await dbAsync.run('DELETE FROM courses');
        
        // Test-Benutzer Token erstellen
        authToken = generateToken({ id: 1, role: 'official' });
        
        // Test-Daten einfügen
        for (const athlete of testConfig.athletes) {
            await dbAsync.run(`
                INSERT INTO athletes (id, first_name, last_name, nationality)
                VALUES (?, ?, ?, ?)
            `, [athlete.id, athlete.firstName, athlete.lastName, athlete.nationality]);
        }

        for (const course of testConfig.courses) {
            await dbAsync.run(`
                INSERT INTO courses (id, name, location, discipline)
                VALUES (?, ?, ?, ?)
            `, [course.id, course.name, course.location, course.discipline]);
        }
    });

    describe('Athletenfoto Upload Tests', () => {
        const { valid, tooLarge } = testConfig.testFiles.athlete;

        test('sollte ein gültiges Athletenfoto akzeptieren', async () => {
            const response = await request(app)
                .post('/api/uploads/athlete/1/photo')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures', valid.path));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('photoUrl');

            // Prüfe DB-Update
            const athlete = await dbAsync.get('SELECT photo_url FROM athletes WHERE id = 1');
            expect(athlete.photo_url).toBe(response.body.photoUrl);
        });

        test('sollte zu große Fotos ablehnen', async () => {
            const response = await request(app)
                .post('/api/uploads/athlete/1/photo')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures', tooLarge.path));

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('zu groß');
        });

        test('sollte Bildoptimierung durchführen', async () => {
            const response = await request(app)
                .post('/api/uploads/athlete/1/photo')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures', valid.path));

            // Prüfe ob das Bild optimiert wurde
            const fs = require('fs');
            const uploadedSize = fs.statSync(path.join(__dirname, '../../uploads', response.body.photoUrl.split('/').pop())).size;
            expect(uploadedSize).toBeLessThan(valid.size);
        });
    });

    describe('Streckenplan Upload Tests', () => {
        const { map, profile } = testConfig.testFiles.course;

        test('sollte einen gültigen Streckenplan akzeptieren', async () => {
            const response = await request(app)
                .post('/api/uploads/course/1/map')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures', map.path));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mapUrl');

            // Prüfe ob Vorschaubild erstellt wurde
            const fs = require('fs');
            const thumbnailPath = response.body.mapUrl.replace('/maps/', '/thumbnails/');
            expect(fs.existsSync(path.join(__dirname, '../../public', thumbnailPath))).toBe(true);
        });

        test('sollte Streckenprofil separat speichern', async () => {
            const response = await request(app)
                .post('/api/uploads/course/1/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures', profile.path));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('profileUrl');
        });
    });

    describe('Ergebnisliste Upload Tests', () => {
        const { pdf } = testConfig.testFiles.results;

        test('sollte PDF-Ergebnisliste verarbeiten', async () => {
            const response = await request(app)
                .post('/api/uploads/competition/1/results')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures', pdf.path));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('resultUrl');
            expect(response.body).toHaveProperty('parsedResults');

            // Prüfe ob Ergebnisse in DB gespeichert wurden
            const results = await dbAsync.all('SELECT * FROM competition_results WHERE competition_id = 1');
            expect(results.length).toBeGreaterThan(0);
        });
    });

    describe('Galerie Upload Tests', () => {
        const { images } = testConfig.testFiles.gallery;

        test('sollte mehrere Bilder verarbeiten', async () => {
            const response = await request(app)
                .post('/api/uploads/course/1/gallery')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', path.join(__dirname, '../fixtures', images[0].path))
                .attach('images', path.join(__dirname, '../fixtures', images[1].path));

            expect(response.status).toBe(200);
            expect(response.body.imageUrls).toHaveLength(2);

            // Prüfe ob Thumbnails erstellt wurden
            const fs = require('fs');
            response.body.imageUrls.forEach(url => {
                const thumbnailPath = url.replace('/gallery/', '/thumbnails/');
                expect(fs.existsSync(path.join(__dirname, '../../public', thumbnailPath))).toBe(true);
            });
        });
    });

    afterAll(async () => {
        // Aufräumen
        const uploadsDir = path.join(__dirname, '../../uploads');
        const fs = require('fs').promises;
        const files = await fs.readdir(uploadsDir);
        
        for (const file of files) {
            if (file.startsWith('test-')) {
                await fs.unlink(path.join(uploadsDir, file));
            }
        }
    });
}); 