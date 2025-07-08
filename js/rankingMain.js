const KEY_USUARIOS = "rankingUsuarios"; // clave para usuarios en localStorage
const KEY_USUARIO_ACTUAL = "usuarioActualRanking"; // usuario logueado

// Obtiene la lista de usuarios guardados o vacío si no hay
function obtenerUsuariosRanking() {
  const usuarios = localStorage.getItem(KEY_USUARIOS);
  return usuarios ? JSON.parse(usuarios) : [];
}

// Guarda la lista de usuarios
function guardarUsuariosRanking(usuarios) {
  localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
}

// Registra usuario, devuelve true si pudo, false si ya existe
function registrarUsuarioRanking(nombre, clave) {
  if (!nombre || !clave) return false;
  const usuarios = obtenerUsuariosRanking();
  if (usuarios.some(u => u.nombre === nombre)) return false;
  usuarios.push({ nombre, clave, puntos: 0 });
  guardarUsuariosRanking(usuarios);
  return true;
}

// Intenta login, devuelve true si coincide usuario y clave
function loginRanking(nombre, clave) {
  if (!nombre || !clave) return false;
  const usuarios = obtenerUsuariosRanking();
  const usuario = usuarios.find(u => u.nombre === nombre && u.clave === clave);
  if (usuario) {
    localStorage.setItem(KEY_USUARIO_ACTUAL, nombre);
    return true;
  }
  return false;
}

// Devuelve el nombre del usuario logueado o null si no hay
function obtenerUsuarioLogueadoRanking() {
  return localStorage.getItem(KEY_USUARIO_ACTUAL);
}

// Cierra sesión
function cerrarSesionRanking() {
  localStorage.removeItem(KEY_USUARIO_ACTUAL);
}

// Actualiza la vista según si hay usuario logueado o no
function actualizarVistaRanking() {
  const usuario = obtenerUsuarioLogueadoRanking();
  if (usuario) {
    document.getElementById("bienvenidaRanking").style.display = "block";
    document.getElementById("usuarioActualRanking").textContent = usuario;
    document.getElementById("formRegistroRanking").style.display = "none";
    document.getElementById("formLoginRanking").style.display = "none";
  } else {
    document.getElementById("bienvenidaRanking").style.display = "none";
    document.getElementById("formRegistroRanking").style.display = "block";
    document.getElementById("formLoginRanking").style.display = "block";
  }
}

// Listeners para formulario registro y login
document.getElementById("formRegistroRanking").addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("registroNombre").value.trim();
  const clave = document.getElementById("registroClave").value.trim();
  const mensajeRegistro = document.getElementById("mensajeRegistro");

  if (registrarUsuarioRanking(nombre, clave)) {
    mensajeRegistro.style.color = "green";
    mensajeRegistro.textContent = "Registro exitoso! Redirigiendo...";

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1000); // Espera 1 segundo y redirige
  } else {
    mensajeRegistro.style.color = "red";
    mensajeRegistro.textContent = "Ese nombre ya existe o faltan datos.";

    setTimeout(() => {
      mensajeRegistro.textContent = "";
    }, 4000);
  }

  e.target.reset();
});

document.getElementById("formLoginRanking").addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("loginNombre").value.trim();
  const clave = document.getElementById("loginClave").value.trim();
  const mensajeLogin = document.getElementById("mensajeLogin");

  if (loginRanking(nombre, clave)) {
    mensajeLogin.style.color = "green";
    mensajeLogin.textContent = `Bienvenido, ${nombre}! Redirigiendo...`;

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1000); // Espera 1 segundo y redirige
  } else {
    mensajeLogin.style.color = "red";
    mensajeLogin.textContent = "Nombre o clave incorrectos.";

    setTimeout(() => {
      mensajeLogin.textContent = "";
    }, 4000);
  }

  e.target.reset();
});

// Listener para botón cerrar sesión
document.getElementById("btnCerrarSesionRanking").addEventListener("click", () => {
  cerrarSesionRanking();
  actualizarVistaRanking();
});

// Al cargar la página
actualizarVistaRanking();
