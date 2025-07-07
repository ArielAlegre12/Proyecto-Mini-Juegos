// trivia.js
import { shuffleArray } from './utils.js';

let triviaQuestions = [];
let currentTriviaQuestionIndex = 0;
let triviaFeedbackParagraph;

export async function loadTriviaQuestions() {
  try {
    const response = await fetch('/data/preguntas_trivia_es.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    triviaQuestions = await response.json();
    shuffleArray(triviaQuestions);
    currentTriviaQuestionIndex = 0;
    displayTriviaQuestion();
  } catch (error) {
    console.error('Error al cargar trivia:', error);
    document.getElementById('trivia').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

function displayTriviaQuestion() {
  const contenedor = document.getElementById('trivia');
  contenedor.innerHTML = '';

  if (currentTriviaQuestionIndex < triviaQuestions.length) {
    const pregunta = triviaQuestions[currentTriviaQuestionIndex];

    const preguntaDiv = document.createElement('div');
    preguntaDiv.classList.add('pregunta');

    const h3 = document.createElement('h3');
    h3.textContent = pregunta.question;
    preguntaDiv.appendChild(h3);

    const opciones = shuffleArray([...pregunta.incorrect_answers, pregunta.correct_answer]);
    opciones.forEach(opcion => {
      const btn = document.createElement('button');
      btn.textContent = opcion;
      btn.classList.add('answer-button');
      btn.onclick = () => checkTriviaAnswer(btn, opcion, pregunta.correct_answer);
      preguntaDiv.appendChild(btn);
    });

    contenedor.appendChild(preguntaDiv);

    const botonesDiv = document.createElement('div');
    botonesDiv.style.display = 'flex';
    botonesDiv.style.justifyContent = 'center';
    botonesDiv.style.gap = '10px';
    botonesDiv.style.marginTop = '15px';

    if (pregunta.pista && pregunta.pista.trim() !== '') {
      const botonPista = document.createElement('button');
      botonPista.textContent = 'Mostrar pista';
      botonPista.classList.add('btn-pista');
      botonPista.onclick = () => {
        botonPista.disabled = true;
        const pista = document.createElement('p');
        pista.textContent = `💡 Pista: ${pregunta.pista}`;
        pista.classList.add('pista-text');
        contenedor.appendChild(pista);
      };
      botonesDiv.appendChild(botonPista);
    }

    const siguienteBtn = document.createElement('button');
    siguienteBtn.textContent = 'Siguiente';
    siguienteBtn.classList.add('btn-pista');
    siguienteBtn.onclick = moveToNextTriviaQuestion;
    botonesDiv.appendChild(siguienteBtn);

    contenedor.appendChild(botonesDiv);

    triviaFeedbackParagraph = document.createElement('p');
    contenedor.appendChild(triviaFeedbackParagraph);

  } else {
    contenedor.innerHTML = `
      <p>¡Has respondido todas las preguntas!</p>
      <button id="restartTriviaButton" class="btn-pista">Volver a jugar</button>
    `;
    document.getElementById('restartTriviaButton').onclick = () => {
      currentTriviaQuestionIndex = 0;
      shuffleArray(triviaQuestions);
      displayTriviaQuestion();
    };
  }
}

function checkTriviaAnswer(selectedButton, selectedAnswer, correctAnswer) {
  const botones = document.querySelectorAll('#trivia .answer-button');
  botones.forEach(b => b.disabled = true);

  const normalizar = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (normalizar(selectedAnswer) === normalizar(correctAnswer)) {
    triviaFeedbackParagraph.textContent = '✅ ¡Correcto!';
    triviaFeedbackParagraph.style.color = 'green';
    selectedButton.classList.add('correct');
  } else {
    triviaFeedbackParagraph.textContent = `❌ Incorrecto. La respuesta correcta era: "${correctAnswer}"`;
    triviaFeedbackParagraph.style.color = 'red';
    selectedButton.classList.add('incorrect');

    botones.forEach(btn => {
      if (normalizar(btn.textContent) === normalizar(correctAnswer)) {
        btn.classList.add('correct');
      }
    });
  }
}

function moveToNextTriviaQuestion() {
  currentTriviaQuestionIndex++;
  displayTriviaQuestion();
}
export function setupTrivia() {
  // Podés llamar directamente a loadTriviaQuestions o hacer otras inicializaciones
  loadTriviaQuestions();
}