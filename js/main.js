// Juego 1: Número del Día
// Juego 1: Número del Día
let secretNumber = Math.floor(Math.random() * 10) + 1;

const guessInput = document.getElementById("userGuess");
const result = document.getElementById("result");
const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");
const winVideo = document.getElementById("winVideo");

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

    winVideo.style.display = "block";
    winVideo.play();

  } else {
    result.textContent = `❌ Nada aún. Probá con otro número.`;
    result.style.color = "black";

    winVideo.pause();
    winVideo.currentTime = 0;
    winVideo.style.display = "none";
  }

  playButton.style.display = "none";
  resetButton.style.display = "inline-block";
});

resetButton.addEventListener("click", () => {
  guessInput.value = "";
  result.textContent = "";
  result.style.color = "black";

  playButton.style.display = "inline-block";
  resetButton.style.display = "none";

  winVideo.pause();
  winVideo.currentTime = 0;
  winVideo.style.display = "none";

  secretNumber = Math.floor(Math.random() * 10) + 1;

  abrirPanel("juegoAdivinanza");
});


// Juego 2: Sumas
const sumaPregunta = document.getElementById("sumaPregunta");
const respuestaSuma = document.getElementById("respuestaSuma");
const botonSumar = document.getElementById("botonSumar");
const botonResetSuma = document.getElementById("botonResetSuma");
const resultadoSuma = document.getElementById("resultadoSuma");

let num1, num2;

function generarSuma() {
  num1 = Math.floor(Math.random() * 100) + 1; // números del 1 al 100
  num2 = Math.floor(Math.random() * 10) + 1;
  sumaPregunta.textContent = `${num1} + ${num2} = ?`;
  resultadoSuma.textContent = "";
  respuestaSuma.value = "";
  botonResetSuma.style.display = "none";
  botonSumar.style.display = "inline-block";
  respuestaSuma.disabled = false;
}

botonSumar.addEventListener("click", () => {
  const respuesta = parseInt(respuestaSuma.value);

  if (isNaN(respuesta)) {
    resultadoSuma.textContent = "⚠️ Ingresá un número válido.";
    resultadoSuma.style.color = "red";
    return;
  }

  if (respuesta === num1 + num2) {
    resultadoSuma.textContent = "🎉 ¡Correcto!";
    resultadoSuma.style.color = "green";
  } else {
    resultadoSuma.textContent = `❌ Incorrecto. La respuesta correcta era ${num1 + num2}.`;
    resultadoSuma.style.color = "black";
  }

  botonSumar.style.display = "none";
  botonResetSuma.style.display = "inline-block";
  respuestaSuma.disabled = true;
});

botonResetSuma.addEventListener("click", () => {
  generarSuma();
  abrirPanel("juegoSuma");
});

generarSuma();

// Código acordeón para abrir/cerrar paneles
const headers = document.querySelectorAll(".accordion-header");

headers.forEach(header => {
  header.addEventListener("click", () => {
    const openItem = document.querySelector(".accordion-content.active");
    const content = header.nextElementSibling;

    if (openItem && openItem !== content) {
      openItem.classList.remove("active");
    }

    content.classList.toggle("active");
  });
});

// Función reutilizable para abrir un panel específico
function abrirPanel(idPanel) {
  const panel = document.getElementById(idPanel);
  if (panel && !panel.classList.contains("active")) {
    panel.classList.add("active");
  }
}
