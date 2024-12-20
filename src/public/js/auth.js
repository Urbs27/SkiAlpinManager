document.addEventListener('DOMContentLoaded', function() {
    // Form Validation
    const form = document.querySelector('.auth-form');
    const inputs = form.querySelectorAll('input[required]');

    form.addEventListener('submit', function(e) {
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'Dieses Feld ist erforderlich');
            } else {
                removeError(input);
            }
        });

        if (!isValid) {
            e.preventDefault();
        }
    });

    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (input.value.trim()) {
                removeError(input);
            }
        });
    });

    // Password strength indicator
    const passwordInput = document.querySelector('#password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    // Remember me functionality
    const rememberMe = document.querySelector('#remember');
    if (rememberMe) {
        rememberMe.checked = localStorage.getItem('rememberMe') === 'true';
        rememberMe.addEventListener('change', function() {
            localStorage.setItem('rememberMe', this.checked);
        });
    }
});

// Helper functions
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    let error = formGroup.querySelector('.error-message');
    
    if (!error) {
        error = document.createElement('div');
        error.className = 'error-message';
        formGroup.appendChild(error);
    }
    
    error.textContent = message;
    formGroup.classList.add('has-error');
}

function removeError(input) {
    const formGroup = input.closest('.form-group');
    const error = formGroup.querySelector('.error-message');
    
    if (error) {
        error.remove();
    }
    formGroup.classList.remove('has-error');
}

function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    const meter = document.querySelector('.password-strength');
    
    if (meter) {
        meter.style.width = `${strength}%`;
        meter.className = `password-strength ${getStrengthClass(strength)}`;
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    
    return strength;
}

function getStrengthClass(strength) {
    if (strength <= 25) return 'weak';
    if (strength <= 50) return 'medium';
    if (strength <= 75) return 'good';
    return 'strong';
} 