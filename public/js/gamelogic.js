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
  // Покажем уровень
  document.getElementById('levelDisplay').textContent = `Уровень: ${currentLevel}`;

  // Определяем время на уровне (таймер)
  switch (currentLevel) {
    case 1: timeLimit = 30; break;  // +10 / -5
    case 2: timeLimit = 20; break;  // +15 / -10
    case 3: timeLimit = 10; break;  // +20 / -10
  }

  startRoundTimer();
  generateQuestion();
}

// ------------------------------------------------
// 2) Таймеры
// ------------------------------------------------

let remainingTime; // Добавляем глобальную переменную для хранения оставшегося времени

function startRoundTimer(resumeTime = null) {
  remainingTime = resumeTime !== null ? resumeTime : timeLimit; 
  displayTimeLeft(remainingTime);

  clearInterval(timerId);

  timerId = setInterval(() => {
    remainingTime--;
    displayTimeLeft(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(timerId);
      if (currentLevel < 3) {
        nextLevel();
      } else {
        endGame(false);
      }
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

    clearInterval(timerId); // Останавливаем таймер, но сохраняем оставшееся время

    setTimeout(() => {
      startRoundTimer(remainingTime); // Передаём оставшееся время, а не сбрасываем таймер
      generateQuestion();
    }, 1000);

  } else {
    score -= wrongScore;
    document.getElementById('scoreDisplay').textContent = `Очки: ${score}`;
    animateWrong(chosenAnimal.name);
  }
}

function endRound(success) {
  clearInterval(timerId);

  if (success) {
    currentRound++;
    // 3 раунда на уровень
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
  if (currentLevel >= 3) {
    endGame();
  } else {
    currentLevel++;
    showLevelTransition(currentLevel);

    setTimeout(() => {
      startGame();
    }, 2000);
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

