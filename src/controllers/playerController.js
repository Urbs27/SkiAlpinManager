const Player = require('../models/player');
const Team = require('../models/team');

class PlayerController {
    /**
     * Spieler-Übersicht anzeigen
     */
    static async showOverview(req, res) {
        try {
            const teamId = req.params.teamId;
            const team = await Team.getById(teamId);
            const players = await Player.getByTeamId(teamId);

            res.render('players/overview', {
                title: 'Athleten',
                team,
                players
            });
        } catch (error) {
            console.error('Fehler beim Laden der Athleten:', error);
            res.render('error', { error: 'Athleten konnten nicht geladen werden' });
        }
    }

    /**
     * Spieler-Details anzeigen
     */
    static async showDetails(req, res) {
        try {
            const playerId = req.params.id;
            const player = await Player.getById(playerId);

            if (!player) {
                return res.status(404).render('error', { error: 'Athlet nicht gefunden' });
            }

            res.render('players/details', {
                title: `${player.first_name} ${player.last_name}`,
                player
            });
        } catch (error) {
            console.error('Fehler beim Laden der Athleten-Details:', error);
            res.render('error', { error: 'Athleten-Details konnten nicht geladen werden' });
        }
    }

    /**
     * Spieler-Bearbeitung anzeigen
     */
    static async showEdit(req, res) {
        try {
            const playerId = req.params.id;
            const player = await Player.getById(playerId);

            if (!player) {
                return res.status(404).render('error', { error: 'Athlet nicht gefunden' });
            }

            res.render('players/edit', {
                title: `${player.first_name} ${player.last_name} bearbeiten`,
                player
            });
        } catch (error) {
            console.error('Fehler beim Laden der Bearbeitung:', error);
            res.render('error', { error: 'Bearbeitung konnte nicht geladen werden' });
        }
    }

    /**
     * Spieler erstellen
     */
    static async create(req, res) {
        try {
            const playerData = {
                team_id: req.body.team_id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                nationality: req.body.nationality,
                fis_code: req.body.fis_code,
                birth_date: req.body.birth_date,
                // Basis-Stats
                technik: parseInt(req.body.technik),
                kraft: parseInt(req.body.kraft),
                ausdauer: parseInt(req.body.ausdauer),
                mental: parseInt(req.body.mental),
                // Ski-Stats
                gleittechnik: parseInt(req.body.gleittechnik),
                kantentechnik: parseInt(req.body.kantentechnik),
                sprung_technik: parseInt(req.body.sprung_technik),
                // Disziplin-Stats
                dh_skill: parseInt(req.body.dh_skill),
                sg_skill: parseInt(req.body.sg_skill),
                gs_skill: parseInt(req.body.gs_skill),
                sl_skill: parseInt(req.body.sl_skill),
                // Spezial-Stats
                start_technik: parseInt(req.body.start_technik),
                ziel_sprint: parseInt(req.body.ziel_sprint),
                kurven_technik: parseInt(req.body.kurven_technik),
                risiko_bereit: parseInt(req.body.risiko_bereit)
            };

            const playerId = await Player.create(playerData);
            res.redirect(`/players/${playerId}`);
        } catch (error) {
            console.error('Fehler beim Erstellen des Athleten:', error);
            res.render('error', { error: 'Athlet konnte nicht erstellt werden' });
        }
    }

    /**
     * Spieler aktualisieren
     */
    static async update(req, res) {
        try {
            const playerId = req.params.id;
            const playerData = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                fis_code: req.body.fis_code,
                stats: {
                    // Basis-Stats
                    technik: parseInt(req.body.technik),
                    kraft: parseInt(req.body.kraft),
                    ausdauer: parseInt(req.body.ausdauer),
                    mental: parseInt(req.body.mental),
                    // Ski-Stats
                    gleittechnik: parseInt(req.body.gleittechnik),
                    kantentechnik: parseInt(req.body.kantentechnik),
                    sprung_technik: parseInt(req.body.sprung_technik),
                    // Form und Fitness
                    form: parseInt(req.body.form),
                    fitness: parseInt(req.body.fitness),
                    müdigkeit: parseInt(req.body.müdigkeit),
                    // Disziplin-Stats
                    dh_skill: parseInt(req.body.dh_skill),
                    sg_skill: parseInt(req.body.sg_skill),
                    gs_skill: parseInt(req.body.gs_skill),
                    sl_skill: parseInt(req.body.sl_skill),
                    // Spezial-Stats
                    start_technik: parseInt(req.body.start_technik),
                    ziel_sprint: parseInt(req.body.ziel_sprint),
                    kurven_technik: parseInt(req.body.kurven_technik),
                    risiko_bereit: parseInt(req.body.risiko_bereit)
                }
            };

            await Player.update(playerId, playerData);
            res.redirect(`/players/${playerId}`);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Athleten:', error);
            res.render('error', { error: 'Athlet konnte nicht aktualisiert werden' });
        }
    }

    /**
     * Verletzung registrieren
     */
    static async registerInjury(req, res) {
        try {
            const playerId = req.params.id;
            const injuryData = {
                injury_type: req.body.injury_type,
                severity: parseInt(req.body.severity),
                start_date: req.body.start_date,
                expected_return_date: req.body.expected_return_date,
                notes: req.body.notes
            };

            await Player.addInjury(playerId, injuryData);
            res.redirect(`/players/${playerId}`);
        } catch (error) {
            console.error('Fehler beim Registrieren der Verletzung:', error);
            res.render('error', { error: 'Verletzung konnte nicht registriert werden' });
        }
    }
}

module.exports = PlayerController; 