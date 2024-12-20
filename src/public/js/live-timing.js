class LiveTiming {
    constructor(competitionId, token = null) {
        this.competitionId = competitionId;
        this.token = token;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connect();
    }

    connect() {
        const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws?competition=${this.competitionId}${this.token ? `&token=${this.token}` : ''}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Connected to live timing');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onclose = (event) => {
            if (event.code === 4000) {
                console.error('Connection failed:', event.reason);
            } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, 5000);
            }
        };
    }

    handleMessage(message) {
        switch (message.type) {
            case 'init':
                this.initializeResults(message.data);
                break;
            case 'result_update':
                this.updateResult(message.data);
                break;
            case 'intermediate':
                this.updateIntermediate(message.data);
                break;
            case 'error':
                console.error('Server error:', message.error);
                break;
            case 'weather_update':
                this.updateWeather(message.data);
                break;
        }
    }

    initializeResults(data) {
        // Render initial results table
        const table = document.getElementById('results-table');
        table.innerHTML = data.results.map(result => this.createResultRow(result)).join('');
    }

    updateResult(data) {
        // Update specific result row
        const row = document.querySelector(`tr[data-bib="${data.bib}"]`);
        if (row) {
            if (data.run1) row.querySelector('.run1').textContent = this.formatTime(data.run1);
            if (data.run2) row.querySelector('.run2').textContent = this.formatTime(data.run2);
            if (data.total) row.querySelector('.total').textContent = this.formatTime(data.total);
            
            // Highlight updated row
            row.classList.add('updated');
            setTimeout(() => row.classList.remove('updated'), 2000);
        }
    }

    updateIntermediate(data) {
        // Update intermediate time
        const cell = document.querySelector(`td[data-bib="${data.bib}"][data-split="${data.split}"]`);
        if (cell) {
            cell.textContent = this.formatTime(data.time);
            cell.classList.add('new-split');
            setTimeout(() => cell.classList.remove('new-split'), 2000);
        }
    }

    updateWeather(data) {
        // Update weather information
        const weatherElement = document.getElementById('weather-info');
        if (weatherElement) {
            weatherElement.textContent = `Weather: ${data.condition}, Temp: ${data.temperature}°C`;
        }
    }

    formatTime(time) {
        return time ? time.toFixed(2) : '--.--';
    }

    createResultRow(result) {
        return `
            <tr data-bib="${result.bib}">
                <td>${result.bib}</td>
                <td>${result.name}</td>
                <td><img src="/flags/${result.nation}.png" alt="${result.nation}" class="nation-flag"> ${result.nation}</td>
                <td class="run1">${this.formatTime(result.run1)}</td>
                <td class="run2">${this.formatTime(result.run2)}</td>
                <td class="total">${this.formatTime(result.total)}</td>
                <td>${result.status || ''}</td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const competitionId = document.getElementById('competition-id').value;
    const token = document.getElementById('auth-token').value;
    new LiveTiming(competitionId, token);
}); 