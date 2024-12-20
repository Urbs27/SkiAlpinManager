const User = require('../models/user');
const Team = require('../models/team');
const bcrypt = require('bcrypt');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken, verifyToken, TOKEN_TYPES } = require('../utils/tokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');
const { dbAsync } = require('../config/database');

class AuthController {
    static async showLogin(req, res) {
        res.render('auth/login', {
            title: 'Login - Ski Alpin Manager',
            error: null
        });
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            
            const user = await dbAsync.get(
                'SELECT * FROM users WHERE username = ?', 
                [username]
            );
            
            if (!user) {
                return res.status(401).render('auth/login', {
                    title: 'Login - Ski Alpin Manager',
                    error: 'Ungültiger Benutzername oder Passwort'
                });
            }
            
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).render('auth/login', {
                    title: 'Login - Ski Alpin Manager',
                    error: 'Ungültiger Benutzername oder Passwort'
                });
            }
            
            req.session.userId = user.id;
            res.redirect('/team');
            
        } catch (error) {
            console.error('Login-Fehler:', error);
            res.status(500).render('error', {
                title: 'Fehler',
                error: 'Ein Fehler ist aufgetreten'
            });
        }
    }

    static async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error('Fehler beim Ausloggen:', err);
                return res.status(500).render('error', {
                    title: 'Fehler',
                    error: 'Interner Serverfehler'
                });
            }
            res.redirect('/auth/login');
        });
    }

    static async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validierung
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    message: 'Benutzername, E-Mail und Passwort sind erforderlich' 
                });
            }

            // Prüfe ob Benutzer bereits existiert
            const existingUser = await dbAsync.get(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Benutzername oder E-Mail bereits vergeben' 
                });
            }

            // Passwort hashen
            const hashedPassword = await bcrypt.hash(password, 10);

            // Benutzer erstellen
            const result = await dbAsync.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );

            // Verifizierungs-Token generieren und E-Mail senden
            const verificationToken = generateToken({ userId: result.lastID }, '24h');
            await sendVerificationEmail(email, verificationToken);

            res.status(201).json({ 
                message: 'Benutzer erfolgreich registriert' 
            });

        } catch (error) {
            // Spezifische Fehlermeldungen für verschiedene Fehlertypen
            if (error.code === 'SQLITE_CONSTRAINT') {
                res.status(409).json({ 
                    message: 'E-Mail oder Benutzername bereits vergeben' 
                });
            } else {
                console.error('Registrierungsfehler:', error);
                res.status(500).json({ 
                    message: 'Interner Serverfehler bei der Registrierung',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        }
    }

    static async resetPassword(req, res) {
        // ... Passwort-Reset-Logik ...
    }

    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;
            
            // Token verifizieren
            const decoded = verifyToken(token);
            if (!decoded || !decoded.userId) {
                return res.status(400).json({ 
                    message: 'Ungültiger oder abgelaufener Token' 
                });
            }

            // Benutzer als verifiziert markieren
            await dbAsync.run(
                'UPDATE users SET email_verified = 1 WHERE id = ?',
                [decoded.userId]
            );

            res.json({ message: 'E-Mail erfolgreich verifiziert' });

        } catch (error) {
            console.error('Verifizierungsfehler:', error);
            res.status(500).json({ 
                message: 'Fehler bei der E-Mail-Verifizierung' 
            });
        }
    }

    static async forgotPassword(req, res) {
        // ... Passwort-Vergessen-Logik ...
    }
}

module.exports = AuthController; 