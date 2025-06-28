// -----------------------------
// Juego 1: Número del Día
// -----------------------------
let secretNumber = Math.floor(Math.random() * 10) + 1;

const guessInput = document.getElementById("userGuess");
const result = document.getElementById("result");
const playButton = document.getElementById("playButton");
const resetButton = document.getElementById("resetButton");
const winVideo = document.getElementById("winVideo");

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

// -----------------------------
// Juego 2: Sumas
// -----------------------------
const sumaPregunta = document.getElementById("sumaPregunta");
const respuestaSuma = document.getElementById("respuestaSuma");
const botonSumar = document.getElementById("botonSumar");
const botonResetSuma = document.getElementById("botonResetSuma");
const resultadoSuma = document.getElementById("resultadoSuma");

let num1, num2;

function generarSuma() {
  num1 = Math.floor(Math.random() * 100) + 1;
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

// -----------------------------
// Juego 3: Trivia
// -----------------------------
let preguntasLocales = [];
let indicePregunta = 0;

async function cargarPreguntasLocales() {
  const res = await fetch('/data/preguntas.json');
  preguntasLocales = await res.json();
  mostrarPregunta();
}

function mostrarPregunta() {
  if (indicePregunta >= preguntasLocales.length) {
    document.getElementById('trivia').innerHTML = "<p>🎉 ¡Terminaste todas las preguntas!</p>";
    return;
  }

  const pregunta = preguntasLocales[indicePregunta];
  const contenedor = document.getElementById('trivia');
  // Asegúrate de decodificar si tus preguntas vienen con entidades HTML o URL codificadas
  // Si no, puedes quitar decodeURIComponent
  const opciones = [...pregunta.incorrect_answers, pregunta.correct_answer].map(op => decodeURIComponent(op));
  opciones.sort(() => Math.random() - 0.5);

  contenedor.innerHTML = `
    <div class="pregunta">
      <h3>${decodeURIComponent(pregunta.question)}</h3>
      ${opciones.map(op => `
        <button onclick="verificarRespuesta(this, '${encodeURIComponent(pregunta.correct_answer)}')">${op}</button>
      `).join('')}
    </div>
    <button onclick="siguientePregunta()">Siguiente pregunta</button>
  `;
}

function verificarRespuesta(boton, correctaCodificada) { // Cambié el nombre del parámetro
  const botones = document.querySelectorAll('#trivia .pregunta button');
  botones.forEach(b => b.disabled = true);

  const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const respuestaCorrecta = decodeURIComponent(correctaCodificada); // Decodificar la respuesta correcta al principio
  const respuestaUsuario = normalizar(boton.innerText); // Normalizar la respuesta del botón
  const respuestaCorrectaNormalizada = normalizar(respuestaCorrecta); // Normalizar la respuesta correcta

  const resultado = document.createElement('p');
  resultado.style.marginTop = '15px';
  resultado.style.fontWeight = 'bold';

  if (respuestaUsuario === respuestaCorrectaNormalizada) { // Comparar las versiones normalizadas
    boton.style.background = 'green';
    resultado.textContent = '✅ Correcto';
    resultado.style.color = 'green';
  } else {
    boton.style.background = 'red';
    resultado.textContent = `❌ Incorrecto. La respuesta correcta era: ${respuestaCorrecta}`; // Mostrar la correcta sin normalizar para el usuario
    resultado.style.color = 'red';
  }

  const contenedor = document.querySelector('#trivia .pregunta');
  contenedor.appendChild(resultado);
}

function siguientePregunta() {
  indicePregunta++;
  mostrarPregunta();
}

document.addEventListener('DOMContentLoaded', () => {
  cargarPreguntasLocales();
});

// -----------------------------
// Acordeón
// -----------------------------
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

function abrirPanel(idPanel) {
  const panel = document.getElementById(idPanel);
  if (panel) {
    const content = panel.querySelector(".accordion-content");
    if (content && !content.classList.contains("active")) {
      content.classList.add("active");
    }
  }
}
