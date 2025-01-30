import { animals, questions } from './data.js';

let currentLevel = 1;
let questionCount = 0;
let maxQuestions = 5;
let score = 0;
let totalTime = 0; // Суммарное время игры
let timerId;       // таймер раунда (обратный отсчёт)
let timerInterval; // таймер общего времени (всей игры)
let timeLimit;
let inputTimerId; // Таймер 3-го уровня (ввод с клавиатуры)
let currentQuestion = null; // Глобальная переменная для хранения текущего вопроса

window.onload = () => {
  initGame();
};

// ------------------------------------------------
// 1) Запуск игры
// ------------------------------------------------

function initGame() {
  startGlobalTimer();
  startGame();
}

function startGame() {
  document.getElementById('levelDisplay').textContent = `Уровень: ${currentLevel}`;

  switch (currentLevel) {
    case 1:
      timeLimit = 30;
      startRoundTimer();
      generateQuestion();
      break;
    case 2:
      startLevel2();
      break;
    case 3:
      timeLimit = 10;
      startRoundTimer();
      generateQuestion();
      break;
  }
}

// ------------------------------------------------
// 2) Таймеры
// ------------------------------------------------

let remainingTime; // Добавляем глобальную переменную для хранения оставшегося времени

// 1. Таймер раунда
function startRoundTimer() {
  clearInterval(timerId); // Очистка предыдущего таймера, если есть

  remainingTime = timeLimit;
  displayTimeLeft(remainingTime);
  console.log(`[ROUND TIMER] Старт таймера: ${remainingTime} сек.`);

  timerId = setInterval(() => {
    remainingTime--;
    console.log(`[ROUND TIMER] Осталось: ${remainingTime} сек.`);
    displayTimeLeft(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(timerId); // 💡 ВАЖНО: Остановка таймера перед переходом
      console.warn(`[ROUND TIMER] ⏳ Время вышло! Переход на ${currentLevel + 1}-й уровень...`);
      nextLevel();
    }
  }, 1000);
}


// 2. Глобальный таймер
function startGlobalTimer() {
  clearInterval(timerInterval); // Очистка предыдущего глобального таймера
  console.log(`[GLOBAL TIMER] Старт глобального таймера.`);
  
  timerInterval = setInterval(() => {
    totalTime++;
    const minutes = String(Math.floor(totalTime / 60)).padStart(2, '0');
    const seconds = String(totalTime % 60).padStart(2, '0');
    document.getElementById('totalTimeDisplay').textContent = `Общее время: ${minutes}:${seconds}`;

    console.log(`[GLOBAL TIMER] Общее время: ${minutes}:${seconds}`);
  }, 1000);
}

// 3. Логика обработки правильного ответа (чтобы убедиться, что не пересоздаём таймер)
function checkAnswer(chosenAnimal, question) {
  let correctScore, wrongScore;
  switch (currentLevel) {
    case 1:
      correctScore = 10;
      wrongScore  = 5;
      break;
    case 2:
      correctScore = 15;
      wrongScore  = 10;
      break;
    case 3:
      correctScore = 20;
      wrongScore  = 10;
      break;
  }

  if (chosenAnimal[question.property] === question.value) {
    score += correctScore;
    document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;

    playAnimalSound(chosenAnimal.name);
    animateCorrect(chosenAnimal.name);

    console.log(`[ANSWER] ✅ Правильный ответ: ${chosenAnimal.name}`);
    console.log(`[ANSWER] ❌ НЕ сбрасываем таймер, просто обновляем вопрос`);

    setTimeout(() => {
      generateQuestion(); // Просто даём новый вопрос
    }, 1000);
  } else {
    score -= wrongScore;
    document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;
    animateWrong(chosenAnimal.name);

    console.log(`[ANSWER] ❌ Неправильный ответ: ${chosenAnimal.name}`);
  }
}

function stopGlobalTimer() {
  clearInterval(timerInterval);
}

// ------------------------------------------------
// 3) Генерация вопросов и отрисовка животных
// ------------------------------------------------

function generateQuestion() {
  // Случайный вопрос
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];
  showQuestion(question);

  // Смешиваем массив животных
  const chosenAnimals = shuffleArray([...animals]);

  // Гарантируем, что в четырёх точно есть «правильный»
  const correctAnimal = animals.find(an => an[question.property] === question.value);
  if (correctAnimal && !chosenAnimals.includes(correctAnimal)) {
    chosenAnimals[Math.floor(Math.random() * chosenAnimals.length)] = correctAnimal;
  }

  showAnimals(chosenAnimals, question);
}

function showQuestion(q) {
  const questionElem = document.getElementById('question');
  questionElem.textContent = q.text;
}

function showAnimals(animalList, question) {
  const container = document.getElementById('animalContainer');
  container.innerHTML = ''; // Стираем предыдущих зверей

  animalList.forEach(animal => {
    const img = document.createElement('img');
    img.src = `assets/${getImageName(animal.name)}`;
    img.alt = animal.name;

    // Присваиваем класс анимации
    img.classList.add(getAnimationClass(animal.name));

    // При клике проверяем
    img.addEventListener('click', () => {
      checkAnswer(animal, question);
    });

    container.appendChild(img);
  });
}

// ------------------------------------------------
// 4) Проверка ответа и переходы между раундами
// ------------------------------------------------

function nextLevel() {
  stopAllTimers(); // Очищаем все старые таймеры
  
  if (currentLevel === 2) {
      console.log("🎯 Переход на 3-й уровень");
      currentLevel++;
      showLevelTransition(currentLevel);
      setTimeout(() => startLevel3(), 1500);
  } else if (currentLevel >= 3) {
      console.log("🎉 Конец игры!");
      endGame();
  } else {
      currentLevel++;
      showLevelTransition(currentLevel);
      setTimeout(() => startGame(), 1500);
  }
}

// ------------------------------------------------
// 5) Финиш и сохранение
// ------------------------------------------------

function endGame() {
  stopGlobalTimer();
  saveResult();

  if (score >= 300) {
    showEndMessage("🎉 Победа! 🎉", "#28a745"); // Зелёный фон
    startFireworks();
  } else {
    showEndMessage("⏳ Время вышло! Нужно 300 очков!", "#dc3545"); // Красный фон
  }

  setTimeout(() => {
    window.location.href = 'rating.html';
  }, 3000);
}


function showEndMessage(text, bgColor) {
  const endMessage = document.createElement("div");
  endMessage.textContent = text;
  endMessage.style.position = "fixed";
  endMessage.style.top = "50%";
  endMessage.style.left = "50%";
  endMessage.style.transform = "translate(-50%, -50%)";
  endMessage.style.padding = "20px";
  endMessage.style.fontSize = "2rem";
  endMessage.style.fontWeight = "bold";
  endMessage.style.color = "#fff";
  endMessage.style.background = bgColor;
  endMessage.style.borderRadius = "10px";
  endMessage.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  document.body.appendChild(endMessage);
}


function saveResult() {
  const playerName = localStorage.getItem('playerName') || 'Аноним';
  let rating = JSON.parse(localStorage.getItem('rating') || '[]');

  rating.push({ 
    name: playerName, 
    score, 
    totalTime 
  });
  rating.sort((a, b) => b.score - a.score);
  localStorage.setItem('rating', JSON.stringify(rating));
}

// ------------------------------------------------
// 6) Дополнительные функции: анимации, звуки, ...
// ------------------------------------------------

function playAnimalSound(animalName) {
  let soundFile = '';
  switch (animalName) {
    case 'Слон':    soundFile = 'elephant.mp3'; break;
    case 'Утка':    soundFile = 'duck.mp3';     break;
    case 'Кенгуру': soundFile = 'kangaroo.mp3'; break;
    case 'Верблюд': soundFile = 'camel.mp3';    break;
    case 'Дельфин': soundFile = 'dolphin.mp3';    break;
    case 'Орел': soundFile = 'eagle.mp3';    break;
    case 'Медведь': soundFile = 'bear.mp3';    break;
    case 'Черепаха': soundFile = 'tortila.mp3';    break; 
    case 'Крокодил': soundFile = 'crocodile.mp3';    break;
  }
  if (soundFile) {
    const audio = new Audio(`assets/sounds/${soundFile}`);
    audio.play();
  }
}

function displayTimeLeft(t) {
  document.getElementById('roundTimer').textContent = `Осталось: ${t} cек.`;
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function animateCorrect(animalName) {
  const imgs = document.querySelectorAll('#animalContainer img');
  imgs.forEach(img => {
    if (img.alt === animalName) {
      img.classList.add('correct');
      setTimeout(() => {
        img.remove();
      }, 1000);
    }
  });
}

function animateWrong(animalName) {
  const imgs = document.querySelectorAll('#animalContainer img');
  let found = false;

  imgs.forEach(img => {
    if (img.alt.trim().toLowerCase() === animalName.trim().toLowerCase()) {
      img.classList.add('wrong-shake');
      found = true;
      setTimeout(() => {
        img.classList.remove('wrong-shake');
      }, 500);
    }
  });

  if (!found) {
    console.warn(`Не найдено изображение для: ${animalName}`);
  }
}

function getImageName(animalName) {
  switch (animalName) {
    case 'Слон':    return 'elephant.png';
    case 'Утка':    return 'duck.png';
    case 'Кенгуру': return 'kenguru.png';
    case 'Верблюд': return 'camel.png';
    case 'Дельфин': return 'dolphin.png';
    case 'Орел': return 'eagle.png';
    case 'Медведь': return 'bear.png';
    case 'Черепаха': return 'tortila.png';
    case 'Крокодил': return 'crocodile.png';
  }
}

function getAnimationClass(animalName) {
  switch (animalName) {
    case 'Слон': return 'elephant-walk';
    case 'Утка': return 'duck-swim';
    case 'Кенгуру': return 'kangaroo-jump';
    case 'Верблюд': return 'camel-walk';
    case 'Дельфин': return 'dolphin-swim';
    case 'Орел': return 'eagle-fly';
    case 'Медведь': return 'bear-walk';
    case 'Черепаха': return 'turtle-crawl';
    case 'Крокодил': return 'crocodile-swim';
    default: return '';
  }
}

// ------------------------------------------------
// 7) Кнопка "Завершить уровень" – досрочный выход
// ------------------------------------------------

document.getElementById('exitBtn').addEventListener('click', () => {
  if (currentLevel < 3) {
    nextLevel();
  } else {
    endGame(true);
  }
});

function showLevelTransition(levelNumber) {
  const levelTransition = document.getElementById('levelTransition');
  levelTransition.textContent = `Уровень ${levelNumber}!`;
  levelTransition.style.opacity = '1';

  setTimeout(() => {
    levelTransition.style.opacity = '0';
  }, 2000);
}

function startFireworks() {
  const canvas = document.getElementById("fireworkCanvas");
  if (!canvas) return; // Если элемента нет, выходим

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  let particles = [];

  function createParticle(x, y) {
    const colors = ["#ff5733", "#ffbd33", "#33ff57", "#3357ff", "#f033ff"];
    return {
      x,
      y,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 5,
      speedY: (Math.random() - 0.5) * 5,
      life: 50,
    };
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    });

    if (particles.length > 0) {
      requestAnimationFrame(drawParticles);
    } else {
      setTimeout(() => {
        canvas.style.display = "none"; // Убираем фейерверк через 3 секунды
      }, 3000);
    }
  }

  for (let i = 0; i < 100; i++) {
    particles.push(createParticle(canvas.width / 2, canvas.height / 2));
  }

  drawParticles();
}

// второй уровень: перетаскивание животных в корзины

let dragTimerId; // Таймер второго уровня

function startLevel2() {
  console.log("🔹 Старт уровня 2 – Сортировка животных");

  // Скрываем вопрос
  document.getElementById('question').style.display = 'none';

  // Обновляем заголовок
  document.querySelector('.animated-title').textContent = 'Разместите животных по категориям!';

  // Находим контейнер для корзин (если есть, просто очищаем)
  let binsContainer = document.getElementById('binsContainer');
  if (!binsContainer) {
      binsContainer = document.createElement('div');
      binsContainer.id = 'binsContainer';
      binsContainer.classList.add('bins-container');
      document.querySelector('.game-container').appendChild(binsContainer);
  }

  binsContainer.style.display = 'flex'; // Делаем контейнер видимым
  binsContainer.innerHTML = ''; // Очищаем перед генерацией

  // Создаём три корзины с правильными типами
  const binsData = [
      { id: 'predators', label: 'Хищники', type: 'predators' },
      { id: 'herbivores', label: 'Травоядные', type: 'herbivores' },
      { id: 'omnivores', label: 'Всеядные', type: 'omnivores' }
  ];

  binsData.forEach(({ id, label, type }) => {
      const bin = document.createElement('div');
      bin.classList.add('bin');
      bin.id = id;
      bin.dataset.type = type; // Добавляем `dataset.type` для удобной проверки
      bin.textContent = label;
      bin.addEventListener('dragover', allowDrop);
      bin.addEventListener('drop', (event) => drop(event, type)); // Передаем `type`
      binsContainer.appendChild(bin);
  });

  // Проверяем, что массив животных перемешивается
  console.log("🔄 Перемешиваем животных...");
  shuffleArray(animals);

  spawnAnimalsForDrag(); // Показываем животных
  startDragTimer(); // Запускаем таймер
}

function spawnAnimalsForDrag() {
  const container = document.getElementById('animalContainer');
  container.innerHTML = ''; // Очищаем контейнер
  container.style.display = 'flex'; // Показываем животных

  animals.forEach(animal => {
      const img = document.createElement('img');
      img.src = `assets/${getImageName(animal.name)}`;
      img.alt = animal.name;
      img.id = animal.name;
      img.classList.add("draggable-animal");
      img.draggable = true;

      // Определяем категорию
      if (animal.isPredator) img.dataset.type = "predators";
      else if (animal.isHerbivore) img.dataset.type = "herbivores";
      else img.dataset.type = "omnivores"; // Всеядные - остаток

      img.addEventListener('dragstart', drag);
      container.appendChild(img);
  });
}

window.allowDrop = function(event) {
  event.preventDefault();
};

window.drag = function(event) {
  event.dataTransfer.setData("text", event.target.id);
};

window.drop = function(event, category) {
  event.preventDefault();
  const animalId = event.dataTransfer.getData("text");
  const draggedAnimal = document.getElementById(animalId);

  if (!draggedAnimal) return;

  const correctCategory = draggedAnimal.dataset.type;
  
  if (correctCategory === category) {
      event.target.appendChild(draggedAnimal);
      draggedAnimal.draggable = false; // Запрещаем перемещение после успешного размещения
      checkLevel2Completion();
  } else {
      animateWrong(draggedAnimal.alt);
  }
};

function checkLevel2Completion() {
  const remainingAnimals = document.querySelectorAll('#animalContainer img');

  if (remainingAnimals.length === 0) {
      clearInterval(dragTimerId); // Останавливаем таймер
      score += 100;
      document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;
      
      console.log("✅ Все животные правильно распределены! Переход на 3-й уровень...");

      setTimeout(() => nextLevel(), 1500);
  }
}

function startDragTimer() {
  clearInterval(dragTimerId); // Убираем старый таймер

  let timeLeft = 20;
  displayTimeLeft(timeLeft);

  dragTimerId = setInterval(() => {
      timeLeft--;
      displayTimeLeft(timeLeft);

      if (timeLeft <= 0) {
          clearInterval(dragTimerId);
          console.warn("⏳ Время вышло! Переход на 3-й уровень...");
          nextLevel();
      }
  }, 1000);
}

function startLevel3() {
  console.log("📝 Старт уровня 3 – Ввод с клавиатуры");

  stopAllTimers(); // Останавливаем все предыдущие таймеры

  // Скрываем контейнеры предыдущих уровней
  document.getElementById('binsContainer').style.display = 'none';
  document.getElementById('animalContainer').style.display = 'none';

  // ✅ Исправление: Обновляем заголовок
  document.querySelector('.animated-title').textContent = 'Найди животное по признаку!';

  // ✅ Исправление: Показываем контейнер 3-го уровня
  let level3Container = document.getElementById('level3Container');
  level3Container.classList.remove('input_hidden');

  // ✅ Исправление: Генерируем новый вопрос и животных
  generateTextQuestion();

  // Очищаем поле ввода
  let inputField = document.getElementById('animalInput');
  inputField.value = '';

  // Навешиваем обработчики на кнопку и ввод текста
  document.getElementById('submitAnswer').onclick = checkTextAnswer;
  inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          checkTextAnswer();
      }
  });

  console.log("[LEVEL 3 TIMER] Запуск таймера на ввод (30 сек)");
  startInputTimer();
}

function generateTextQuestion() {
  if (!animals || animals.length === 0) {
      console.error("❌ Ошибка: массив animals не загружен или пуст!");
      return;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex]; // Запоминаем текущий вопрос

  console.log(`[LEVEL 3] Новый вопрос: ${currentQuestion.text}`);

  let questionElem = document.getElementById('question');
  questionElem.textContent = currentQuestion.text;
  questionElem.style.display = 'block';

  let correctAnimals = animals.filter(an => an[currentQuestion.property] === currentQuestion.value);
  
  if (correctAnimals.length === 0) {
      console.error("❌ Ошибка! Нет животных с таким признаком.");
      return;
  }

  console.log(`[LEVEL 3] Подходящие животные:`, correctAnimals.map(a => a.name));

  let correctAnimal = correctAnimals[Math.floor(Math.random() * correctAnimals.length)];

  let otherAnimals = animals.filter(an => an.name !== correctAnimal.name);
  shuffleArray(otherAnimals);
  let displayedAnimals = [correctAnimal, otherAnimals[0], otherAnimals[1]];
  shuffleArray(displayedAnimals);

  console.log(`[LEVEL 3] Показываем животных:`, displayedAnimals.map(a => a.name));

  showLevel3Animals(displayedAnimals);
}

function checkTextAnswer() {
  let inputText = document.getElementById('animalInput').value.trim().toLowerCase();
  if (!inputText) return;

  let correctAnimals = animals.filter(an => an[currentQuestion.property] === currentQuestion.value);
  let isCorrect = correctAnimals.some(an => an.name.toLowerCase() === inputText);

  if (isCorrect) {
      score += 20;
      document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;
      
      // Удаляем правильное животное
      const correctAnimalImg = document.querySelector(`img[alt="${inputText}"]`);
      if (correctAnimalImg) {
          correctAnimalImg.remove();
      }

      // Воспроизводим звук
      playAnimalSound(inputText);

      document.getElementById('animalInput').value = "";
      questionCount++;

      if (questionCount >= maxQuestions) {
          console.log("✅ Уровень 3 пройден!");
          clearInterval(inputTimerId);
          nextLevel(); // Заканчиваем 3-й уровень
      } else {
          generateTextQuestion(); // Следующий вопрос
      }
  } else {
      document.getElementById('animalInput').classList.add('shake');
      setTimeout(() => document.getElementById('animalInput').classList.remove('shake'), 500);
  }
}

function startInputTimer() {
  clearInterval(inputTimerId); // Сбрасываем предыдущий таймер

  let timeLeft = 30;
  displayTimeLeft(timeLeft);

  inputTimerId = setInterval(() => {
      timeLeft--;
      displayTimeLeft(timeLeft);
      if (timeLeft <= 0) {
          clearInterval(inputTimerId);
          console.warn("⏳ Время на ввод закончилось. Завершаем игру...");
          endGame();
      }
  }, 1000);
}

function stopAllTimers() {
  clearInterval(timerId);      // Остановка таймера раунда
  clearInterval(timerInterval); // Остановка глобального таймера
  clearInterval(dragTimerId);  // Остановка таймера 2 уровня
  clearInterval(inputTimerId); // Остановка таймера 3 уровня
  console.log("⏹️ Все таймеры остановлены.");
}


function showLevel3Animals(animalList) {
  const container = document.getElementById('level3AnimalContainer');
  
  // Если контейнера нет, создаем его
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'level3AnimalContainer';
    newContainer.classList.add('level3-animal-container');
    document.querySelector('.game-container').appendChild(newContainer);
  } else {
    container.innerHTML = ''; // Очищаем контейнер перед новой генерацией
  }

  animalList.forEach(animal => {
    const img = document.createElement('img');
    img.src = `assets/${getImageName(animal.name)}`;
    img.alt = animal.name;
    img.classList.add('animal-img');

    document.getElementById('level3AnimalContainer').appendChild(img);
  });
}
