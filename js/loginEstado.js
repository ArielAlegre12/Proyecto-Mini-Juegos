document.addEventListener("DOMContentLoaded", () => {

  const toggleLoginBtn = document.getElementById("toggleLogin");
  const submenuLogin = document.getElementById("submenuLogin");
  const mensaje = document.getElementById("mensajeLoginInline");

  const formLogin = document.getElementById("formLoginInline");
  const formRegistro = document.getElementById("formRegistroInline");

  // 🔐 Seguridad: si no existe el menú, salir
  if (!toggleLoginBtn || !submenuLogin) return;

  // =====================
  // TOGGLE MENÚ
  // =====================
  toggleLoginBtn.addEventListener("click", () => {
    submenuLogin.classList.toggle("show");
  });

  // =====================
  // LOGIN
  // =====================
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("loginNombreInline").value.trim();
      const clave = document.getElementById("loginClaveInline").value.trim();

      if (loginRanking(nombre, clave)) {
        mensaje.textContent = `¡Bienvenido, ${nombre}!`;
        mensaje.style.color = "green";

        actualizarUI(nombre);

        formLogin.reset();
      } else {
        mensaje.textContent = "Datos incorrectos";
        mensaje.style.color = "red";
      }
    });
  }

  // =====================
  // REGISTRO
  // =====================
  if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("registroNombreInline").value.trim();
      const clave = document.getElementById("registroClaveInline").value.trim();

      if (registrarUsuarioRanking(nombre, clave)) {
        mensaje.textContent = "Usuario creado, ahora podés iniciar sesión";
        mensaje.style.color = "green";

        formRegistro.reset();
      } else {
        mensaje.textContent = "Usuario ya existe";
        mensaje.style.color = "red";
      }
    });
  }

  // =====================
  // UI LOGUEADO
  // =====================
  function actualizarUI(nombre) {
    toggleLoginBtn.textContent = `Hola, ${nombre} ▾`;

    submenuLogin.innerHTML = `
      <li><span>Hola, ${nombre}</span></li>
      <li><button id="logoutBtn">Cerrar sesión</button></li>
    `;

    // 👇 importante: cerramos menú después del login
    submenuLogin.classList.remove("show");

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        cerrarSesionRanking();
        location.reload();
      });
    }
  }

  // =====================
  // AUTO LOGIN (si ya había sesión)
  // =====================
  const usuario = obtenerUsuarioLogueadoRanking();

  if (usuario) {
    actualizarUI(usuario);
  }

});