
const API_BASE = '/api/auth';

// ============================================
// 1. ВХОД
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value.trim();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const message = document.getElementById('authMessage');

        // Очищаем сообщение
        message.className = 'auth-message';
        message.textContent = '';

        if (!email || !password || !username) {
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
                body: JSON.stringify({username, password})
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
// 2. ПРОВЕРКА АВТОРИЗАЦИИ
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
    logoutItem.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        updateMenu();  // Обновляем меню
        dropdown.classList.remove('open');  // Закрываем меню
        window.location.reload();  // Перезагружаем страницу
    });
});