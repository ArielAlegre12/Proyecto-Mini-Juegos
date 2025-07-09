// URL base del backend (cambiá esta IP cuando necesites)
const API_URL = "http://3.144.234.10:3000";


// Elementos
const toggleLoginBtn = document.getElementById("toggleLogin");
const submenuLogin = document.getElementById("submenuLogin");
const mensajeLogin = document.getElementById("mensajeLoginInline");
const formLogin = document.getElementById("formLoginInline");
const formRegistro = document.getElementById("formRegistroInline");

// Guardar usuario logueado en localStorage igual
function guardarUsuarioLogueado(nombre) {
  localStorage.setItem("usuarioLogueado", nombre);
}

function obtenerUsuarioLogueadoRanking() {
  return localStorage.getItem("usuarioLogueado");
}

function cerrarSesion() {
  localStorage.removeItem("usuarioLogueado");
  location.reload();
}

// Mostrar u ocultar submenu login
toggleLoginBtn.addEventListener("click", () => {
  submenuLogin.classList.toggle("show");
});

// Login con fetch al backend
formLogin.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("loginNombreInline").value.trim();
  const clave = document.getElementById("loginClaveInline").value.trim();

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nombre, password: clave }),
    });

    const data = await res.json();

    if (res.ok) {
      guardarUsuarioLogueado(data.username);
      mensajeLogin.textContent = `¡Bienvenido, ${data.username}!`;
      mensajeLogin.style.color = "green";
      updateLoginUI(data.username);
      submenuLogin.classList.remove("show");
    } else {
      mensajeLogin.textContent = data.message;
      mensajeLogin.style.color = "red";
    }
  } catch (error) {
    mensajeLogin.textContent = "Error al conectar con el servidor.";
    mensajeLogin.style.color = "red";
  }
});

// Registro con fetch al backend
formRegistro.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("registroNombreInline").value.trim();
  const clave = document.getElementById("registroClaveInline").value.trim();

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nombre, password: clave }),
    });

    const data = await res.json();

    if (res.ok) {
      guardarUsuarioLogueado(nombre);
      mensajeLogin.textContent = "¡Registro exitoso!";
      mensajeLogin.style.color = "green";
      updateLoginUI(nombre);
      submenuLogin.classList.remove("show");
    } else {
      mensajeLogin.textContent = data.message;
      mensajeLogin.style.color = "red";
    }
  } catch (error) {
    mensajeLogin.textContent = "Error al conectar con el servidor.";
    mensajeLogin.style.color = "red";
  }
});

// Actualiza UI para usuario logueado
function updateLoginUI(nombre) {
  toggleLoginBtn.textContent = `Hola, ${nombre} ▾`;

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
