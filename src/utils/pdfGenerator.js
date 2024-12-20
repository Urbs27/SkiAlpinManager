const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.doc = new PDFDocument();
    }

    // Generiere einen Vertrag
    async generateContract(contractData) {
        const { coach, team, startDate, endDate, salary } = contractData;
        const filename = `contract_${team.id}_${coach.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../uploads/contracts', filename);

        // Stelle sicher, dass der Ordner existiert
        if (!fs.existsSync(path.dirname(filepath))) {
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }

        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filepath);
            this.doc.pipe(stream);

            // Header
            this.doc
                .fontSize(20)
                .text('Trainervertrag', { align: 'center' })
                .moveDown();

            // Vertragsparteien
            this.doc
                .fontSize(12)
                .text('Zwischen')
                .moveDown(0.5)
                .text(`${team.name} (nachfolgend "Team" genannt)`)
                .moveDown(0.5)
                .text('und')
                .moveDown(0.5)
                .text(`${coach.name} (nachfolgend "Trainer" genannt)`)
                .moveDown();

            // Vertragsinhalte
            this.doc
                .text('wird folgender Vertrag geschlossen:')
                .moveDown()
                .text('§1 Tätigkeit')
                .moveDown(0.5)
                .text(`Der Trainer wird als ${coach.specialization}-Trainer eingestellt.`)
                .moveDown()
                .text('§2 Vertragsdauer')
                .moveDown(0.5)
                .text(`Beginn: ${new Date(startDate).toLocaleDateString()}`)
                .text(`Ende: ${new Date(endDate).toLocaleDateString()}`)
                .moveDown()
                .text('§3 Vergütung')
                .moveDown(0.5)
                .text(`Das jährliche Grundgehalt beträgt ${salary.toLocaleString()} EUR.`)
                .moveDown();

            // Unterschriften
            this.doc
                .moveDown(2)
                .text('Unterschriften:', { align: 'center' })
                .moveDown(2)
                .text('_______________________', { align: 'left' })
                .text('Team', { align: 'left' })
                .moveDown()
                .text('_______________________', { align: 'right' })
                .text('Trainer', { align: 'right' });

            // Datum
            this.doc
                .moveDown(2)
                .text(`Datum: ${new Date().toLocaleDateString()}`, { align: 'center' });

            this.doc.end();

            stream.on('finish', () => {
                resolve({
                    filename,
                    filepath,
                    url: `/uploads/contracts/${filename}`
                });
            });

            stream.on('error', reject);
        });
    }

    // Generiere einen Bericht
    async generateReport(reportData) {
        const { team, period, statistics } = reportData;
        const filename = `report_${team.id}_${period}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../uploads/reports', filename);

        // Stelle sicher, dass der Ordner existiert
        if (!fs.existsSync(path.dirname(filepath))) {
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }

        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filepath);
            this.doc.pipe(stream);

            // Header
            this.doc
                .fontSize(20)
                .text(`Team-Bericht: ${team.name}`, { align: 'center' })
                .moveDown();

            // Berichtszeitraum
            this.doc
                .fontSize(12)
                .text(`Berichtszeitraum: ${period}`)
                .moveDown();

            // Statistiken
            this.doc
                .text('Statistiken:')
                .moveDown(0.5);

            Object.entries(statistics).forEach(([key, value]) => {
                this.doc.text(`${key}: ${value}`);
            });

            this.doc.end();

            stream.on('finish', () => {
                resolve({
                    filename,
                    filepath,
                    url: `/uploads/reports/${filename}`
                });
            });

            stream.on('error', reject);
        });
    }
}

module.exports = PDFGenerator; 