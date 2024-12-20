const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfiguriere Speicherung
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';
        
        // Bestimme den Zielordner basierend auf dem Dateityp
        switch (file.fieldname) {
            case 'contract':
                uploadPath = 'uploads/contracts';
                break;
            case 'document':
                uploadPath = 'uploads/documents';
                break;
            case 'report':
                uploadPath = 'uploads/reports';
                break;
            default:
                uploadPath = 'uploads/misc';
        }

        // Erstelle den Ordner, falls er nicht existiert
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generiere eindeutigen Dateinamen
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Dateifilter
const fileFilter = (req, file, cb) => {
    // Erlaubte Dateitypen
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Ungültiger Dateityp. Erlaubt sind: PDF, DOC, DOCX, JPG, PNG'), false);
    }
};

// Konfiguriere Upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB Limit
    }
});

// Middleware für verschiedene Upload-Typen
const uploadMiddleware = {
    single: (fieldName) => upload.single(fieldName),
    multiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    fields: (fields) => upload.fields(fields)
};

// Error Handler für Upload-Fehler
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Datei zu groß. Maximale Größe ist 5MB.'
            });
        }
        return res.status(400).json({
            error: `Upload-Fehler: ${err.message}`
        });
    }
    
    if (err) {
        return res.status(400).json({
            error: err.message
        });
    }
    
    next();
};

// Hilfsfunktion zum Löschen von Dateien
const deleteFile = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Fehler beim Löschen der Datei:', error);
        return false;
    }
};

module.exports = {
    uploadMiddleware,
    handleUploadError,
    deleteFile
}; 