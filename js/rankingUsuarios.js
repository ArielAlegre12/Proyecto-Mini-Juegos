const KEY_USUARIOS = "rankingUsuarios"; 
const KEY_USUARIO_ACTUAL = "usuarioActualRanking";

function obtenerUsuariosRanking() {
  const usuarios = localStorage.getItem(KEY_USUARIOS);
  return usuarios ? JSON.parse(usuarios) : [];
}

function guardarUsuariosRanking(usuarios) {
  localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
}

function registrarUsuarioRanking(nombre, clave) {
  if (!nombre || !clave) return false;
  const usuarios = obtenerUsuariosRanking();
  if (usuarios.some(u => u.nombre === nombre)) return false;
  usuarios.push({ nombre, clave, puntos: 0 });
  guardarUsuariosRanking(usuarios);
  return true;
}

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

function obtenerUsuarioLogueadoRanking() {
  return localStorage.getItem(KEY_USUARIO_ACTUAL);
}

function cerrarSesionRanking() {
  localStorage.removeItem(KEY_USUARIO_ACTUAL);
}

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

document.getElementById("formRegistroRanking").addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("regNombreRanking").value.trim();
  const clave = document.getElementById("regClaveRanking").value.trim();
  const mensajeRegistro = document.getElementById("mensajeRegistro");

  if (registrarUsuarioRanking(nombre, clave)) {
    mensajeRegistro.style.color = "green";
    mensajeRegistro.textContent = "Registro exitoso! Ya podés iniciar sesión.";
    e.target.reset();
  } else {
    mensajeRegistro.style.color = "red";
    mensajeRegistro.textContent = "Ese nombre ya existe o faltan datos.";
  }

  setTimeout(() => {
    mensajeRegistro.textContent = "";
  }, 4000);
});

document.getElementById("formLoginRanking").addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("logNombreRanking").value.trim();
  const clave = document.getElementById("logClaveRanking").value.trim();
  const mensajeLogin = document.getElementById("mensajeLogin");

  if (loginRanking(nombre, clave)) {
    mensajeLogin.style.color = "green";
    mensajeLogin.textContent = `Bienvenido, ${nombre}!`;
    actualizarVistaRanking();
    e.target.reset();
  } else {
    mensajeLogin.style.color = "red";
    mensajeLogin.textContent = "Nombre o clave incorrectos.";
  }

  setTimeout(() => {
    mensajeLogin.textContent = "";
  }, 4000);
});

document.getElementById("btnCerrarSesionRanking").addEventListener("click", () => {
  cerrarSesionRanking();
  actualizarVistaRanking();
});

actualizarVistaRanking();
