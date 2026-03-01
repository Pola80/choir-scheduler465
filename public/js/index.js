const message = document.getElementById('message');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Tab switching via data-tab attribute
document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        document.querySelectorAll('.form-section').forEach(function(s) { s.classList.remove('active'); });
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.getElementById(tab + '-section').classList.add('active');
        this.classList.add('active');
    });
});

function showMessage(text, isError) {
    message.textContent = text;
    message.className = 'message show ' + (isError ? 'error' : 'success');
}

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    showMessage('Signing in...', false);

    try {
        const response = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));

        showMessage('Welcome! Redirecting...', false);
        setTimeout(function() {
            window.location.href = '/dashboard.html';
        }, 800);
    } catch (error) {
        showMessage(error.message, true);
    }
});

registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', true);
        return;
    }

    showMessage('Creating account...', false);

    try {
        const response = await fetch('/api/v1/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));

        showMessage('Account created! Redirecting...', false);
        setTimeout(function() {
            window.location.href = '/dashboard.html';
        }, 800);
    } catch (error) {
        showMessage(error.message, true);
    }
});
