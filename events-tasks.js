// ==========================================
// ЗАДАНИЕ 1: Базовые обработчики событий
// ==========================================

// 1.1. Обработчик клика по кнопке #basic-btn
function handleBasicClick(event) {
  const output = document.getElementById('basic-output');
  const button = event.currentTarget || document.getElementById('basic-btn');

  if (output) {
    const targetInfo = event.target
      ? `${event.target.tagName}${event.target.id ? '#' + event.target.id : ''}`
      : 'неизвестно';
    output.textContent =
      `Тип: ${event.type} | Координаты: (X: ${event.clientX}, Y: ${event.clientY}) | Target: ${targetInfo}`;
  }

  if (button) {
    button.classList.remove('pulse');
    void button.offsetWidth; // перезапуск анимации при быстрых кликах
    button.classList.add('pulse');
    setTimeout(() => {
      button.classList.remove('pulse');
    }, 500);
  }
}

// 1.2. Обработчик событий мыши на #color-box
function handleMouseEvents(event) {
  const colorBox = event.currentTarget || document.getElementById('color-box');
  const mouseOutput = document.getElementById('mouse-output');

  if (!colorBox) return;

  switch (event.type) {
    case 'mouseenter':
      colorBox.style.background = '#e74c3c';
      colorBox.textContent = 'Курсор внутри!';
      break;
    case 'mouseleave':
      colorBox.style.background = '#3498db';
      colorBox.textContent = 'Наведи курсор';
      if (mouseOutput) {
        mouseOutput.textContent = 'Координаты мыши: курсор покинул область';
      }
      break;
    case 'mousemove':
      if (mouseOutput) {
        mouseOutput.textContent =
          `Координаты мыши: offset(${event.offsetX}, ${event.offsetY}) | client(${event.clientX}, ${event.clientY})`;
      }
      break;
  }
}

// 1.3. Настройка обработчиков для задачи 1
function setupBasicEvents() {
  const basicBtn = document.getElementById('basic-btn');
  const colorBox = document.getElementById('color-box');

  if (basicBtn) {
    basicBtn.addEventListener('click', handleBasicClick);
  }

  if (colorBox) {
    colorBox.addEventListener('mouseenter', handleMouseEvents);
    colorBox.addEventListener('mouseleave', handleMouseEvents);
    colorBox.addEventListener('mousemove', handleMouseEvents);
  }
}

// ==========================================
// ЗАДАНИЕ 2: События клавиатуры
// ==========================================

// 2.1. Обработчик событий клавиатуры
function handleKeyEvents(event) {
  const keyOutput = document.getElementById('key-output');
  if (!keyOutput) return;

  const keyLower = (event.key || '').toLowerCase();
  const code = event.code || '';

  const baseInfo =
    `key: "${event.key}" | code: "${code}" | ` +
    `Ctrl: ${event.ctrlKey} | Alt: ${event.altKey} | Shift: ${event.shiftKey}`;

  if (event.ctrlKey && (keyLower === 's' || code === 'KeyS')) {
    event.preventDefault();
    keyOutput.textContent = `Комбинация Ctrl + S перехвачена! (Сохранение отменено)\n${baseInfo}`;
    return;
  }

  if (event.altKey && (keyLower === 'c' || code === 'KeyC')) {
    event.preventDefault();
    keyOutput.textContent = `Комбинация Alt + C перехвачена! (Специальное действие)\n${baseInfo}`;
    return;
  }

  if (event.shiftKey && (keyLower === 'a' || code === 'KeyA')) {
    event.preventDefault();
    keyOutput.textContent = `Комбинация Shift + A перехвачена! (Специальное выделение)\n${baseInfo}`;
    return;
  }

  keyOutput.textContent = `Нажата клавиша: ${baseInfo}`;
}

// 2.2. Настройка обработчиков клавиатуры
function setupKeyboardEvents() {
  const keyInput = document.getElementById('key-input');
  const keyOutput = document.getElementById('key-output');

  if (!keyInput) return;

  keyInput.addEventListener('keydown', handleKeyEvents);
  keyInput.addEventListener('keyup', (event) => {
    if (keyOutput && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      keyOutput.textContent =
        `Состояние сброшено (отпущена клавиша "${event.key}"). Ожидание ввода...`;
    }
  });
}

// ==========================================
// ЗАДАНИЕ 3: Делегирование событий
// ==========================================

// Вспомогательная функция обновления вывода выбранных элементов
function updateDelegationOutput() {
  const itemList = document.getElementById('item-list');
  const output = document.getElementById('delegation-output');
  if (!itemList || !output) return;

  const selectedItems = Array.from(itemList.querySelectorAll('.item.selected'));
  if (selectedItems.length === 0) {
    output.textContent = 'Выбранные элементы: нет';
  } else {
    const ids = selectedItems.map((item) => `#${item.dataset.id}`);
    output.textContent = `Выбранные элементы (${selectedItems.length}): ${ids.join(', ')}`;
  }
}

// 3.1. Обработчик кликов через делегирование на #item-list
function handleDelegationClick(event) {
  const deleteBtn = event.target.closest('.delete');
  if (deleteBtn) {
    const itemToRemove = deleteBtn.closest('.item');
    if (itemToRemove) {
      itemToRemove.remove();
      updateDelegationOutput();
    }
    return;
  }

  const item = event.target.closest('.item');
  if (item) {
    item.classList.toggle('selected');
    updateDelegationOutput();
  }
}

// 3.2. Добавление нового элемента с уникальным data-id
let itemIdCounter = 3;

function addNewItem() {
  const itemList = document.getElementById('item-list');
  if (!itemList) return null;

  // Учитываем существующие data-id в DOM для гарантии уникальности
  const existingIds = Array.from(itemList.querySelectorAll('.item'))
    .map((el) => Number(el.dataset.id))
    .filter((n) => !Number.isNaN(n));

  const maxExisting = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  itemIdCounter = Math.max(itemIdCounter, maxExisting) + 1;

  const newItem = document.createElement('div');
  newItem.className = 'item';
  newItem.dataset.id = String(itemIdCounter);
  newItem.innerHTML = `Элемент ${itemIdCounter} <span class="delete">×</span>`;

  itemList.appendChild(newItem);
  return newItem;
}

// 3.3. Настройка делегирования событий
function setupDelegationEvents() {
  const itemList = document.getElementById('item-list');
  const addItemBtn = document.getElementById('add-item-btn');

  if (itemList) {
    itemList.addEventListener('click', handleDelegationClick);
  }

  if (addItemBtn) {
    addItemBtn.addEventListener('click', addNewItem);
  }
}

// ==========================================
// ЗАДАНИЕ 4: Предотвращение поведения
// ==========================================

// 4.1. Предотвращение перехода по ссылке
function preventLinkDefault(event) {
  event.preventDefault();

  const output = document.getElementById('prevention-output');
  const link = event.currentTarget || document.getElementById('prevent-link');

  if (output) {
    const href = link ? link.getAttribute('href') : '';
    output.textContent = `Переход по ссылке (${href}) предотвращён!`;
  }

  if (link) {
    link.classList.remove('shake');
    void link.offsetWidth;
    link.classList.add('shake');
    setTimeout(() => {
      link.classList.remove('shake');
    }, 300);
  }
}

// 4.2. Предотвращение отправки формы и валидация
function preventFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget || document.getElementById('prevent-form');
  const output = document.getElementById('prevention-output');
  const input = form ? form.querySelector('input[type="text"]') : null;

  if (!output || !input) return;

  const value = input.value.trim();

  if (!value) {
    output.textContent = 'Ошибка валидации: поле не должно быть пустым!';
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 300);
    return;
  }

  output.textContent = `Отправка формы предотвращена! Введённые данные: "${value}"`;
}

// 4.3. Настройка предотвращения поведения
function setupPreventionEvents() {
  const preventLink = document.getElementById('prevent-link');
  const preventForm = document.getElementById('prevent-form');

  if (preventLink) {
    preventLink.addEventListener('click', preventLinkDefault);
  }

  if (preventForm) {
    preventForm.addEventListener('submit', preventFormSubmit);
  }
}

// ==========================================
// ЗАДАНИЕ 5: Кастомные события
// ==========================================

// 5.1. Создание и запуск кастомного события
function triggerCustomEvent() {
  const customEvent = new CustomEvent('customAction', {
    bubbles: true,
    cancelable: true,
    detail: {
      message: 'Привет от кастомного события!',
      timestamp: new Date().toLocaleTimeString()
    }
  });

  document.dispatchEvent(customEvent);
  return customEvent;
}

// 5.2. Обработка кастомного события
function handleCustomEvent(event) {
  const output = document.getElementById('custom-output');
  const triggerBtn = document.getElementById('trigger-custom');

  const message = event.detail?.message ?? 'Нет данных';
  const time = event.detail?.timestamp ? ` (${event.detail.timestamp})` : '';

  if (output) {
    output.textContent = `Кастомные события: ${message}${time}`;
  }

  if (triggerBtn) {
    triggerBtn.classList.remove('pulse');
    void triggerBtn.offsetWidth;
    triggerBtn.classList.add('pulse');
    setTimeout(() => {
      triggerBtn.classList.remove('pulse');
    }, 500);
  }
}

// 5.3. Добавление 3 дополнительных обработчиков на одно кастомное событие
let multipleListenersAdded = false;

function setupMultipleListeners() {
  const output = document.getElementById('custom-output');

  if (multipleListenersAdded) {
    if (output) {
      output.textContent = 'Дополнительные обработчики (3 шт.) уже были добавлены ранее.';
    }
    return;
  }

  const listener1 = (event) => {
    const msg = `[Обработчик 1] Получено: "${event.detail?.message}"`;
    console.log(msg);
    if (output) output.textContent += `\n${msg}`;
  };

  const listener2 = (event) => {
    const msg = `[Обработчик 2] Событие "${event.type}" обработано успешно`;
    console.log(msg);
    if (output) output.textContent += `\n${msg}`;
  };

  const listener3 = (event) => {
    const msg = `[Обработчик 3] Длина сообщения: ${(event.detail?.message || '').length} симв.`;
    console.log(msg);
    if (output) output.textContent += `\n${msg}`;
  };

  document.addEventListener('customAction', listener1);
  document.addEventListener('customAction', listener2);
  document.addEventListener('customAction', listener3);

  multipleListenersAdded = true;

  if (output) {
    output.textContent =
      'Добавлены 3 дополнительных обработчика для события "customAction". Нажмите "Запустить кастомное событие".';
  }
}

// 5.4. Настройка кастомных событий
function setupCustomEvents() {
  const triggerBtn = document.getElementById('trigger-custom');
  const multipleBtn = document.getElementById('multiple-listeners');

  document.addEventListener('customAction', handleCustomEvent);

  if (triggerBtn) {
    triggerBtn.addEventListener('click', triggerCustomEvent);
  }

  if (multipleBtn) {
    multipleBtn.addEventListener('click', setupMultipleListeners);
  }
}

// ==========================================
// ЗАДАНИЕ 6: События загрузки и ошибок
// ==========================================

// 6.1. Загрузка изображения с обработкой событий
function loadImageWithEvents() {
  const container = document.getElementById('image-container');
  const output = document.getElementById('loading-output');
  if (!container || !output) return null;

  container.innerHTML = '';
  container.classList.remove('success', 'error');
  container.classList.add('loading');

  const img = document.createElement('img');
  img.alt = 'Случайное изображение';

  img.addEventListener('loadstart', () => {
    output.textContent = 'Статус загрузки: начата загрузка изображения...';
  });

  img.addEventListener('load', () => {
    container.classList.remove('loading', 'error');
    container.classList.add('success');
    output.textContent =
      `Статус загрузки: изображение успешно загружено (${img.naturalWidth}x${img.naturalHeight})`;
    img.dispatchEvent(new Event('loadend'));
  });

  img.addEventListener('error', () => {
    container.classList.remove('loading', 'success');
    container.classList.add('error');
    output.textContent = 'Статус загрузки: ошибка при загрузке изображения!';
    img.dispatchEvent(new Event('loadend'));
  });

  img.addEventListener('loadend', () => {
    output.textContent += ' | Загрузка завершена (loadend).';
  });

  container.appendChild(img);
  img.dispatchEvent(new Event('loadstart'));
  img.src = `https://picsum.photos/300/200?random=${Date.now()}`;

  return img;
}

// 6.2. Симуляция ошибки загрузки изображения
function simulateLoadError() {
  const container = document.getElementById('image-container');
  const output = document.getElementById('loading-output');
  if (!container || !output) return null;

  container.innerHTML = '';
  container.classList.remove('success', 'error');
  container.classList.add('loading');
  output.textContent = 'Статус загрузки: попытка загрузить несуществующее изображение...';

  const img = document.createElement('img');
  img.alt = 'Несуществующее изображение';

  img.addEventListener('error', () => {
    container.classList.remove('loading', 'success');
    container.classList.add('error');
    container.textContent = 'Ошибка загрузки изображения';
    output.textContent =
      'Статус загрузки: перехвачена ошибка (error) — ресурс недоступен или не существует.';
  });

  container.appendChild(img);
  img.src = `https://non-existent-domain-example.invalid/broken-image-${Date.now()}.jpg`;

  return img;
}

// 6.3. Настройка событий загрузки
function setupLoadingEvents() {
  const loadBtn = document.getElementById('load-image');
  const errorBtn = document.getElementById('load-error');

  if (loadBtn) {
    loadBtn.addEventListener('click', loadImageWithEvents);
  }

  if (errorBtn) {
    errorBtn.addEventListener('click', simulateLoadError);
  }
}

// ==========================================
// ЗАДАНИЕ 7: Таймеры и асинхронные события
// ==========================================

// 7.1. Запуск секундомера с защитой от множественного запуска
let timerInterval = null;
let timerValue = 0;

function startTimer() {
  if (timerInterval !== null) {
    return; // запрет множественного запуска
  }

  const output = document.getElementById('timer-output');
  timerInterval = setInterval(() => {
    timerValue += 1;
    if (output) {
      output.textContent = `Таймер: ${timerValue}`;
    }
  }, 1000);
}

// 7.2. Остановка и сброс секундомера
function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerValue = 0;
  const output = document.getElementById('timer-output');
  if (output) {
    output.textContent = `Таймер: ${timerValue}`;
  }
}

// 7.3. Реализация debounce
function createDebounce(func, delay) {
  let timeoutId = null;

  return function debounced(...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(context, args);
    }, delay);
  };
}

// 7.4. Реализация throttle
function createThrottle(func, interval) {
  let lastCallTime = 0;

  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      func.apply(this, args);
    }
  };
}

// 7.5. Тестирование debounce
let debounceRawClicks = 0;
let debounceExecutions = 0;

const debouncedLog = createDebounce(() => {
  debounceExecutions += 1;
  const output = document.getElementById('async-output');
  if (output) {
    output.textContent =
      `Debounce (задержка 500мс): обычных кликов = ${debounceRawClicks}, выполнений функции = ${debounceExecutions}`;
  }
}, 500);

function testDebounce() {
  debounceRawClicks += 1;
  const output = document.getElementById('async-output');
  if (output) {
    output.textContent =
      `Debounce (ожидание паузы 500мс...): обычных кликов = ${debounceRawClicks}, выполнений функции = ${debounceExecutions}`;
  }
  debouncedLog();
}

// 7.6. Тестирование throttle
let throttleRawClicks = 0;
let throttleExecutions = 0;

const throttledLog = createThrottle(() => {
  throttleExecutions += 1;
  const output = document.getElementById('async-output');
  if (output) {
    output.textContent =
      `Throttle (интервал 1000мс): обычных кликов = ${throttleRawClicks}, выполнений функции = ${throttleExecutions}`;
  }
}, 1000);

function testThrottle() {
  throttleRawClicks += 1;
  const output = document.getElementById('async-output');
  if (output) {
    output.textContent =
      `Throttle (интервал 1000мс): обычных кликов = ${throttleRawClicks}, выполнений функции = ${throttleExecutions}`;
  }
  throttledLog();
}

// 7.7. Настройка таймеров и асинхронных событий
function setupTimerEvents() {
  const startBtn = document.getElementById('start-timer');
  const stopBtn = document.getElementById('stop-timer');
  const debounceBtn = document.getElementById('debounce-btn');
  const throttleBtn = document.getElementById('throttle-btn');

  if (startBtn) {
    startBtn.addEventListener('click', startTimer);
  }
  if (stopBtn) {
    stopBtn.addEventListener('click', stopTimer);
  }
  if (debounceBtn) {
    debounceBtn.addEventListener('click', testDebounce);
  }
  if (throttleBtn) {
    throttleBtn.addEventListener('click', testThrottle);
  }
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ
// ==========================================
function initializeEventHandlers() {
  setupBasicEvents();
  setupKeyboardEvents();
  setupDelegationEvents();
  setupPreventionEvents();
  setupCustomEvents();
  setupLoadingEvents();
  setupTimerEvents();
  console.log('Все обработчики событий инициализированы!');
}

document.addEventListener('DOMContentLoaded', initializeEventHandlers);