const WebSocket = require('ws');
const Competition = require('../models/competition');
const { verifyToken } = require('../middleware/auth');

class SkiRaceLiveTimingServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.activeRaces = new Map();  // Speichert aktive Rennen
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', async (ws, req) => {
            try {
                // Parameter aus URL extrahieren
                const params = new URLSearchParams(req.url.slice(1));
                const raceId = params.get('race');
                const token = params.get('token');

                // Rennen validieren
                const race = await Competition.getById(raceId);
                if (!race) {
                    ws.close(4000, 'Ungültiges Rennen');
                    return;
                }

                // Berechtigungen prüfen
                let userRole = 'spectator';
                if (token) {
                    try {
                        const user = await verifyToken(token);
                        userRole = user.role; // 'official', 'coach', 'admin'
                    } catch (error) {
                        console.error('Token ungültig:', error);
                        ws.close(4001, 'Ungültiger Token');
                        return;
                    }
                }

                // Verbindung konfigurieren
                ws.raceId = raceId;
                ws.userRole = userRole;

                // Zur Renngruppe hinzufügen
                if (!this.activeRaces.has(raceId)) {
                    this.activeRaces.set(raceId, new Set());
                }
                this.activeRaces.get(raceId).add(ws);

                // Initiale Daten senden
                await this.sendInitialRaceData(ws, race);

                // Message Handler einrichten
                this.setupMessageHandler(ws);
                this.setupHeartbeat(ws);

            } catch (error) {
                console.error('WebSocket Verbindungsfehler:', error);
                ws.close(4000, 'Verbindungsaufbau fehlgeschlagen');
            }
        });
    }

    async sendInitialRaceData(ws, race) {
        const raceData = await Competition.getFullRaceData(race.id);
        const message = {
            type: 'race_init',
            data: {
                info: {
                    id: race.id,
                    name: race.name,
                    discipline: race.discipline,
                    status: race.status,
                    weather: race.weather_conditions,
                    snow: race.snow_conditions,
                    temperature: race.temperature
                },
                course: {
                    gates: race.gates,
                    length: race.length,
                    altitude: {
                        start: race.altitude_start,
                        finish: race.altitude_finish
                    },
                    splits: race.split_locations
                },
                startList: raceData.startList.map(athlete => ({
                    bib: athlete.bib_number,
                    name: `${athlete.first_name} ${athlete.last_name}`,
                    nation: athlete.nationality,
                    points: athlete.fis_points
                })),
                results: raceData.results.map(r => ({
                    bib: r.bib_number,
                    name: `${r.first_name} ${r.last_name}`,
                    nation: r.nationality,
                    run1: r.run1_time,
                    run2: r.run2_time,
                    total: r.total_time,
                    rank: r.rank,
                    diff: r.time_diff,
                    status: r.status,
                    splits: r.split_times
                }))
            }
        };
        ws.send(JSON.stringify(message));
    }

    setupMessageHandler(ws) {
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);

                // Nur autorisierte Updates zulassen
                if (!['official', 'admin'].includes(ws.userRole) && 
                    ['start', 'finish', 'split', 'status'].includes(data.type)) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Nicht autorisiert'
                    }));
                    return;
                }

                switch (data.type) {
                    case 'start':
                        await this.handleStart(ws.raceId, data);
                        break;
                    case 'split':
                        await this.handleSplit(ws.raceId, data);
                        break;
                    case 'finish':
                        await this.handleFinish(ws.raceId, data);
                        break;
                    case 'status':
                        await this.handleStatusUpdate(ws.raceId, data);
                        break;
                    case 'weather':
                        await this.handleWeatherUpdate(ws.raceId, data);
                        break;
                }

            } catch (error) {
                console.error('Nachrichtenverarbeitungsfehler:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Verarbeitungsfehler'
                }));
            }
        });
    }

    async handleStart(raceId, data) {
        const startTime = new Date();
        await Competition.recordStart(data.bib, startTime);
        
        this.broadcast(raceId, {
            type: 'athlete_start',
            data: {
                bib: data.bib,
                startTime: startTime
            }
        });
    }

    async handleSplit(raceId, data) {
        const splitTime = await Competition.recordSplit({
            bib: data.bib,
            split: data.split,
            time: data.time
        });

        this.broadcast(raceId, {
            type: 'split_time',
            data: {
                bib: data.bib,
                split: data.split,
                time: data.time,
                diff: splitTime.diff,
                rank: splitTime.rank
            }
        });
    }

    async handleFinish(raceId, data) {
        const result = await Competition.recordFinish({
            bib: data.bib,
            time: data.time,
            run: data.run
        });

        this.broadcast(raceId, {
            type: 'finish_time',
            data: {
                bib: data.bib,
                run: data.run,
                time: data.time,
                total: result.total,
                rank: result.rank,
                diff: result.diff
            }
        });
    }

    async handleWeatherUpdate(raceId, data) {
        await Competition.updateWeather(raceId, {
            conditions: data.conditions,
            temperature: data.temperature,
            wind: data.wind,
            visibility: data.visibility
        });

        this.broadcast(raceId, {
            type: 'weather_update',
            data: {
                conditions: data.conditions,
                temperature: data.temperature,
                wind: data.wind,
                visibility: data.visibility,
                timestamp: new Date()
            }
        });
    }

    broadcast(raceId, message) {
        const clients = this.activeRaces.get(raceId);
        if (clients) {
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }

    setupHeartbeat(ws) {
        ws.isAlive = true;
        ws.on('pong', () => ws.isAlive = true);

        const interval = setInterval(() => {
            if (ws.isAlive === false) {
                this.removeConnection(ws);
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        }, 30000);

        ws.on('close', () => {
            clearInterval(interval);
            this.removeConnection(ws);
        });
    }

    removeConnection(ws) {
        const clients = this.activeRaces.get(ws.raceId);
        if (clients) {
            clients.delete(ws);
            if (clients.size === 0) {
                this.activeRaces.delete(ws.raceId);
            }
        }
    }
}

module.exports = SkiRaceLiveTimingServer; 