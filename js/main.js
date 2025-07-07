// main.js

// ----------------------------------------------------
// Función para mezclar un array (algoritmo de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// ----------------------------------------------------


// --- Lógica del Acordeón ---
document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.closest('.accordion-item');
            const content = currentItem.querySelector('.accordion-content');

            // Cierra todos los acordeones abiertos excepto el actual
            document.querySelectorAll('.accordion-content.active').forEach(item => {
                if (item !== content) {
                    item.classList.remove('active');
                }
            });

            // Alterna la clase 'active' para el acordeón actual
            content.classList.toggle('active');

            // Comportamientos específicos por juego
            if (currentItem.id === 'juegoTrivia' && content.classList.contains('active')) {
                loadTriviaQuestions();
            }
            if (currentItem.id === 'juegoSuma' && content.classList.contains('active')) {
                generarNuevaSuma();
            }
            if (currentItem.id === 'juegoAdivinanza' && content.classList.contains('active')) {
                initializeGame();
            }
            if (currentItem.id === 'juegoAcertijos' && content.classList.contains('active')) {
                cargarAcertijos();
            }
        });
    });
});


// === JUEGO DE TRIVIA ===
let triviaQuestions = [];
let currentTriviaQuestionIndex = 0;
let triviaFeedbackParagraph;

async function loadTriviaQuestions() {
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
    const triviaDiv = document.getElementById('trivia');
    triviaDiv.innerHTML = '';

    if (currentTriviaQuestionIndex < triviaQuestions.length) {
        const q = triviaQuestions[currentTriviaQuestionIndex];
        const questionElement = document.createElement('h3');
        questionElement.textContent = q.question;
        triviaDiv.appendChild(questionElement);

        const opciones = [...q.incorrect_answers, q.correct_answer];
        shuffleArray(opciones);

        opciones.forEach(answer => {
            const btn = document.createElement('button');
            btn.textContent = answer;
            btn.classList.add('trivia-answer-button');
            btn.onclick = () => checkTriviaAnswer(btn, answer, q.correct_answer);
            triviaDiv.appendChild(btn);
        });

        triviaFeedbackParagraph = document.createElement('p');
        triviaDiv.appendChild(triviaFeedbackParagraph);

        const nextBtn = document.createElement('button');
        nextBtn.id = 'nextQuestionButton';
        nextBtn.textContent = 'Siguiente pregunta';
        nextBtn.style.display = 'none';
        nextBtn.onclick = moveToNextTriviaQuestion;
        triviaDiv.appendChild(nextBtn);
    } else {
        triviaDiv.innerHTML = '<p>¡Has respondido todas las preguntas!</p><button id="restartTriviaButton">Volver a jugar</button>';
        document.getElementById('restartTriviaButton').onclick = () => {
            currentTriviaQuestionIndex = 0;
            shuffleArray(triviaQuestions);
            displayTriviaQuestion();
        };
    }
}

function checkTriviaAnswer(selectedButton, selectedAnswer, correctAnswer) {
    const buttons = document.querySelectorAll('#trivia .trivia-answer-button');
    buttons.forEach(btn => btn.disabled = true);

    if (selectedAnswer === correctAnswer) {
        triviaFeedbackParagraph.textContent = '¡Correcto!';
        triviaFeedbackParagraph.style.color = 'green';
        selectedButton.style.backgroundColor = 'green';
    } else {
        triviaFeedbackParagraph.textContent = `Incorrecto. La respuesta correcta era: "${correctAnswer}"`;
        triviaFeedbackParagraph.style.color = 'red';
        selectedButton.style.backgroundColor = 'red';

        // Resalta el botón correcto
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.style.backgroundColor = 'green';
            }
        });
    }

    document.getElementById('nextQuestionButton').style.display = 'block';
}

function moveToNextTriviaQuestion() {
    currentTriviaQuestionIndex++;
    displayTriviaQuestion();
}

let acertijos = [];
let indiceAcertijo = 0;

// Mezcla un array aleatoriamente (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Carga los acertijos desde JSON y mezcla el orden
async function cargarAcertijos() {
    try {
        const res = await fetch('/data/acertijos.json');
        acertijos = await res.json();
        shuffleArray(acertijos); // Mezcla el orden de los acertijos
        indiceAcertijo = 0;
        mostrarAcertijo();
    } catch (err) {
        console.error("Error al cargar acertijos:", err);
        document.getElementById('acertijos').innerHTML = `<p>Error al cargar los acertijos: ${err.message}</p>`;
    }
}

// Muestra el acertijo actual
function mostrarAcertijo() {
    const contenedor = document.getElementById('acertijos');
    contenedor.innerHTML = '';

    if (indiceAcertijo >= acertijos.length) {
        contenedor.innerHTML = '<p>🎉 ¡Terminaste todos los acertijos!</p>';
        return;
    }

    const acertijo = acertijos[indiceAcertijo];
    const opciones = shuffleArray([...acertijo.respuestaIncorrectas, acertijo.respuesta]);

    const preguntaDiv = document.createElement('div');
    preguntaDiv.classList.add('pregunta');

    // Texto del acertijo
    const h3 = document.createElement('h3');
    h3.textContent = acertijo.acertijo;
    preguntaDiv.appendChild(h3);

    // Botón de mostrar pista (solo si existe)
    if (acertijo.pista && acertijo.pista.trim() !== '') {
        const botonPista = document.createElement('button');
        botonPista.textContent = 'Mostrar pista';
        botonPista.classList.add('btn-pista');
        botonPista.style.marginBottom = '10px';

        botonPista.onclick = () => {
            botonPista.disabled = true;
            const pista = document.createElement('p');
            pista.textContent = `💡 Pista: ${acertijo.pista}`;
            pista.style.fontStyle = 'italic';
            pista.style.color = '#555';
            pista.style.marginTop = '8px';
            preguntaDiv.appendChild(pista);
        };

        preguntaDiv.appendChild(botonPista);
    }

    // Botones de respuesta
    opciones.forEach(op => {
        const btn = document.createElement('button');
        btn.textContent = op;
        btn.onclick = () => verificarAcertijo(btn, acertijo.respuesta);
        preguntaDiv.appendChild(btn);
    });

    contenedor.appendChild(preguntaDiv);

    const siguienteBtn = document.createElement('button');
    siguienteBtn.textContent = 'Siguiente';
    siguienteBtn.classList.add('btn-pista');
    siguienteBtn.onclick = siguienteAcertijo;
    contenedor.appendChild(siguienteBtn);
}

// Verifica la respuesta elegida
function verificarAcertijo(boton, correcta) {
    const botones = document.querySelectorAll('#acertijos .pregunta button');
    botones.forEach(b => b.disabled = true);

    const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const user = normalizar(boton.innerText);
    const ok = normalizar(correcta);

    const mensaje = document.createElement('p');
    mensaje.style.marginTop = '15px';
    mensaje.style.fontWeight = 'bold';

    if (user === ok) {
        boton.style.background = 'green';
        mensaje.textContent = '✅ Correcto';
        mensaje.style.color = 'green';
    } else {
        boton.style.background = 'red';
        mensaje.textContent = `❌ Incorrecto. La respuesta correcta era: ${correcta}`;
        mensaje.style.color = 'red';
    }

    document.querySelector('#acertijos .pregunta').appendChild(mensaje);
}

// Avanza al siguiente acertijo
function siguienteAcertijo() {
    indiceAcertijo++;
    mostrarAcertijo();
}
//botón para alternar el modo oscuro
const toggleBtn = document.getElementById('toggleDarkMode');
toggleBtn.onclick = function() {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    toggleBtn.textContent = '🌙';
  } else {
    toggleBtn.textContent = '☀️';
  }
};
// Al cargar la página, ajusta el texto según el modo inicial
if (document.body.classList.contains('dark-mode')) {
  toggleBtn.textContent = '🌙';
} else {
  toggleBtn.textContent = '☀️';
}
