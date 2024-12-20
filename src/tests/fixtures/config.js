module.exports = {
    testFiles: {
        athlete: {
            valid: {
                path: 'athletes/valid-photo.jpg',
                type: 'image/jpeg',
                size: 307200 // 300KB
            },
            tooLarge: {
                path: 'athletes/too-large.jpg',
                type: 'image/jpeg',
                size: 6291456 // 6MB
            }
        },
        course: {
            map: {
                path: 'courses/valid-map.jpg',
                type: 'image/jpeg',
                size: 512000 // 500KB
            },
            profile: {
                path: 'courses/course-profile.jpg',
                type: 'image/jpeg',
                size: 256000 // 250KB
            }
        },
        results: {
            pdf: {
                path: 'results/test-results.pdf',
                type: 'application/pdf',
                size: 102400 // 100KB
            }
        },
        gallery: {
            images: [
                {
                    path: 'gallery/image1.jpg',
                    type: 'image/jpeg',
                    size: 409600 // 400KB
                },
                {
                    path: 'gallery/image2.jpg',
                    type: 'image/jpeg',
                    size: 409600 // 400KB
                }
            ]
        }
    },
    
    // Test-Daten für Athleten
    athletes: [
        {
            id: 1,
            firstName: 'Max',
            lastName: 'Mustermann',
            nationality: 'GER',
            photoUrl: null
        }
    ],
    
    // Test-Daten für Strecken
    courses: [
        {
            id: 1,
            name: 'Testabfahrt',
            location: 'Testberg',
            discipline: 'DH',
            mapUrl: null
        }
    ]
};