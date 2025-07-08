// Clave del usuario actual en localStorage
const KEY_USUARIO_ACTUAL = "usuarioActualRanking";

// Verifica si hay un usuario logueado
function obtenerUsuarioLogueadoRanking() {
  return localStorage.getItem(KEY_USUARIO_ACTUAL);
}

// Cierra sesión y recarga la página
function cerrarSesionDesdeIndex() {
  localStorage.removeItem(KEY_USUARIO_ACTUAL);
  location.reload();
}

// Al cargar, modifica el menú si hay sesión activa
document.addEventListener("DOMContentLoaded", () => {
  const usuario = obtenerUsuarioLogueadoRanking();
  const loginItem = document.getElementById("loginMenuItem");

  if (usuario && loginItem) {
    loginItem.innerHTML = `
      <span>Hola, ${usuario}</span>
      <button id="btnCerrarSesionIndex" style="margin-left: 10px;">Cerrar sesión</button>
    `;

    document.getElementById("btnCerrarSesionIndex").addEventListener("click", cerrarSesionDesdeIndex);
  }
});
