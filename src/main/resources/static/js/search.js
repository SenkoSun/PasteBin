document.addEventListener('DOMContentLoaded', function() {
    // 1. Находим элементы
    const profileBtn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    const loginItem = document.getElementById('profileLogin');
    const registerItem = document.getElementById('profileRegister');
    const logoutItem = document.getElementById('profileLogout');

    // 2. Проверяем авторизацию и показываем нужные пункты
    function updateMenu() {
        let token = localStorage.getItem('accessToken');
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
    profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();  // Чтобы не закрылось сразу
        dropdown.classList.toggle('open');
    });

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

        localStorage.clear();
        updateMenu();  // Обновляем меню
        dropdown.classList.remove('open');  // Закрываем меню
        window.location.reload();  // Перезагружаем страницу
    });

    // 4. Закрытие меню при клике вне его
    document.addEventListener('click', function (e) {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
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

        const notesGrid = document.getElementById('notesGrid');
        const isListView = notesGrid.classList.contains('list-view');
        const maxLength = isListView ? 900 : 385;

        if (displayContent.length > maxLength) {
            displayContent = displayContent.substring(0, maxLength) + '...';
        }

        // Заполняем HTML
        card.innerHTML = `   
        <h3 class="note-title">${escapeHtml(note.title || '')}</h3>
        <div class="note-content">${escapeHtml(displayContent)}</div>
        
        <div class="note-actions">
            <button class="action-btn share-btn" data-id="${note.id}" title="Поделиться">
                <span class="material-symbols-outlined">share</span>
            </button>
        </div>
    `;


        const shareBtn = card.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => shareNote(note));

        card.addEventListener('click', (e) => {
            // Если кликнули не на кнопку то открываем
            if (!e.target.closest('button')) {
                // console.log(1);
                openNoteModal(note);
            }
        });

        return card;
    }

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

    async function showPastes() {
        const emptyStateGuest  = document.getElementById('emptyStateGuest');
        const slug = window.location.pathname.split('/').pop();
        try {
            const response = await fetch(`/api/pastes/slug/${slug}`, {
                method: 'GET',
            });

            if (!response.ok) {
                console.error('Ошибка загрузки:', response.status);
                return;
            }

            const data = await response.json();
            console.log(data);
            const grid = document.getElementById('notesGrid');
            grid.innerHTML = '';
            if (data && data.length > 0) {
                data.forEach(note => {
                    const card = createNoteCard(note);
                    grid.appendChild(card);
                });

            } else {
                emptyStateGuest.style.display = 'block';

                //
                // const savedView = localStorage.getItem('notesViewMode') || 'grid';
                // if (savedView === 'list') {
                //     notesGrid.classList.add('list-view');
                // } else {
                //     notesGrid.classList.remove('list-view');
            }

        } catch (error) {
            console.error('Ошибка при загрузке заметок:', error);
        }

    }
    showPastes();

    const modalOverlay = document.getElementById('noteModalOverlay');
    const modalTitleInput = document.getElementById('modalTitleInput');
    const modalContentInput = document.getElementById('modalContentInput');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalShareBtn = document.getElementById('modalShareBtn');
    const modalSlug = document.getElementById('modalSlug');

    let modalOriginalNote = null;

    function openNoteModal(note) {
        // Получаем данные исходной заметки (сохраняем снапшот)
        modalOriginalNote = { ...note }; // Копия объекта

        // Заполняем окно
        modalTitleInput.value = note.title || 'Без названия';
        modalContentInput.value = note.content;

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
        refreshBtn.classList.add('rotating');

        setTimeout(() => {
            showPastes();
        }, 100);

        setTimeout(() => {
            refreshBtn.classList.remove('rotating');
            refreshBtn.style.transition = 'none';

            setTimeout(() => {
                refreshBtn.style.transition = 'transform 0.5s ease';
            }, 10);

        }, 600);
    });

    const viewBtn = document.getElementById('viewBtn');
    const notesGrid = document.getElementById('notesGrid');

    const savedView = localStorage.getItem('notesViewMode') || 'grid';

    function switchView(mode) {
        if (mode === 'list') {
            notesGrid.classList.add('list-view');
            viewBtn.textContent = 'view_agenda'; // Иконка меняется на "сетку"
            localStorage.setItem('notesViewMode', 'list');
        } else {
            notesGrid.classList.remove('list-view');
            viewBtn.textContent = 'grid_view'; // Иконка меняется на "список"
            localStorage.setItem('notesViewMode', 'grid');
        }
    }
    switchView(savedView);

    viewBtn.addEventListener('click', () => {
        const currentMode = notesGrid.classList.contains('list-view') ? 'grid' : 'list';
        switchView(currentMode);
    });


    function searchPage(page) {
        let slug = page.slice(-6);
        window.location.href = `/search/${slug}`;
    }

    const searchInput = document.getElementById('search-input');
    const eraseBtn = document.getElementById('eraseBtn');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && eraseBtn) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchPage(searchInput.value.trim());
            }
        });

        searchInput.addEventListener('focus', () => {
            eraseBtn.style.display = 'block';
        });

        searchInput.addEventListener('blur', () => {
            if (searchInput.value.trim() === '') {
                eraseBtn.style.display = 'none';
            }
        });

        eraseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchInput.value = '';
            searchInput.focus();
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchPage(searchInput.value.trim());
        });
    }


});