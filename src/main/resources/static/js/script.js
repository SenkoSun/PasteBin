// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const API_BASE = '/api';


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

        const accessToken = localStorage.getItem('accessToken');

        // 1. Отправляем запрос на сервер (если есть токен)
        if (accessToken) {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
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