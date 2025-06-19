let secretNumber = Math.floor(Math.random() * 10) + 1;

const guessInput = document.getElementById("userGuess");
const result = document.getElementById("result");
const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");
const videoContainer = document.getElementById("winVideoContainer");

resetButton.style.display = "none";
videoContainer.style.display = "none";

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

    // Mostrar video embebido de YouTube
    videoContainer.style.display = "block";
  } else {
    result.textContent = `❌ Nada aún. El número secreto era: ${secretNumber}. Probá con otro número.`;
    result.style.color = "black";

    // Ocultar video
    videoContainer.style.display = "none";
  }

  playButton.style.display = "none";
  resetButton.style.display = "inline-block";
});

resetButton.addEventListener("click", () => {
  location.reload();
});
