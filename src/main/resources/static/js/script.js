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
        window.location.href = '/login.html';
    });

    // Зарегистрироваться
    registerItem.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/login.html';  // Можно сделать отдельную страницу
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