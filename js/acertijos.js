// acertijos.js

import { shuffleArray } from './utils.js';

let acertijos = [];
let indiceAcertijo = 0;

export async function setupAcertijos() {
  await cargarAcertijos();
  // acá podés agregar más inicializaciones si querés después
}

export async function cargarAcertijos() {
  try {
    const res = await fetch('/data/acertijo.json');
    acertijos = await res.json();
    shuffleArray(acertijos);
    indiceAcertijo = 0;
    mostrarAcertijo();
  } catch (err) {
    console.error("Error al cargar acertijos:", err);
    document.getElementById('acertijos').innerHTML = `<p>Error al cargar los acertijos: ${err.message}</p>`;
  }}



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

  const h3 = document.createElement('h3');
  h3.textContent = acertijo.acertijo;
  preguntaDiv.appendChild(h3);

  opciones.forEach(op => {
    const btn = document.createElement('button');
    btn.textContent = op;
    btn.classList.add('answer-button');
    btn.onclick = () => verificarAcertijo(btn, acertijo.respuesta);
    preguntaDiv.appendChild(btn);
  });

  contenedor.appendChild(preguntaDiv);

  const botonesDiv = document.createElement('div');
  botonesDiv.classList.add('botones-container');
  botonesDiv.style.display = 'flex';
  botonesDiv.style.justifyContent = 'center';
  botonesDiv.style.gap = '10px';
  botonesDiv.style.marginTop = '15px';

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

  const siguienteBtn = document.createElement('button');
  siguienteBtn.textContent = 'Siguiente';
  siguienteBtn.classList.add('btn-pista');
  siguienteBtn.onclick = siguienteAcertijo;
  botonesDiv.appendChild(siguienteBtn);

  contenedor.appendChild(botonesDiv);
}

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

function siguienteAcertijo() {
  indiceAcertijo++;
  mostrarAcertijo();
}
