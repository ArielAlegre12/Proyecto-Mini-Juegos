// Elementos
const toggleLoginBtn = document.getElementById("toggleLogin");
const submenuLogin = document.getElementById("submenuLogin");
const mensajeLogin = document.getElementById("mensajeLoginInline");
const formLogin = document.getElementById("formLoginInline");
const formRegistro = document.getElementById("formRegistroInline");

// Funciones simuladas de login/registro (ajustalas si tenés las tuyas)
function loginRanking(nombre, clave) {
  // Simula validación simple con localStorage usuarios registrados
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
  return usuarios[nombre] === clave;
}

function registrarUsuarioRanking(nombre, clave) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
  if (usuarios[nombre]) return false; // usuario existe
  usuarios[nombre] = clave;
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  return true;
}

function guardarUsuarioLogueado(nombre) {
  localStorage.setItem("usuarioLogueado", nombre);
}

function obtenerUsuarioLogueadoRanking() {
  return localStorage.getItem("usuarioLogueado");
}

function cerrarSesion() {
  localStorage.removeItem("usuarioLogueado");
  location.reload(); // recarga para resetear estado, o podés llamar a updateUI()
}

// Mostrar u ocultar submenu login al hacer click en el botón
toggleLoginBtn.addEventListener("click", () => {
  submenuLogin.classList.toggle("show");
});

// Manejo del login
formLogin.addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("loginNombreInline").value.trim();
  const clave = document.getElementById("loginClaveInline").value.trim();

  if (loginRanking(nombre, clave)) {
    guardarUsuarioLogueado(nombre);
    mensajeLogin.textContent = `¡Bienvenido, ${nombre}!`;
    mensajeLogin.style.color = "green";
    updateLoginUI(nombre);
    submenuLogin.classList.remove("show");
  } else {
    mensajeLogin.textContent = "Datos incorrectos.";
    mensajeLogin.style.color = "red";
  }
});

// Manejo del registro
formRegistro.addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("registroNombreInline").value.trim();
  const clave = document.getElementById("registroClaveInline").value.trim();

  if (registrarUsuarioRanking(nombre, clave)) {
    guardarUsuarioLogueado(nombre);
    mensajeLogin.textContent = "¡Registro exitoso!";
    mensajeLogin.style.color = "green";
    updateLoginUI(nombre);
    submenuLogin.classList.remove("show");
  } else {
    mensajeLogin.textContent = "El usuario ya existe.";
    mensajeLogin.style.color = "red";
  }
});

// Actualiza el botón 'Entrar ▾' a 'Hola, usuario ▾' con opción para cerrar sesión
function updateLoginUI(nombre) {
  toggleLoginBtn.textContent = `Hola, ${nombre} ▾`;

  // Opción para cerrar sesión: agregamos un item al submenuLogin
  let logoutLi = document.getElementById("logoutLi");
  if (!logoutLi) {
    logoutLi = document.createElement("li");
    logoutLi.id = "logoutLi";
    logoutLi.innerHTML = `<button id="logoutBtn" style="width:100%;background:none;border:none;color:#333;cursor:pointer;text-align:left;padding:8px 0;">Cerrar sesión</button>`;
    submenuLogin.appendChild(logoutLi);

    document.getElementById("logoutBtn").addEventListener("click", () => {
      cerrarSesion();
    });
  }
}

// Al cargar la página, si ya hay usuario logueado actualiza UI
const usuarioLogueado = obtenerUsuarioLogueadoRanking();
if (usuarioLogueado) {
  updateLoginUI(usuarioLogueado);
}
