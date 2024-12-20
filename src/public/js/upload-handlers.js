class UploadHandler {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.uploadZone = this.form.querySelector('.upload-zone');
        this.preview = this.form.querySelector('.preview-container img');
        this.progressBar = this.form.querySelector('.progress-bar');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.options = {
            maxSize: options.maxSize || 5 * 1024 * 1024, // Default 5MB
            acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/png'],
            uploadUrl: options.uploadUrl,
            onSuccess: options.onSuccess || this.defaultSuccess,
            onError: options.onError || this.defaultError
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Drag & Drop Events
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // File Input Change
        this.form.querySelector('input[type="file"]').addEventListener('change', 
            (e) => this.handleFileSelect(e));

        // Form Submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length) {
            this.validateAndPreviewFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.validateAndPreviewFile(file);
        }
    }

    validateAndPreviewFile(file) {
        // Dateityp prüfen
        if (!this.options.acceptedTypes.includes(file.type)) {
            this.showError('Ungültiger Dateityp');
            return false;
        }

        // Größe prüfen
        if (file.size > this.options.maxSize) {
            this.showError(`Datei zu groß (Max. ${this.options.maxSize / 1024 / 1024}MB)`);
            return false;
        }

        // Vorschau erstellen
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.preview.src = e.target.result;
                this.preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }

        this.submitButton.disabled = false;
        return true;
    }

    async handleSubmit(e) {
        e.preventDefault();
        const file = this.form.querySelector('input[type="file"]').files[0];
        
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            this.showProgress();
            
            const response = await fetch(this.options.uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload fehlgeschlagen');
            }

            const data = await response.json();
            this.options.onSuccess(data);
            
        } catch (error) {
            this.options.onError(error);
        } finally {
            this.hideProgress();
        }
    }

    showProgress() {
        if (this.progressBar) {
            this.progressBar.style.display = 'block';
            this.submitButton.disabled = true;
        }
    }

    hideProgress() {
        if (this.progressBar) {
            this.progressBar.style.display = 'none';
            this.submitButton.disabled = false;
        }
    }

    showError(message) {
        const errorDiv = this.form.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }

    defaultSuccess(data) {
        const successDiv = this.form.querySelector('.success-message');
        if (successDiv) {
            successDiv.textContent = 'Upload erfolgreich!';
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
    }

    defaultError(error) {
        this.showError(error.message || 'Ein Fehler ist aufgetreten');
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }
}

// Initialisierung der Upload-Handler
document.addEventListener('DOMContentLoaded', () => {
    // Athletenfoto Upload
    new UploadHandler('athletePhotoForm', {
        maxSize: 5 * 1024 * 1024,
        acceptedTypes: ['image/jpeg', 'image/png'],
        uploadUrl: '/api/uploads/athlete/photo',
        onSuccess: (data) => {
            // Aktualisiere Athletenprofil
            document.querySelector('.athlete-profile-image').src = data.photoUrl;
        }
    });

    // Streckenplan Upload
    new UploadHandler('courseMapForm', {
        maxSize: 10 * 1024 * 1024,
        acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        uploadUrl: '/api/uploads/course/map',
        onSuccess: (data) => {
            // Aktualisiere Streckenplan-Anzeige
            location.reload();
        }
    });

    // Ergebnisliste Upload
    new UploadHandler('resultsForm', {
        maxSize: 2 * 1024 * 1024,
        acceptedTypes: ['application/pdf'],
        uploadUrl: '/api/uploads/competition/results',
        onSuccess: (data) => {
            // Aktualisiere Ergebnisanzeige
            document.querySelector('.results-pdf-link').href = data.resultUrl;
        }
    });
}); 