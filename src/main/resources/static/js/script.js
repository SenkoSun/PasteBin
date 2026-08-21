// ============================================
// КОНФИГУРАЦИЯ
// ============================================

// const API_BASE = '/api';


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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function createNoteCard(note) {
        // Создаем элемент
        const card = document.createElement('div');
        card.className = 'note-card';
        card.dataset.id = note.id;
        card.dataset.slug = note.slug;

        let displayContent = note.content || 'Пустая заметка';
        if (displayContent.length > 385) {
            displayContent = displayContent.substring(0, 385) + '...';
        }

        // Заполняем HTML
        card.innerHTML = `   
        <h3 class="note-title">${escapeHtml(note.title || '')}</h3>
        <div class="note-content">${escapeHtml(displayContent)}</div>
        
        <div class="note-actions">
            <button class="action-btn share-btn" data-id="${note.id}" title="Поделиться">
                <span class="material-symbols-outlined">share</span>
            </button>
        
            <button class="action-btn edit-btn" data-id="${note.id}" title="Редактировать">
                <span class="material-symbols-outlined">edit</span>
            </button>
            
            <button class="action-btn delete-btn" data-id="${note.id}" title="Удалить">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `;


        const shareBtn = card.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => shareNote(note));

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => openNoteModal(note));

        card.addEventListener('click', (e) => {
            // Если кликнули не на кнопку (т.е. не на edit, delete и т.д.), то открываем
            if (!e.target.closest('button')) {
                openNoteModal(note);
            }
        });

        return card;
    }

    async function showPastes() {
        const userEmptyState  = document.getElementById('emptyStateUser');
        const guestEmptyState  = document.getElementById('emptyStateGuest');

        const token = localStorage.getItem('accessToken');

        if (token) {
            guestEmptyState.style.display = 'none';
        } else {
            return;
        }

        try {
            const response = await fetch('/api/pastes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Ошибка загрузки:', response.status);
                return;
            }

            const data = await response.json();
            const grid = document.getElementById('notesGrid');
            grid.innerHTML = '';
            if (data && data.length > 0) {
                data.forEach(note => {
                    const card = createNoteCard(note);
                    grid.appendChild(card);
                });

                userEmptyState.style.display = 'none';

            } else {
                userEmptyState.style.display = 'block';
            }

        } catch (error) {
            console.error('Ошибка при загрузке заметок:', error);
        }
    }
    showPastes();

    async function shareNote(note) {
        const slug = note.slug;

        if (!slug) {
            alert('Заметка без уникального slug. Не можем поделиться!');
            return;
        }

        const link = `${window.location.origin}/search/${slug}`;

        try {
            const clipboard = window.navigator.clipboard;
            if (!clipboard) {
                alert('Копирование не поддерживается вашим браузером.');
                return;
            }
            await clipboard.writeText(link);

            const shareBtn = document.querySelector(`.share-btn[data-id="${note.id}"]`);
            shareBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';

            setTimeout(() => {
                shareBtn.innerHTML = '<span class="material-symbols-outlined">share</span>';
            }, 700);

        } catch (error) {
            console.error('Ошибка при копировании:', error);
            alert('Не удалось копировать: ' + error.message);
        }
    }

    async function deleteNote(noteId) {
        if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
            return;
        }

        try {
            // 2. Отправляем DELETE запрос на сервер
            const response = await fetch(`/api/pastes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return;
            }

            const card = document.querySelector(`.note-card[data-id="${noteId}"]`);

            if (card) {
                // Добавляем плавное исчезновение
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';

                // Через 300 мс удаляем из DOM
                setTimeout(() => {
                    card.remove();
                    const grid = document.getElementById('notesGrid');
                    const userEmptyState = document.getElementById('emptyStateUser');
                    const noteCards = grid.querySelectorAll('.note-card');

                    if (noteCards.length === 0) {
                        userEmptyState.style.display = 'block';
                    } else {
                        userEmptyState.style.display = 'none';
                    }
                }, 300);

            }

        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Не удалось удалить заметку: ' + error.message);
        }
    }


    const wrapper = document.getElementById('noteCreatorWrapper');
    const titleInput = document.getElementById('noteTitleInput');
    const contentInput = document.getElementById('noteContentInput');
    const ttlInput = document.getElementById('ttlInput');
    const closeBtn = document.getElementById('closeFormBtn');
    const saveBtn = document.getElementById('saveNoteBtn');

    const token = localStorage.getItem('accessToken');

    // 1. Функция сворачивания и очистки
    const collapseAndClear = () => {
        wrapper.classList.remove('expanded');

        setTimeout(() => {
            titleInput.value = '';
            contentInput.value = '';
            ttlInput.value = '';
            ttlInput.blur();
            titleInput.blur();
            contentInput.blur();
        }, 450);
    };

    // 2. Логика клика для РАЗВОРАЧИВАНИЯ (вешаем на документ, чтобы ловить клик по плейсхолдеру)
    document.addEventListener('click', (event) => {
        // Если кликнули внутри обертки, и она еще не раскрыта
        if (wrapper.contains(event.target) && !wrapper.classList.contains('expanded')) {

            // const token = localStorage.getItem('token');
            //
            // // Если токена нет - не даем открыть форму, выводим предупреждение
            // if (!token) {
            //     alert('Чтобы создать заметку, пожалуйста, войдите в аккаунт.');
            //     return; // Выходим, не раскрывая форму
            // }


            wrapper.classList.add('expanded');
            setTimeout(() => titleInput.focus(), 100); // Задержка, чтобы анимация успела начаться
        }
    });

    // 3. Кнопка "Закрыть"
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseAndClear();
    });

    const ttlWrapper = document.querySelector('.ttl-wrapper');
    // 4. Меню для ввода минут
    ttlWrapper.addEventListener('focus', function() {
        ttlInput.select();
    });

    ttlInput.addEventListener('focus', function() {
        this.select();
    });

    ttlInput.addEventListener('change', function() {
        let val = parseInt(this.value, 10);

        if (val > 1440) {
            this.value = 1440;
        }
    });

    // 5. Кнопка "Сохранить"
    saveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        // Если токена нет - не даем открыть форму, выводим предупреждение
        if (!token) {
            collapseAndClear();
            alert('Чтобы создать заметку, пожалуйста, войдите в аккаунт.');
            return;
        }

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const ttlValue = ttlInput.value.trim();

        let ttlMinutes = parseInt(ttlValue, 10);

        if (!ttlValue) {
            ttlMinutes = 60;
        } else {
            if (!isNaN(parseFloat(ttlValue)) && !Number.isInteger(parseFloat(ttlValue))) {
                alert('Время должно быть натуральным числом минут');
                return;
            }
        }

        if (isNaN(ttlMinutes)) {
            alert('Время должно быть натуральным числом минут');
            return;
        }


        if (!content) {
            alert('Нельзя сохранить пустую заметку!');
            return;
        }

        if (content.length > 1000) {
            alert('Размер заметки может быть не более чем 1000');
            return;
        }

        if (ttlMinutes < 1) {
            alert('Число минут должно быть положительным!');
            return;
        }

        if (ttlMinutes > 1440) {
            alert(`Максимальное время жизни заметки — 1440 минут`);
            ttlMinutes = 1440;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';

        try {
            const response = await fetch('/api/pastes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title, content, ttlMinutes})
            });

            if (!response.ok) {
                return;
            }
            const newNote = await response.json();

            // 5. Добавляем ее в ваш список (например, создаем карточку через вашу функцию createNoteElement)
            const grid = document.getElementById('notesGrid');
            const noteCard = createNoteCard(newNote);
            grid.prepend(noteCard);

            const userEmptyState = document.getElementById('emptyStateUser');
            const noteCards = grid.querySelectorAll('.note-card');

            if (noteCards.length === 0) {
                userEmptyState.style.display = 'block';
            } else {
                userEmptyState.style.display = 'none';
            }


            collapseAndClear();
         } catch (error) {
            console.error('Ошибка при отправке заметки:', error);
            alert('Не удалось сохранить заметку: ' + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Сохранить";
        }
    });

    // 5. Клик ВНЕ формы для сворачивания
    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target) && wrapper.classList.contains('expanded')) {
            collapseAndClear();
        }
    });


    const modalOverlay = document.getElementById('noteModalOverlay');
    const modalTitleInput = document.getElementById('modalTitleInput');
    const modalContentInput = document.getElementById('modalContentInput');
    const modalTtlInput = document.getElementById('modalTtlInput');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const modalShareBtn = document.getElementById('modalShareBtn');
    const modalSlug = document.getElementById('modalSlug');


    let modalOriginalNote = null;

    function openNoteModal(note) {
        // Получаем данные исходной заметки (сохраняем снапшот)
        modalOriginalNote = { ...note }; // Копия объекта

        // Заполняем окно
        modalTitleInput.value = note.title || 'Без названия';
        modalContentInput.value = note.content;
        modalTtlInput.value = note.ttlMinutes || '0'; // Заполняем время жизни

        modalSlug.textContent  = note.slug || 'Неизвестный slug';

        // Открываем окно
        modalOverlay.classList.add('active');

        setTimeout(() => {
            modalContentInput.focus();
        }, 50)
    }

// 2. Функция закрытия модального окна (ОТКАТ)
    function closeNoteModal() {
        // При закрытии (без сохранения) возвращаем исходные данные, чтобы они не "запомнились"
        if (modalOriginalNote) {
            modalTitleInput.value = modalOriginalNote.title || 'Без названия';
            modalContentInput.value = modalOriginalNote.content;
            modalTtlInput.value = modalOriginalNote.ttlMinutes || '0';
        }

        modalOverlay.classList.remove('active');
        modalOriginalNote = null; // Убираем снапшот

        modalContentInput.blur();
        modalTitleInput.blur();
    }

    modalCloseBtn.addEventListener('click', closeNoteModal);

// Клик по затемнению (если кликнули вне окна)
    modalOverlay.addEventListener('mousedown', (e) => {
        if (e.target === modalOverlay) {
            closeNoteModal();
        }
    });

    function updateCardInGrid(note) {
        // При закрытии (без сохранения) возвращаем исходные данные, чтобы они не "запомнились"
        const newCard = createNoteCard(note);
        const oldCard = document.querySelector(`.note-card[data-id="${note.id}"]`);

        // Вставить новая карточка vor старую
        if (oldCard) {
            oldCard.replaceWith(newCard);
        }
    }

// 4. Кнопка "Сохранить"
    modalSaveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const title = modalTitleInput.value.trim();
        const content = modalContentInput.value.trim();
        const ttlValues = document.getElementById('modalTtlInput').value;
        const noteId = modalOriginalNote.id;

        if (!content) {
            alert('Нельзя сохранить пустую заметку!');
            return;
        }

        if (content.length > 1000) {
            alert('Размер заметки может быть не более чем 1000');
            return;
        }

        let ttlMinutes = parseInt(ttlValues, 10);

        if (!isNaN(parseFloat(ttlValues)) && !Number.isInteger(parseFloat(ttlValues))) {
            alert('Время должно быть натуральным числом минут');
            return;
        }

        if (isNaN(ttlMinutes)) {
            alert('Время должно быть натуральным числом минут');
            return;
        }

        if (!ttlMinutes) {
            ttlMinutes = 1;
        }

        if (ttlMinutes < 0) {
            alert('Число минут должно быть положительным!');
            return;
        }

        if (ttlMinutes > 1440) {
            alert(`Максимальное время жизни заметки — 1440 минут`);
            ttlMinutes = 1440; // Обрезаем до безопасного значения
        }

        try {
            const response = await fetch(`/api/pastes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content, ttlMinutes })
            });

            if (!response.ok) {
                alert('Ошибка при редактировании');
                return;
                // throw new Error('Ошибка при редактировании');
            }

            const updatedNote = await response.json();
            updateCardInGrid(updatedNote);


            modalOriginalNote = { ...updatedNote };

            closeNoteModal();

        } catch (error) {
            console.error('Ошибка при редактировании:', error);
            alert('Не удалось редактировать заметку: ' + error.message);
        }
    });

    modalTtlInput.addEventListener('focus', function() {
        this.select();
    });

    const modalTtlWrapper = document.querySelector('.modal-ttl');

    modalTtlWrapper.addEventListener('focus', function() {
        modalTtlInput.select();
    });

    modalShareBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (!modalSlug.textContent) {
            alert('Заметка без уникального slug. Не можем поделиться!');
            return;
        }

        const link = `${window.location.origin}/search/${modalSlug.textContent}`;


        try {
            const clipboard = window.navigator.clipboard;
            if (!clipboard) {
                alert('Копирование не поддерживается вашим браузером.');
                return;
            }
            await clipboard.writeText(link);
            modalShareBtn.textContent = 'Скопировано!';
            setTimeout(() => {
                modalShareBtn.textContent = 'Поделиться';
            }, 1000);
            // alert('Копировано! Ссылка: ' + link);
        } catch (error) {
            console.error('Ошибка при копировании:', error);
            alert('Не удалось копировать: ' + error.message);
        }
    });

    modalSlug.addEventListener('click', async (e) => {
        e.stopPropagation();

        const clipboard = window.navigator.clipboard;
        const link = modalSlug.textContent;

        try {
            await clipboard.writeText(link);
            modalSlug.textContent = 'Скопировано!';

            setTimeout(() => {
                modalSlug.textContent = link || 'Неизвестный slug';
            }, 1000);
        } catch (error) {
            console.error('Ошибка при копировании:', error);
            alert('Не удалось копировать: ' + error.message);
        }
    });



    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', () => {
        showPastes();
    });



});