// main.js

// ----------------------------------------------------
// Función para mezclar un array (algoritmo de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
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

            // Si el acordeón de trivia se abre, carga las preguntas
            if (currentItem.id === 'juegoTrivia' && content.classList.contains('active')) {
                loadTriviaQuestions();
            }
            // Si el acordeón de sumas se abre, genera una nueva suma
            if (currentItem.id === 'juegoSuma' && content.classList.contains('active')) {
                generarNuevaSuma();
            }
            // Si el acordeón de adivinanza se abre, inicializa el juego
            if (currentItem.id === 'juegoAdivinanza' && content.classList.contains('active')) {
                initializeGame();
            }
        });
    });
});





// --- Lógica del Juego de Trivia ---
let triviaQuestions = []; // Almacenará las preguntas cargadas
let currentTriviaQuestionIndex = 0; // Índice de la pregunta actual
let triviaFeedbackParagraph; // Para mostrar feedback al usuario

async function loadTriviaQuestions() {
    try {
        const response = await fetch('/data/preguntas_trivia_es.json'); // Asegúrate de que la ruta sea correcta
        if (!response.ok) { // Añadido para mejor manejo de errores HTTP
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        triviaQuestions = data;

        shuffleArray(triviaQuestions); // Mezcla las preguntas al cargarlas

        console.log('Preguntas de trivia cargadas y mezcladas:', triviaQuestions);

        if (triviaQuestions.length > 0) {
            currentTriviaQuestionIndex = 0; // Asegúrate de reiniciar el índice para una nueva sesión de trivia
            displayTriviaQuestion();
        }

    } catch (error) {
        console.error('Error al cargar las preguntas de trivia:', error);
        document.getElementById('trivia').innerHTML = `<p>Error al cargar las preguntas: ${error.message}. Por favor, intenta de nuevo más tarde.</p>`;
    }
}

function displayTriviaQuestion() {
    const triviaDiv = document.getElementById('trivia');
    triviaDiv.innerHTML = ''; // Limpia el contenido anterior

    if (currentTriviaQuestionIndex < triviaQuestions.length) {
        const questionData = triviaQuestions[currentTriviaQuestionIndex];
        
        const questionElement = document.createElement('h3');
        questionElement.textContent = questionData.question;
        triviaDiv.appendChild(questionElement);

        const allAnswers = [...questionData.incorrect_answers, questionData.correct_answer];
        shuffleArray(allAnswers); // Mezcla también las opciones de respuesta

        allAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('trivia-answer-button'); // Añade una clase para identificar los botones de respuesta
            // Pasa el botón como primer argumento a checkTriviaAnswer
            button.onclick = () => checkTriviaAnswer(button, answer, questionData.correct_answer);
            triviaDiv.appendChild(button);
        });

        // Párrafo para feedback (Correcto/Incorrecto)
        triviaFeedbackParagraph = document.createElement('p');
        triviaFeedbackParagraph.id = 'triviaFeedback';
        triviaDiv.appendChild(triviaFeedbackParagraph);

        // Crear y añadir el botón "Siguiente pregunta"
        const nextQuestionButton = document.createElement('button');
        nextQuestionButton.id = 'nextQuestionButton';
        nextQuestionButton.textContent = 'Siguiente pregunta';
        nextQuestionButton.style.display = 'none'; // Oculto inicialmente
        nextQuestionButton.onclick = moveToNextTriviaQuestion; // Asignar el evento aquí
        triviaDiv.appendChild(nextQuestionButton);

    } else {
        // Todas las preguntas han sido respondidas
        triviaDiv.innerHTML = '<p>¡Has respondido todas las preguntas!</p><button id="restartTriviaButton">Volver a Jugar</button>';
        document.getElementById('restartTriviaButton').onclick = () => {
            currentTriviaQuestionIndex = 0;
            shuffleArray(triviaQuestions); // Vuelve a mezclar para una nueva partida
            displayTriviaQuestion();
        };
    }
}

// Ahora checkTriviaAnswer recibe el botón que fue clickeado
function checkTriviaAnswer(selectedButtonElement, selectedAnswer, correctAnswer) {
    const buttons = document.querySelectorAll('#trivia .trivia-answer-button'); // Selecciona solo los botones de respuesta
    
    // Deshabilita todos los botones de respuesta para evitar múltiples clics
    buttons.forEach(button => {
        button.disabled = true;
    });

    // Muestra feedback al usuario
    if (selectedAnswer === correctAnswer) {
        triviaFeedbackParagraph.textContent = '¡Correcto!';
        triviaFeedbackParagraph.style.color = 'green';
        selectedButtonElement.style.backgroundColor = '#4CAF50'; // Asegura que el botón correcto esté verde
    } else {
        triviaFeedbackParagraph.textContent = `Incorrecto. La respuesta correcta era: "${correctAnswer}".`;
        triviaFeedbackParagraph.style.color = 'red';
        selectedButtonElement.style.backgroundColor = '#f44336'; // Color rojo para la respuesta incorrecta seleccionada
        
        // También resaltar la respuesta correcta en verde
        buttons.forEach(button => {
            if (button.textContent === correctAnswer) {
                button.style.backgroundColor = '#4CAF50';
            }
        });
    }

    const nextButton = document.getElementById('nextQuestionButton');
    if (nextButton) {
        nextButton.style.display = 'block'; // Muestra el botón de siguiente pregunta
    }
}

function moveToNextTriviaQuestion() {
    currentTriviaQuestionIndex++;
    displayTriviaQuestion();
}