const KEY_USUARIOS = "rankingUsuarios"; 
const KEY_USUARIO_ACTUAL = "usuarioActualRanking";

// --- PERSISTENCIA ---
const obtenerUsuarios = () => JSON.parse(localStorage.getItem(KEY_USUARIOS)) || [];
const guardarUsuarios = (usuarios) => localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));

// --- LOGICA GLOBAL ---
window.registrarUsuarioRanking = (nombre, clave) => {
  if (!nombre || !clave) return false;
  const usuarios = obtenerUsuarios();
  if (usuarios.some(u => u.nombre === nombre)) return false;
  usuarios.push({ nombre, clave, puntos: 0 });
  guardarUsuarios(usuarios);
  return true;
};

window.loginRanking = (nombre, clave) => {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.nombre === nombre && u.clave === clave);
  if (usuario) {
    localStorage.setItem(KEY_USUARIO_ACTUAL, nombre);
    actualizarVistaRanking();
    return true;
  }
  return false;
};

window.cerrarSesionRanking = () => {
  localStorage.removeItem(KEY_USUARIO_ACTUAL);
  actualizarVistaRanking();
};

/**
 * SUMAR PUNTOS: Esta es la que vas a usar en trivia.js y acertijos.js
 * Ejemplo: window.sumarPuntosRanking(10);
 */
window.sumarPuntosRanking = (puntosASumar) => {
  const nombreActual = localStorage.getItem(KEY_USUARIO_ACTUAL);
  if (!nombreActual) return;

  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.nombre === nombreActual);

  if (index !== -1) {
    usuarios[index].puntos = (usuarios[index].puntos || 0) + puntosASumar;
    guardarUsuarios(usuarios);
    actualizarVistaRanking(); // Para que el número cambie en el momento
  }
};

// --- INTERFAZ ---
function actualizarVistaRanking() {
  const nombre = localStorage.getItem(KEY_USUARIO_ACTUAL);
  const usuarios = obtenerUsuarios();
  
  const bienvenida = document.getElementById("bienvenidaRanking");
  const userSpan = document.getElementById("usuarioActualRanking");
  const ptsSpan = document.getElementById("puntosActualRanking");
  const formReg = document.getElementById("formRegistroRanking");
  const formLog = document.getElementById("formLoginRanking");

  if (!bienvenida) return; // Seguridad por si no estamos en la página correcta

  if (nombre) {
    const datos = usuarios.find(u => u.nombre === nombre);
    bienvenida.style.display = "block";
    userSpan.textContent = nombre;
    ptsSpan.textContent = datos ? datos.puntos : 0; // <--- MUESTRA LOS PUNTOS
    
    if(formReg) formReg.style.display = "none";
    if(formLog) formLog.style.display = "none";
  } else {
    bienvenida.style.display = "none";
    if(formReg) formReg.style.display = "block";
    if(formLog) formLog.style.display = "block";
  }
}

// Escuchador inicial
document.addEventListener("DOMContentLoaded", actualizarVistaRanking);