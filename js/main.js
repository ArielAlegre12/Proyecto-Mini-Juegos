let secretNumber = Math.floor(Math.random() * 10) + 1;

const guessInput = document.getElementById("userGuess");
const result = document.getElementById("result");
const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");
const winVideo = document.getElementById("winVideo"); // Este es el <video> directamente

resetButton.style.display = "none";
winVideo.style.display = "none";

playButton.addEventListener("click", () => {
  const guess = parseInt(guessInput.value);

  if (!guess || guess < 1 || guess > 10) {
    result.textContent = "⚠️ Ingresá un número válido entre 1 y 10.";
    result.style.color = "red";
    return;
  }

  if (guess === secretNumber) {
    result.textContent = `🎉 ¡Felicitaciones! Adivinaste el número: ${secretNumber}.`;
    result.style.color = "green";

    winVideo.style.display = "block"; // Primero se muestra
    winVideo.play(); // Luego se reproduce
  } else {
    result.textContent = `❌ Nada aún. El número secreto era: ${secretNumber}. Probá con otro número.`;
    result.style.color = "black";

    winVideo.pause();
    winVideo.currentTime = 0;
    winVideo.style.display = "none";
  }

  playButton.style.display = "none";
  resetButton.style.display = "inline-block";
});

resetButton.addEventListener("click", () => {
  location.reload();
});
