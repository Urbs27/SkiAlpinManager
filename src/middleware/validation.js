const { body, validationResult } = require('express-validator');

const validationRules = {
    register: [
        body('email')
            .isEmail()
            .withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Das Passwort muss mindestens 8 Zeichen lang sein')
            .matches(/\d/)
            .withMessage('Das Passwort muss mindestens eine Zahl enthalten')
            .matches(/[A-Z]/)
            .withMessage('Das Passwort muss mindestens einen Großbuchstaben enthalten'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Die Passwörter stimmen nicht überein');
                }
                return true;
            })
    ],
    login: [
        body('email')
            .isEmail()
            .withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Bitte geben Sie Ihr Passwort ein')
    ],
    // Weitere Validierungsregeln hier hinzufügen
};

const validate = (rules) => {
    return [
        ...rules,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ];
};

module.exports = {
    validationRules,
    validate
}; 