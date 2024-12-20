// Athletenfoto hochladen
async function uploadAthletePhoto(athleteId, file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`/api/uploads/athlete/${athleteId}/photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Upload fehlgeschlagen');
        
        const data = await response.json();
        return data.photoUrl;
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        throw error;
    }
}

// Streckenplan hochladen
async function uploadCourseMap(courseId, file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`/api/uploads/course/${courseId}/map`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Upload fehlgeschlagen');
        
        const data = await response.json();
        return data.mapUrl;
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        throw error;
    }
} 