const KEY_USUARIOS = "rankingUsuarios"; 
const KEY_USUARIO_ACTUAL = "usuarioActualRanking";

// =====================
// FUNCIONES INTERNAS
// =====================

function obtenerUsuariosRanking() {
  const usuarios = localStorage.getItem(KEY_USUARIOS);
  return usuarios ? JSON.parse(usuarios) : [];
}

function guardarUsuariosRanking(usuarios) {
  localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
}

// =====================
// FUNCIONES GLOBALES
// =====================

window.registrarUsuarioRanking = function (nombre, clave) {
  if (!nombre || !clave) return false;

  const usuarios = obtenerUsuariosRanking();

  if (usuarios.some(u => u.nombre === nombre)) return false;

  usuarios.push({ nombre, clave, puntos: 0 });
  guardarUsuariosRanking(usuarios);

  return true;
};

window.loginRanking = function (nombre, clave) {
  if (!nombre || !clave) return false;

  const usuarios = obtenerUsuariosRanking();
  const usuario = usuarios.find(u => u.nombre === nombre && u.clave === clave);

  if (usuario) {
    localStorage.setItem(KEY_USUARIO_ACTUAL, nombre);
    return true;
  }

  return false;
};

window.obtenerUsuarioLogueadoRanking = function () {
  return localStorage.getItem(KEY_USUARIO_ACTUAL);
};

window.cerrarSesionRanking = function () {
  localStorage.removeItem(KEY_USUARIO_ACTUAL);
};

// =====================
// SOLO PARA ranking.html
// =====================

function actualizarVistaRanking() {
  const usuario = obtenerUsuarioLogueadoRanking();

  const bienvenida = document.getElementById("bienvenidaRanking");
  const usuarioSpan = document.getElementById("usuarioActualRanking");
  const formRegistro = document.getElementById("formRegistroRanking");
  const formLogin = document.getElementById("formLoginRanking");

  if (!bienvenida || !formRegistro || !formLogin) return;

  if (usuario) {
    bienvenida.style.display = "block";
    usuarioSpan.textContent = usuario;
    formRegistro.style.display = "none";
    formLogin.style.display = "none";
  } else {
    bienvenida.style.display = "none";
    formRegistro.style.display = "block";
    formLogin.style.display = "block";
  }
}

// =====================
// EVENTOS (SEGUROS)
// =====================

document.addEventListener("DOMContentLoaded", () => {

  const formRegistro = document.getElementById("formRegistroRanking");
  const formLogin = document.getElementById("formLoginRanking");
  const btnCerrar = document.getElementById("btnCerrarSesionRanking");

  // REGISTRO
  if (formRegistro) {
    formRegistro.addEventListener("submit", e => {
      e.preventDefault();

      const nombre = document.getElementById("regNombreRanking").value.trim();
      const clave = document.getElementById("regClaveRanking").value.trim();
      const mensaje = document.getElementById("mensajeRegistro");

      if (registrarUsuarioRanking(nombre, clave)) {
        mensaje.style.color = "green";
        mensaje.textContent = "Registro exitoso! Ya podés iniciar sesión.";
        e.target.reset();
      } else {
        mensaje.style.color = "red";
        mensaje.textContent = "Ese nombre ya existe o faltan datos.";
      }

      setTimeout(() => mensaje.textContent = "", 4000);
    });
  }

  // LOGIN
  if (formLogin) {
    formLogin.addEventListener("submit", e => {
      e.preventDefault();

      const nombre = document.getElementById("logNombreRanking").value.trim();
      const clave = document.getElementById("logClaveRanking").value.trim();
      const mensaje = document.getElementById("mensajeLogin");

      if (loginRanking(nombre, clave)) {
        mensaje.style.color = "green";
        mensaje.textContent = `Bienvenido, ${nombre}!`;
        actualizarVistaRanking();
        e.target.reset();
      } else {
        mensaje.style.color = "red";
        mensaje.textContent = "Nombre o clave incorrectos.";
      }

      setTimeout(() => mensaje.textContent = "", 4000);
    });
  }

  // LOGOUT
  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      cerrarSesionRanking();
      actualizarVistaRanking();
    });
  }

  // Inicializar vista SOLO si estamos en ranking.html
  if (formRegistro || formLogin) {
    actualizarVistaRanking();
  }

});