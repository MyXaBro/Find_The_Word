import { animals, questions } from './data.js';

let currentLevel = 1;
let currentRound = 1;
let score = 0;
let totalTime = 0; // Суммарное время игры
let timerId;       // таймер раунда (обратный отсчёт)
let timerInterval; // таймер общего времени (всей игры)
let timeLimit;

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
  // Определяем время на уровне
  switch (currentLevel) {
    case 1: timeLimit = 30; break;
    case 2: timeLimit = 20; break;
    case 3: timeLimit = 10; break;
  }
  startRoundTimer();
  generateQuestion();
}

// ------------------------------------------------
// 2) Таймеры
// ------------------------------------------------

function startRoundTimer() {
  let currentTime = timeLimit;
  displayTimeLeft(currentTime);

  timerId = setInterval(() => {
    currentTime--;
    displayTimeLeft(currentTime);

    if (currentTime <= 0) {
      clearInterval(timerId);
      endRound(false); // время вышло – провал
    }
  }, 1000);
}

function startGlobalTimer() {
  const timerDisplay = document.getElementById('totalTimeDisplay');
  timerInterval = setInterval(() => {
    totalTime++;
    const minutes = String(Math.floor(totalTime / 60)).padStart(2, '0');
    const seconds = String(totalTime % 60).padStart(2, '0');
    timerDisplay.textContent = `Общее время: ${minutes}:${seconds}`;
  }, 1000);
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

  // Если нужно случайное кол-во - slice(0,4) / slice(0,5).
  const chosenAnimals = shuffleArray([...animals]);

  // Гарантируем, что в 4-х точно есть «правильный»
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

    // Можно класс анимации (ходьба, плавание и т.д.)
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

function checkAnswer(chosenAnimal, question) {
  // Проверяем, совпадает ли свойство
  if (chosenAnimal[question.property] === question.value) {
    // Правильный ответ
    score += 10;
    document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;

    playAnimalSound(chosenAnimal.name);

    // 4.1) Анимация исчезновения
    animateCorrect(chosenAnimal.name);

    // 4.2) Ждём 1 секунду и завершаем раунд (чтобы успела отыграть анимация)
    setTimeout(() => {
      endRound(true);
    }, 1000);

  } else {
    // Неправильный ответ
    score -= 5;
    document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;

    animateWrong(chosenAnimal.name);
  }
}

function endRound(success) {
  clearInterval(timerId);

  if (success) {
    currentRound++;
    // Допустим, 3 раунда на уровень
    if (currentRound > 3) {
      nextLevel();
    } else {
      // Переходим к следующему раунду этого же уровня
      startGame();
    }
  } else {
    // Проигрыш (по времени)
    endGame();
  }
}

function nextLevel() {
  currentLevel++;
  currentRound = 1;

  if (currentLevel > 3) {
    // Все уровни пройдены
    endGame(true);
  } else {
    startGame();
  }
}

// ------------------------------------------------
// 5) Финиш и сохранение
// ------------------------------------------------

function endGame(isVictory = false) {
  stopGlobalTimer();
  saveResult();

  if (isVictory) {
    doVictoryAnimation();
    setTimeout(() => {
      window.location.href = 'rating.html';
    }, 3000);
  } else {
    window.location.href = 'rating.html';
  }
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
  // Подключите свои .mp3
  let soundFile = '';
  switch (animalName) {
    case 'Слон':    soundFile = 'elephant.mp3'; break;
    case 'Утка':    soundFile = 'duck.mp3';     break;
    case 'Кенгуру': soundFile = 'kangaroo.mp3'; break;
    case 'Верблюд': soundFile = 'camel.mp3';    break;
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

// Если угаданное животное верное – анимация + remove()
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

// Если неверное, трясём
function animateWrong(animalName) {
  const imgs = document.querySelectorAll('#animalContainer img');
  imgs.forEach(img => {
    if (img.alt === animalName) {
      img.classList.add('wrong-shake');
      setTimeout(() => {
        img.classList.remove('wrong-shake');
      }, 500);
    }
  });
}

// Простая анимация победы
function doVictoryAnimation() {
  const container = document.getElementById('animalContainer');
  container.innerHTML = `<h2 class="victory-text">Поздравляем, вы прошли все уровни!</h2>`;
  container.classList.add('victory-animation');
}

function getImageName(animalName) {
  switch (animalName) {
    case 'Слон':    return 'elephant.png';
    case 'Утка':    return 'duck.png';
    case 'Кенгуру': return 'kenguru.png';
    case 'Верблюд': return 'camel.png';
  }
}

function getAnimationClass(animalName) {
  switch (animalName) {
    case 'Слон':    return 'elephant-walk';
    case 'Утка':    return 'duck-swim';
    case 'Кенгуру': return 'kangaroo-jump';
    case 'Верблюд': return 'camel-walk'; 
  }
}

// ------------------------------------------------
// 7) Кнопка "Завершить уровень" – досрочный выход
// ------------------------------------------------

document.getElementById('exitBtn').addEventListener('click', () => {
  endRound(false);
});