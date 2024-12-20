const express = require('express');
const router = express.Router();
const { 
    uploadAthletePhoto, 
    uploadCourseMap, 
    uploadResultList, 
    handleUploadError 
} = require('../config/uploads');
const { verifyToken, isAdmin, isRaceOfficial } = require('../middleware/auth');

// Athletenfotos Upload
router.post('/athlete/:athleteId/photo', 
    verifyToken,
    uploadAthletePhoto,
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen' });
            }

            // Datei wurde erfolgreich gespeichert
            const photoUrl = `/assets/athletes/${req.file.filename}`;
            
            // Update Athlet in der Datenbank
            await req.app.get('db').run(
                'UPDATE athletes SET photo_url = ? WHERE id = ?',
                [photoUrl, req.params.athleteId]
            );

            res.json({
                success: true,
                photoUrl,
                message: 'Athletenfoto erfolgreich hochgeladen'
            });
        } catch (error) {
            console.error('Fehler beim Speichern des Fotos:', error);
            res.status(500).json({ error: 'Interner Server-Fehler' });
        }
    }
);

// Streckenplan Upload
router.post('/course/:courseId/map',
    verifyToken,
    isRaceOfficial,
    uploadCourseMap,
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen' });
            }

            const mapUrl = `/assets/courses/${req.file.filename}`;
            
            // Streckenplan in DB speichern
            await req.app.get('db').run(
                'UPDATE season_calendar SET course_map_url = ? WHERE id = ?',
                [mapUrl, req.params.courseId]
            );

            res.json({
                success: true,
                mapUrl,
                message: 'Streckenplan erfolgreich hochgeladen'
            });
        } catch (error) {
            console.error('Fehler beim Speichern des Streckenplans:', error);
            res.status(500).json({ error: 'Interner Server-Fehler' });
        }
    }
);

// Ergebnisliste Upload
router.post('/competition/:competitionId/results',
    verifyToken,
    isRaceOfficial,
    uploadResultList,
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen' });
            }

            const resultUrl = `/assets/results/${req.file.filename}`;
            
            // PDF-Ergebnisliste in DB verlinken
            await req.app.get('db').run(
                'UPDATE competitions SET result_pdf_url = ?, status = "completed" WHERE id = ?',
                [resultUrl, req.params.competitionId]
            );

            // Optional: PDF parsen und Ergebnisse automatisch eintragen
            // await parseResultsPDF(req.file.path, req.params.competitionId);

            res.json({
                success: true,
                resultUrl,
                message: 'Ergebnisliste erfolgreich hochgeladen'
            });
        } catch (error) {
            console.error('Fehler beim Speichern der Ergebnisliste:', error);
            res.status(500).json({ error: 'Interner Server-Fehler' });
        }
    }
);

// Mehrere Bilder für Streckenimpressionen
router.post('/course/:courseId/gallery',
    verifyToken,
    isRaceOfficial,
    uploadCourseMap.array('images', 10), // Max 10 Bilder
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
            }

            const imageUrls = req.files.map(file => `/assets/courses/gallery/${file.filename}`);
            
            // Bilder in DB speichern
            for (const imageUrl of imageUrls) {
                await req.app.get('db').run(
                    'INSERT INTO course_images (course_id, image_url) VALUES (?, ?)',
                    [req.params.courseId, imageUrl]
                );
            }

            res.json({
                success: true,
                imageUrls,
                message: `${req.files.length} Bilder erfolgreich hochgeladen`
            });
        } catch (error) {
            console.error('Fehler beim Speichern der Galeriebilder:', error);
            res.status(500).json({ error: 'Interner Server-Fehler' });
        }
    }
);

// Fehlerbehandlung
router.use((error, req, res, next) => {
    console.error('Upload-Fehler:', error);
    res.status(500).json({
        error: 'Upload fehlgeschlagen',
        details: error.message
    });
});

module.exports = router; 