// ============================================
// РЕГИСТРАЦИЯ
// ============================================

const API_BASE = '/api/auth';

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const rep_password = document.getElementById('regPassword2').value.trim();
        const message = document.getElementById('authMessage');

        // Очищаем сообщение
        message.className = 'auth-message';
        message.textContent = '';

        if (!username || !email || !password || !rep_password) {
            message.textContent = 'Заполните все поля';
            message.className = 'auth-message error';
            return;
        }

        if (username.length < 3) {
            message.textContent = 'Логин должен быть минимум 3 символа';
            message.className = 'auth-message error';
            return;
        }

        if (password.length < 6) {
            message.textContent = 'Пароль должен быть минимум 6 символов';
            message.className = 'auth-message error';
            return;
        }

        if (password !== rep_password) {
            message.textContent = 'Пароли должны совпадать';
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
// ПРОВЕРКА АВТОРИЗАЦИИ
// ============================================

const token = localStorage.getItem('accessToken');
if (token && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    window.location.href = '/';
}


// ============================================
// ПРОФИЛЬ - ВЫПАДАЮЩЕЕ МЕНЮ
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // 1. Находим элементы
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    const loginItem = document.getElementById('profileLogin');
    const registerItem = document.getElementById('profileRegister');
    const logoutItem = document.getElementById('profileLogout');

    // 2. Проверяем авторизацию и показываем нужные пункты
    function updateMenu() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Если авторизован - показываем "Выйти"
            loginItem.style.display = 'none';
            registerItem.style.display = 'none';
            logoutItem.style.display = 'block';
        } else {
            // Если не авторизован - показываем "Войти" и "Регистрация"
            loginItem.style.display = 'block';
            registerItem.style.display = 'block';
            logoutItem.style.display = 'none';
        }
    }
    updateMenu();

    // 3. Открытие/закрытие меню по клику на иконку
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();  // Чтобы не закрылось сразу
        dropdown.classList.toggle('open');
        console.log("Открытие/закрытие меню ");
    });

    // 4. Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // 5. Действия пунктов меню

    // Войти
    loginItem.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/login';
    });

    // Зарегистрироваться
    registerItem.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/registration';  // Можно сделать отдельную страницу
    });

    // Выйти
    logoutItem.addEventListener('click', async function(e) {
        e.preventDefault();

        const refreshToken = localStorage.getItem('refreshToken');

        // 1. Отправляем запрос на сервер (если есть токен)
        if (refreshToken) {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`
                    }
                });

                if (!response.ok) {
                    console.log('Ошибка при выходе:', response.status);
                } else {
                    console.log('✅ Выход выполнен успешно');
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        updateMenu();  // Обновляем меню
        dropdown.classList.remove('open');  // Закрываем меню
        window.location.reload();  // Перезагружаем страницу
    });
});