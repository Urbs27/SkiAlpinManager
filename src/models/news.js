class News {
    static async getLatest(limit) {
        // Beispiel: Rückgabe von Dummy-Daten
        return [
            { id: 1, title: 'Neuigkeit 1', content: 'Inhalt der Neuigkeit 1' },
            { id: 2, title: 'Neuigkeit 2', content: 'Inhalt der Neuigkeit 2' }
        ].slice(0, limit);
    }

    static async getAll() {
        // Beispiel: Rückgabe von Dummy-Daten
        return [
            { id: 1, title: 'Neuigkeit 1', content: 'Inhalt der Neuigkeit 1' },
            { id: 2, title: 'Neuigkeit 2', content: 'Inhalt der Neuigkeit 2' }
        ];
    }
}

module.exports = News; 