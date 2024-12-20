const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;
const app = require('../app');
const { dbAsync } = require('../config/database');
const { generateToken } = require('../utils/auth');

describe('Upload Endpoints', () => {
    let authToken;
    let testAthlete;
    let testCourse;
    let testCompetition;

    beforeAll(async () => {
        // Test-Benutzer erstellen und Token generieren
        const testUser = {
            id: 1,
            role: 'official',
            teamId: 1
        };
        authToken = generateToken(testUser);

        // Test-Daten in DB anlegen
        testAthlete = await dbAsync.run(`
            INSERT INTO athletes (first_name, last_name, team_id)
            VALUES (?, ?, ?)
        `, ['Test', 'Athlet', 1]);

        testCourse = await dbAsync.run(`
            INSERT INTO season_calendar (name, location, discipline)
            VALUES (?, ?, ?)
        `, ['Testrennen', 'Testort', 'SL']);

        testCompetition = await dbAsync.run(`
            INSERT INTO competitions (calendar_id, status)
            VALUES (?, ?)
        `, [testCourse.lastID, 'scheduled']);
    });

    afterAll(async () => {
        // Aufräumen - Test-Dateien löschen
        const uploadsDir = path.join(__dirname, '../../uploads');
        const testFiles = await fs.readdir(uploadsDir);
        
        for (const file of testFiles) {
            if (file.startsWith('test-')) {
                await fs.unlink(path.join(uploadsDir, file));
            }
        }

        // Test-Daten aus DB löschen
        await dbAsync.run('DELETE FROM athletes WHERE id = ?', [testAthlete.lastID]);
        await dbAsync.run('DELETE FROM season_calendar WHERE id = ?', [testCourse.lastID]);
        await dbAsync.run('DELETE FROM competitions WHERE id = ?', [testCompetition.lastID]);
    });

    describe('POST /api/uploads/athlete/:athleteId/photo', () => {
        test('sollte ein Athletenfoto erfolgreich hochladen', async () => {
            const response = await request(app)
                .post(`/api/uploads/athlete/${testAthlete.lastID}/photo`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures/test-athlete.jpg'));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('photoUrl');
            expect(response.body.success).toBe(true);
        });

        test('sollte zu große Dateien ablehnen', async () => {
            const response = await request(app)
                .post(`/api/uploads/athlete/${testAthlete.lastID}/photo`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures/too-large.jpg'));

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('zu groß');
        });

        test('sollte falsche Dateitypen ablehnen', async () => {
            const response = await request(app)
                .post(`/api/uploads/athlete/${testAthlete.lastID}/photo`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures/invalid.txt'));

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Dateityp');
        });
    });

    describe('POST /api/uploads/course/:courseId/map', () => {
        test('sollte einen Streckenplan erfolgreich hochladen', async () => {
            const response = await request(app)
                .post(`/api/uploads/course/${testCourse.lastID}/map`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures/test-course.pdf'));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mapUrl');
            expect(response.body.success).toBe(true);
        });

        test('sollte ohne Berechtigung ablehnen', async () => {
            const userToken = generateToken({ id: 2, role: 'user' });
            
            const response = await request(app)
                .post(`/api/uploads/course/${testCourse.lastID}/map`)
                .set('Authorization', `Bearer ${userToken}`)
                .attach('file', path.join(__dirname, '../fixtures/test-course.pdf'));

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/uploads/competition/:competitionId/results', () => {
        test('sollte eine Ergebnisliste erfolgreich hochladen', async () => {
            const response = await request(app)
                .post(`/api/uploads/competition/${testCompetition.lastID}/results`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', path.join(__dirname, '../fixtures/test-results.pdf'));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('resultUrl');
            expect(response.body.success).toBe(true);

            // Prüfe DB-Update
            const competition = await dbAsync.get(
                'SELECT status FROM competitions WHERE id = ?',
                [testCompetition.lastID]
            );
            expect(competition.status).toBe('completed');
        });
    });

    describe('POST /api/uploads/course/:courseId/gallery', () => {
        test('sollte mehrere Bilder erfolgreich hochladen', async () => {
            const response = await request(app)
                .post(`/api/uploads/course/${testCourse.lastID}/gallery`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', path.join(__dirname, '../fixtures/test-image1.jpg'))
                .attach('images', path.join(__dirname, '../fixtures/test-image2.jpg'));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('imageUrls');
            expect(response.body.imageUrls).toHaveLength(2);
            expect(response.body.success).toBe(true);
        });

        test('sollte zu viele Bilder ablehnen', async () => {
            // Versuche 11 Bilder hochzuladen (Limit ist 10)
            const files = Array(11).fill(path.join(__dirname, '../fixtures/test-image.jpg'));
            
            const response = await request(app)
                .post(`/api/uploads/course/${testCourse.lastID}/gallery`)
                .set('Authorization', `Bearer ${authToken}`)
                .attach('images', ...files);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Maximale Anzahl');
        });
    });
}); 