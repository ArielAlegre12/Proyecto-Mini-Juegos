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
    const contenedor = document.getElementById('trivia');
    contenedor.innerHTML = '';

    if (currentTriviaQuestionIndex < triviaQuestions.length) {
        const pregunta = triviaQuestions[currentTriviaQuestionIndex];

        // Contenedor pregunta con clase 'pregunta'
        const preguntaDiv = document.createElement('div');
        preguntaDiv.classList.add('pregunta');

        // Texto de la pregunta
        const h3 = document.createElement('h3');
        h3.textContent = pregunta.question;
        preguntaDiv.appendChild(h3);

        // Opciones de respuesta (botones)
        const opciones = shuffleArray([...pregunta.incorrect_answers, pregunta.correct_answer]);
        opciones.forEach(opcion => {
            const btn = document.createElement('button');
            btn.textContent = opcion;
            btn.classList.add('answer-button');
            btn.onclick = () => checkTriviaAnswer(btn, opcion, pregunta.correct_answer);
            preguntaDiv.appendChild(btn);
        });

        contenedor.appendChild(preguntaDiv);

        // Contenedor para botones pista y siguiente
        const botonesDiv = document.createElement('div');
        botonesDiv.style.display = 'flex';
        botonesDiv.style.justifyContent = 'center';
        botonesDiv.style.gap = '10px';
        botonesDiv.style.marginTop = '15px';

        // Botón mostrar pista (si tiene pista)
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

        // Botón siguiente (siempre visible)
        const siguienteBtn = document.createElement('button');
        siguienteBtn.textContent = 'Siguiente';
        siguienteBtn.classList.add('btn-pista');
        siguienteBtn.onclick = moveToNextTriviaQuestion;
        botonesDiv.appendChild(siguienteBtn);

        contenedor.appendChild(botonesDiv);

        // Párrafo para feedback debajo de la pregunta
        triviaFeedbackParagraph = document.createElement('p');
        contenedor.appendChild(triviaFeedbackParagraph);

    } else {
        // Final del juego
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


// === JUEGO DE acertijos ===

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

    // Opciones de respuesta
    opciones.forEach(op => {
        const btn = document.createElement('button');
        btn.textContent = op;
        btn.classList.add('answer-button');
        btn.onclick = () => verificarAcertijo(btn, acertijo.respuesta);
        preguntaDiv.appendChild(btn);
    });

    contenedor.appendChild(preguntaDiv);
    // Contenedor para botones pista y siguiente
    const botonesDiv = document.createElement('div');
    botonesDiv.classList.add('botones-container');
    botonesDiv.style.display = 'flex';
    botonesDiv.style.justifyContent = 'center';
    botonesDiv.style.gap = '10px';
    botonesDiv.style.marginTop = '15px';


    // Botón mostrar pista si existe
    if (acertijo.pista && acertijo.pista.trim() !== '') {
        const botonPista = document.createElement('button');
        botonPista.textContent = 'Mostrar pista';
        botonPista.classList.add('btn-pista');
        botonPista.onclick = () => {
            botonPista.disabled = true;
            const pista = document.createElement('p');
            pista.textContent = `💡 Pista: ${acertijo.pista}`;
            pista.classList.add('pista-text');
            contenedor.appendChild(pista);
        };
        botonesDiv.appendChild(botonPista);
    }

    // Botón siguiente
    const siguienteBtn = document.createElement('button');
    siguienteBtn.textContent = 'Siguiente';
    siguienteBtn.classList.add('btn-pista');
    siguienteBtn.onclick = siguienteAcertijo;
    botonesDiv.appendChild(siguienteBtn);

    contenedor.appendChild(botonesDiv);
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
const toggleBtn = document.getElementById('themeToggle');

// --- Función para aplicar el modo y actualizar el botón ---
function applyMode(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        toggleBtn.textContent = '🌙';
    } else {
        document.body.classList.remove('dark-mode');
        toggleBtn.textContent = '☀️';
    }
}

// --- Al cargar la página: Cargar la preferencia de LocalStorage ---
document.addEventListener('DOMContentLoaded', function () {
    const savedMode = localStorage.getItem('themeMode'); // 'dark' o 'light' o null si no hay nada

    // Si hay un modo guardado, aplicarlo. Si no, usar el modo por defecto (claro)
    if (savedMode === 'dark') {
        applyMode(true);
    } else {
        applyMode(false); // Por defecto o si 'savedMode' es 'light'
    }
});


// --- Al hacer clic en el botón: Cambiar modo y guardar preferencia ---
toggleBtn.onclick = function () {
    // Alternar la clase 'dark-mode'
    document.body.classList.toggle('dark-mode');

    // Verificar si ahora está en modo oscuro
    const isCurrentlyDarkMode = document.body.classList.contains('dark-mode');

    // Aplicar el modo visualmente y actualizar el texto del botón
    applyMode(isCurrentlyDarkMode);

    // Guardar la preferencia en LocalStorage
    if (isCurrentlyDarkMode) {
        localStorage.setItem('themeMode', 'dark');
    } else {
        localStorage.setItem('themeMode', 'light');
    }
};

// --- Lógica del Menú Hamburguesa ---
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');

hamburgerBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('open'); // Para animar el icono a una 'X'
});

// Opcional: Cerrar el menú si se hace clic fuera de él
document.addEventListener('click', (event) => {
    // Si el clic no fue en el botón de hamburguesa y no fue dentro del menú
    if (!hamburgerBtn.contains(event.target) && !mainNav.contains(event.target)) {
        mainNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');
    }
});

// Opcional: Cerrar el menú si se hace clic en un enlace (para navegación interna)
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');
    });
});

// --- Lógica del Submenú de Juegos ---
document.getElementById('toggleJuegos').addEventListener('click', function () {
    this.classList.toggle('active');
    const submenu = document.getElementById('submenuJuegos');
    submenu.classList.toggle('show');  // <- Esto es lo que falta para mostrar/ocultar el submenú
});

document.querySelectorAll('.juego-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const juegoId = link.dataset.juego;
        const section = document.getElementById(juegoId);

        const mainNav = document.getElementById('mainNav');
        const hamburgerBtn = document.getElementById('hamburgerBtn');

        // Cierra el menú hamburguesa si está abierto
        mainNav?.classList.remove('open');
        hamburgerBtn?.classList.remove('open');

        // Cierra submenú
        document.getElementById('toggleJuegos').classList.remove('active');

        // Desplaza suavemente
        section.scrollIntoView({ behavior: 'smooth' });

        // Abre el acordeón después del scroll
        setTimeout(() => {
            // Cierra todos los demás
            document.querySelectorAll('.accordion-content.active').forEach(item => {
                item.classList.remove('active');
            });

            // Abre el acordeón correspondiente
            const content = section.querySelector('.accordion-content');
            content?.classList.add('active');

            // Ejecuta la lógica del juego si aplica
            if (juegoId === 'juegoTrivia') loadTriviaQuestions();
            if (juegoId === 'juegoAcertijos') cargarAcertijos();
        }, 400);
    });
});
