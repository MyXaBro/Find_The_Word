// Точка входа, роутинг по страницам и т.д.

function startGame() {
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
      localStorage.setItem('playerName', playerName);
      window.location.href = "game.html";
    } else {
      alert('Введите имя!');
    }
  }

// Функция для перехода на страницу рейтинга
function goToRating() {
    window.location.href = "rating.html";
}
