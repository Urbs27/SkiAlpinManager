const { body, validationResult } = require('express-validator');

// Validierungsregeln für Team-Erstellung
const createTeamValidation = [
    body('name')
        .notEmpty()
        .withMessage('Teamname darf nicht leer sein')
        .isLength({ max: 50 })
        .withMessage('Teamname darf maximal 50 Zeichen lang sein'),
    body('budget')
        .isInt({ min: 0 })
        .withMessage('Budget muss eine positive Zahl sein')
];

// Validierungsregeln für Coach-Erstellung
const createCoachValidation = [
    body('name')
        .notEmpty()
        .withMessage('Trainername darf nicht leer sein')
        .isLength({ max: 50 })
        .withMessage('Trainername darf maximal 50 Zeichen lang sein'),
    body('specialization')
        .isIn(['Slalom', 'Riesenslalom', 'Super-G', 'Abfahrt', 'Allrounder'])
        .withMessage('Ungültige Spezialisierung'),
    body('experience')
        .isInt({ min: 0 })
        .withMessage('Erfahrung muss eine positive Zahl sein'),
    body('salary')
        .isInt({ min: 0 })
        .withMessage('Gehalt muss eine positive Zahl sein')
];

// Middleware zur Überprüfung der Validierungsergebnisse
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    createTeamValidation,
    createCoachValidation,
    validate
}; 