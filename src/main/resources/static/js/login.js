// ============================================
// AUTH.JS - Страницы /login и /register
// ============================================

const API_BASE = '/api/auth';

// ============================================
// 1. ВХОД
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const message = document.getElementById('authMessage');

        // Очищаем сообщение
        message.className = 'auth-message';
        message.textContent = '';

        if (!email || !password) {
            message.textContent = 'Заполните все поля';
            message.className = 'auth-message error';
            return;
        }

        const btn = loginForm.querySelector('.auth-btn');
        btn.disabled = true;
        btn.textContent = 'Вход...';

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка входа');
            }

            // Сохраняем токены
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            message.textContent = 'Вход выполнен!';
            message.className = 'auth-message success';

            setTimeout(() => {
                window.location.href = '/';
            }, 800);

        } catch (error) {
            message.textContent = error.message;
            message.className = 'auth-message error';
            btn.disabled = false;
            btn.textContent = 'Продолжить';
        }
    });
}

// ============================================
// 2. РЕГИСТРАЦИЯ
// ============================================

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const message = document.getElementById('authMessage');

        // Очищаем сообщение
        message.className = 'auth-message';
        message.textContent = '';

        if (!username || !email || !password) {
            message.textContent = 'Заполните все поля';
            message.className = 'auth-message error';
            return;
        }

        if (password.length < 6) {
            message.textContent = 'Пароль должен быть минимум 6 символов';
            message.className = 'auth-message error';
            return;
        }

        const btn = registerForm.querySelector('.auth-btn');
        btn.disabled = true;
        btn.textContent = 'Регистрация...';

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка регистрации');
            }

            message.textContent = 'Регистрация успешна! Теперь войдите.';
            message.className = 'auth-message success';

            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);

        } catch (error) {
            message.textContent = error.message;
            message.className = 'auth-message error';
            btn.disabled = false;
            btn.textContent = 'Продолжить';
        }
    });
}

// ============================================
// 3. ПРОВЕРКА АВТОРИЗАЦИИ
// ============================================

const token = localStorage.getItem('accessToken');
if (token && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    window.location.href = '/';
}