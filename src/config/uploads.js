const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Erlaubte Dateitypen
const MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf'
};

// Maximale Dateigrößen
const FILE_SIZES = {
    athlete_photo: 5 * 1024 * 1024,    // 5MB für Athletenfotos
    course_map: 10 * 1024 * 1024,      // 10MB für Streckenpläne
    result_list: 2 * 1024 * 1024,      // 2MB für Ergebnislisten
    license: 1 * 1024 * 1024           // 1MB für Lizenzen
};

// Storage Konfiguration für verschiedene Upload-Typen
const storageConfigs = {
    athletes: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../../uploads/athletes'));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
            const extension = MIME_TYPES[file.mimetype];
            cb(null, `athlete-${uniqueSuffix}.${extension}`);
        }
    }),

    courses: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../../uploads/courses'));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
            const extension = MIME_TYPES[file.mimetype];
            cb(null, `course-${uniqueSuffix}.${extension}`);
        }
    }),

    results: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../../uploads/results'));
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
            const extension = MIME_TYPES[file.mimetype];
            cb(null, `results-${uniqueSuffix}.${extension}`);
        }
    })
};

// Datei-Filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = Object.keys(MIME_TYPES);
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Ungültiger Dateityp. Erlaubt sind: JPG, PNG und PDF'), false);
    }
};

// Upload-Konfigurationen
const uploadConfigs = {
    athletePhoto: multer({
        storage: storageConfigs.athletes,
        limits: {
            fileSize: FILE_SIZES.athlete_photo
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Nur Bilder sind erlaubt'), false);
            }
        }
    }),

    courseMap: multer({
        storage: storageConfigs.courses,
        limits: {
            fileSize: FILE_SIZES.course_map
        },
        fileFilter
    }),

    resultList: multer({
        storage: storageConfigs.results,
        limits: {
            fileSize: FILE_SIZES.result_list
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Nur PDF-Dateien sind erlaubt'), false);
            }
        }
    })
};

// Middleware für Fehlerbehandlung
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Datei zu groß',
                details: `Maximale Größe: ${FILE_SIZES[req.uploadType] / (1024 * 1024)}MB`
            });
        }
    }
    next(err);
};

// Upload-Helfer
const processUpload = (type) => {
    return async (req, res, next) => {
        req.uploadType = type;
        try {
            await uploadConfigs[type].single('file')(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    uploadAthletePhoto: processUpload('athletePhoto'),
    uploadCourseMap: processUpload('courseMap'),
    uploadResultList: processUpload('resultList'),
    handleUploadError,
    
    // Für direkte Verwendung
    configs: uploadConfigs,
    MIME_TYPES,
    FILE_SIZES
};