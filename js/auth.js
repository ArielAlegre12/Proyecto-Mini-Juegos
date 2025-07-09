export function setupAuth() {
  const toggleLoginBtn = document.getElementById("toggleLogin");
  const submenuLogin = document.getElementById("submenuLogin");
  const mensajeLogin = document.getElementById("mensajeLoginInline");
  const formLogin = document.getElementById("formLoginInline");
  const formRegistro = document.getElementById("formRegistroInline");

  // Toggle submenu login
  if (toggleLoginBtn && submenuLogin) {
  toggleLoginBtn.addEventListener("click", () => {
    console.log("Click en toggleLoginBtn"); // <-- aquí
    submenuLogin.classList.toggle("show");
  });
}

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

  formLogin.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("loginNombreInline").value.trim();
    const clave = document.getElementById("loginClaveInline").value.trim();

    try {
      const res = await fetch("http://192.168.100.234:3000/login", {
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
    } catch {
      mensajeLogin.textContent = "Error al conectar con el servidor.";
      mensajeLogin.style.color = "red";
    }
  });

  formRegistro.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("registroNombreInline").value.trim();
    const clave = document.getElementById("registroClaveInline").value.trim();

    try {
      const res = await fetch("http://192.168.100.234:3000/register", {
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
    } catch {
      mensajeLogin.textContent = "Error al conectar con el servidor.";
      mensajeLogin.style.color = "red";
    }
  });

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
}
