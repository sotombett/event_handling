// ==========================================
// АВТОМАТИЧЕСКИЕ ТЕСТЫ (events-tests.js)
// ==========================================

(function () {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Утверждение ложно');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `${message || 'Значения не совпадают'}: ожидалось "${expected}", получено "${actual}"`
      );
    }
  }

  function createTestUI() {
    let section = document.getElementById('tests-section');
    if (section) section.remove();

    section = document.createElement('section');
    section.id = 'tests-section';
    section.className = 'task-area';
    section.innerHTML = '<h3>Результаты автоматического тестирования</h3><div id="test-summary" class="output">Запуск тестов...</div><div id="test-list"></div>';

    const footer = document.getElementById('main-footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }

    return {
      summary: document.getElementById('test-summary'),
      list: document.getElementById('test-list')
    };
  }

  function renderResult(container, name, passed, error) {
    const div = document.createElement('div');
    div.className = `test-result ${passed ? 'test-success' : 'test-failure'}`;
    div.textContent = passed
      ? `[PASS] ${name}`
      : `[FAIL] ${name} — ${error.message}`;
    container.appendChild(div);
  }

  async function runAllTests() {
    const ui = createTestUI();
    const tests = [];

    const test = (name, fn) => tests.push({ name, fn });

    // --- 0. Проверка наличия всех функций ---
    test('Все требуемые функции объявлены', () => {
      const requiredFunctions = [
        'handleBasicClick', 'handleMouseEvents', 'setupBasicEvents',
        'handleKeyEvents', 'setupKeyboardEvents',
        'handleDelegationClick', 'addNewItem', 'setupDelegationEvents',
        'preventLinkDefault', 'preventFormSubmit', 'setupPreventionEvents',
        'triggerCustomEvent', 'handleCustomEvent', 'setupMultipleListeners', 'setupCustomEvents',
        'loadImageWithEvents', 'simulateLoadError', 'setupLoadingEvents',
        'startTimer', 'stopTimer', 'createDebounce', 'createThrottle',
        'testDebounce', 'testThrottle', 'setupTimerEvents', 'initializeEventHandlers'
      ];
      requiredFunctions.forEach((fnName) => {
        assert(typeof window[fnName] === 'function', `Функция ${fnName} не определена`);
      });
    });

    // --- 1. Задача 1: Базовые события ---
    test('Задача 1: клик по #basic-btn обновляет вывод и включает/снимает класс pulse', async () => {
      const btn = document.getElementById('basic-btn');
      const output = document.getElementById('basic-output');

      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 42, clientY: 84 }));
      assert(output.textContent.includes('click'), 'В выводе должен быть тип события click');
      assert(output.textContent.includes('42') && output.textContent.includes('84'), 'В выводе должны быть координаты клика');
      assert(btn.classList.contains('pulse'), 'Кнопка должна получить класс pulse');

      await wait(550);
      assert(!btn.classList.contains('pulse'), 'Класс pulse должен удалиться через 500мс');
    });

    test('Задача 1: события мыши mouseenter / mousemove / mouseleave на #color-box', () => {
      const box = document.getElementById('color-box');
      const mouseOut = document.getElementById('mouse-output');

      box.dispatchEvent(new MouseEvent('mouseenter'));
      assert(
        box.style.background.includes('231, 76, 60') || box.style.background.includes('#e74c3c'),
        'При mouseenter фон должен стать #e74c3c'
      );

      box.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 240 }));
      assert(mouseOut.textContent.includes('120') && mouseOut.textContent.includes('240'), 'mousemove должен обновлять координаты');

      box.dispatchEvent(new MouseEvent('mouseleave'));
      assert(
        box.style.background.includes('52, 152, 219') || box.style.background.includes('#3498db'),
        'При mouseleave фон должен вернуться к #3498db'
      );
    });

    // --- 2. Задача 2: События клавиатуры ---
    test('Задача 2: обычная клавиша и сброс состояния при keyup', () => {
      const input = document.getElementById('key-input');
      const output = document.getElementById('key-output');

      const downEv = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', cancelable: true });
      input.dispatchEvent(downEv);
      assert(!downEv.defaultPrevented, 'Обычная клавиша не должна блокироваться');
      assert(output.textContent.includes('KeyK'), 'Вывод должен содержать code клавиши');

      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'k', code: 'KeyK' }));
      assert(output.textContent.includes('сброшено'), 'keyup должен сбрасывать состояние');
    });

    test('Задача 2 (краевой случай): комбинации Ctrl+S, Alt+C, Shift+A (включая кириллицу по code)', () => {
      const input = document.getElementById('key-input');
      const combos = [
        { key: 's', code: 'KeyS', ctrlKey: true },
        { key: 'с', code: 'KeyC', altKey: true },   // русская "с" с code KeyC
        { key: 'A', code: 'KeyA', shiftKey: true }
      ];

      combos.forEach((opts) => {
        const ev = new KeyboardEvent('keydown', { ...opts, cancelable: true });
        input.dispatchEvent(ev);
        assert(ev.defaultPrevented, `Комбинация ${opts.code} должна вызывать preventDefault()`);
      });
    });

    // --- 3. Задача 3: Делегирование событий ---
    test('Задача 3: выбор, снятие выбора, добавление динамического элемента и удаление', () => {
      const list = document.getElementById('item-list');
      const output = document.getElementById('delegation-output');
      const initialCount = list.querySelectorAll('.item').length;

      // Клик по первому элементу
      const firstItem = list.querySelector('.item');
      firstItem.click();
      assert(firstItem.classList.contains('selected'), 'Элемент должен получить класс selected');
      assert(output.textContent.includes(`#${firstItem.dataset.id}`), 'Вывод должен отображать id выбранного элемента');

      // Краевой случай: клик мимо элементов (по самому контейнеру #item-list)
      list.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      assert(!list.classList.contains('selected'), 'Контейнер #item-list не должен получать класс selected');

      // Добавление нового элемента и делегирование на него
      document.getElementById('add-item-btn').click();
      const itemsAfterAdd = list.querySelectorAll('.item');
      assertEqual(itemsAfterAdd.length, initialCount + 1, 'Должен добавиться новый элемент');

      const newItem = itemsAfterAdd[itemsAfterAdd.length - 1];
      const newId = newItem.dataset.id;
      assert(newId && Number(newId) > 3, 'Новый элемент должен иметь уникальный data-id > 3');

      newItem.click();
      assert(newItem.classList.contains('selected'), 'Делегирование должно работать для нового элемента');

      // Удаление нового элемента через span.delete
      newItem.querySelector('.delete').click();
      assertEqual(list.querySelectorAll('.item').length, initialCount, 'Удаление через .delete должно удалять .item');

      // Сброс выделения первого элемента
      firstItem.click();
    });

    // --- 4. Задача 4: Предотвращение поведения ---
    test('Задача 4: предотвращение перехода по ссылке и анимация shake', async () => {
      const link = document.getElementById('prevent-link');
      const output = document.getElementById('prevention-output');

      const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(ev);
      assert(ev.defaultPrevented, 'Переход по ссылке должен быть предотвращён');
      assert(link.classList.contains('shake'), 'К ссылке должен добавляться класс shake');
      assert(output.textContent.includes('предотвращён'), 'Сообщение о перехвате ссылки должно отобразиться');

      await wait(350);
      assert(!link.classList.contains('shake'), 'Класс shake должен сниматься после анимации');
    });

    test('Задача 4 (краевой случай): валидация пустой строки / пробелов и отправка валидной формы', () => {
      const form = document.getElementById('prevent-form');
      const input = form.querySelector('input[type="text"]');
      const output = document.getElementById('prevention-output');

      // Только пробелы
      input.value = '    ';
      const emptySubmit = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(emptySubmit);
      assert(emptySubmit.defaultPrevented, 'Отправка пустой формы должна быть предотвращена');
      assert(output.textContent.includes('Ошибка валидации'), 'Строка из пробелов должна не пройти валидацию');

      // Корректный текст
      input.value = 'Тестовое сообщение';
      const validSubmit = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(validSubmit);
      assert(validSubmit.defaultPrevented, 'Отправка валидной формы должна быть предотвращена');
      assert(output.textContent.includes('Тестовое сообщение'), 'Введённые данные должны появиться в выводе');

      input.value = '';
    });

    // --- 5. Задача 5: Кастомные события ---
    test('Задача 5: запуск customAction и защита от дублирования при повторном нажатии #multiple-listeners', () => {
      const output = document.getElementById('custom-output');
      const triggerBtn = document.getElementById('trigger-custom');
      const multiBtn = document.getElementById('multiple-listeners');

      triggerBtn.click();
      assert(output.textContent.includes('Привет от кастомного события!'), 'Базовый обработчик должен вывести detail.message');

      // Нажимаем дважды, чтобы проверить защиту от дублирования (краевой случай)
      multiBtn.click();
      multiBtn.click();
      triggerBtn.click();

      const matches1 = (output.textContent.match(/\[Обработчик 1\]/g) || []).length;
      const matches2 = (output.textContent.match(/\[Обработчик 2\]/g) || []).length;
      const matches3 = (output.textContent.match(/\[Обработчик 3\]/g) || []).length;

      assertEqual(matches1, 1, 'Обработчик 1 должен сработать ровно 1 раз');
      assertEqual(matches2, 1, 'Обработчик 2 должен сработать ровно 1 раз');
      assertEqual(matches3, 1, 'Обработчик 3 должен сработать ровно 1 раз');
    });

    // --- 6. Задача 6: События загрузки и ошибок ---
    test('Задача 6: loadImageWithEvents создаёт img с правильным URL и обрабатывает loadstart', () => {
      const container = document.getElementById('image-container');
      const output = document.getElementById('loading-output');

      const img = loadImageWithEvents();
      assert(img instanceof HTMLImageElement, 'Функция должна создавать элемент img');
      assert(container.contains(img), 'Изображение должно добавляться в #image-container');
      assert(img.src.startsWith('https://picsum.photos/300/200'), 'URL изображения должен быть picsum.photos/300/200');
      assert(output.textContent.length > 0, 'Статус загрузки должен обновляться');
    });

    test('Задача 6: simulateLoadError корректно обрабатывает ошибку загрузки', async () => {
      const container = document.getElementById('image-container');
      const output = document.getElementById('loading-output');

      const img = simulateLoadError();
      // Инициируем событие error детерминированно, чтобы тест не зависел от таймаута DNS
      img.dispatchEvent(new Event('error'));
      await wait(10);

      assert(container.classList.contains('error'), 'Контейнер должен получить класс error');
      assert(output.textContent.includes('ошибка'), 'Вывод должен содержать сообщение об ошибке');
    });

    // --- 7. Задача 7: Таймеры, Debounce и Throttle ---
    test('Задача 7: startTimer (защита от двойного запуска) и stopTimer (сброс и повторный стоп)', async () => {
      const output = document.getElementById('timer-output');

      stopTimer(); // краевой случай: остановка уже остановленного таймера
      assertEqual(output.textContent, 'Таймер: 0', 'Таймер должен быть равен 0');

      startTimer();
      startTimer(); // повторный запуск не должен создавать второй интервал
      startTimer();

      await wait(1150);
      assertEqual(output.textContent, 'Таймер: 1', 'За ~1 секунду таймер должен увеличиться строго на 1');

      stopTimer();
      assertEqual(output.textContent, 'Таймер: 0', 'После stopTimer значение должно сброситься в 0');
    });

    test('Задача 7: createDebounce схлопывает частые вызовы, сохраняет аргументы и контекст this', async () => {
      let calls = 0;
      let lastArg = null;
      let capturedThis = null;

      const obj = {
        prefix: 'ok',
        fn: createDebounce(function (val) {
          calls += 1;
          lastArg = val;
          capturedThis = this.prefix;
        }, 80)
      };

      obj.fn(1);
      obj.fn(2);
      obj.fn(3);
      assertEqual(calls, 0, 'До истечения задержки вызова быть не должно');

      await wait(120);
      assertEqual(calls, 1, 'Из 3 быстрых вызовов должен выполниться только 1');
      assertEqual(lastArg, 3, 'Должен передаться последний аргумент');
      assertEqual(capturedThis, 'ok', 'Контекст this должен сохраняться');
    });

    test('Задача 7: createThrottle ограничивает частоту вызовов и сохраняет аргументы', async () => {
      let calls = 0;
      const received = [];

      const throttled = createThrottle((val) => {
        calls += 1;
        received.push(val);
      }, 100);

      throttled('a'); // должен пройти сразу
      throttled('b'); // должен быть проигнорирован
      throttled('c'); // должен быть проигнорирован
      assertEqual(calls, 1, 'Первый вызов throttle должен выполниться немедленно');
      assertEqual(received[0], 'a', 'Должен сохраниться первый аргумент');

      await wait(130);
      throttled('d'); // интервал прошёл, должен выполниться
      assertEqual(calls, 2, 'После истечения интервала следующий вызов должен выполниться');
      assertEqual(received[1], 'd', 'Должен передаться новый аргумент');
    });

    // --- Запуск всех тестов ---
    let passedCount = 0;
    console.group('Автотесты Практической работы №12');

    for (const t of tests) {
      try {
        await t.fn();
        passedCount += 1;
        console.log(`%c[PASS] ${t.name}`, 'color: #34b37e; font-weight: bold;');
        renderResult(ui.list, t.name, true);
      } catch (err) {
        console.error(`[FAIL] ${t.name}`, err);
        renderResult(ui.list, t.name, false, err);
      }
    }

    const total = tests.length;
    const summaryText = `Пройдено тестов: ${passedCount} из ${total}`;
    ui.summary.textContent = summaryText;
    ui.summary.className = `output ${passedCount === total ? 'success' : 'error'}`;
    console.log(`Итог: ${summaryText}`);
    console.groupEnd();
  }

  // Запускаем тесты сразу после инициализации обработчиков в events-tasks.js
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runAllTests, 50);
  });
})();