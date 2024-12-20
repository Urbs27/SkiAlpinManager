document.addEventListener('DOMContentLoaded', function() {
    // Team bearbeiten
    const editTeamForm = document.getElementById('editTeamForm');
    if (editTeamForm) {
        editTeamForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(editTeamForm);
                const response = await fetch('/team/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': formData.get('_csrf')
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });

                if (!response.ok) {
                    throw new Error('Fehler beim Aktualisieren des Teams');
                }

                const result = await response.json();
                
                // Modal schließen und Seite neu laden
                const modal = bootstrap.Modal.getInstance(document.getElementById('editTeamModal'));
                modal.hide();
                window.location.reload();

            } catch (error) {
                console.error('Update error:', error);
                alert('Fehler beim Aktualisieren des Teams');
            }
        });
    }

    // Trainer einstellen
    const hireCoachForm = document.getElementById('hireCoachForm');
    if (hireCoachForm) {
        hireCoachForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(hireCoachForm);
                const response = await fetch('/team/coach/hire', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': formData.get('_csrf')
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });

                if (!response.ok) {
                    throw new Error('Fehler beim Einstellen des Trainers');
                }

                const result = await response.json();
                
                // Modal schließen und Seite neu laden
                const modal = bootstrap.Modal.getInstance(document.getElementById('hireCoachModal'));
                modal.hide();
                window.location.reload();

            } catch (error) {
                console.error('Hire coach error:', error);
                alert('Fehler beim Einstellen des Trainers');
            }
        });
    }
});

// Trainer entlassen
async function fireCoach(coachId) {
    if (!confirm('Möchten Sie diesen Trainer wirklich entlassen?')) {
        return;
    }

    try {
        const csrfToken = document.querySelector('input[name="_csrf"]').value;
        const response = await fetch(`/team/coach/fire/${coachId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Fehler beim Entlassen des Trainers');
        }

        // Seite neu laden nach erfolgreicher Aktion
        window.location.reload();

    } catch (error) {
        console.error('Fire coach error:', error);
        alert('Fehler beim Entlassen des Trainers');
    }
}

// Toast-Nachrichten anzeigen
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Toast nach dem Ausblenden entfernen
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
} 