// darkmode.js
export function setupDarkMode() {
  const toggleBtn = document.getElementById('themeToggle');

  if (!toggleBtn) {
    console.warn('Botón de modo oscuro no encontrado');
    return;
  }

  function applyMode(isDarkMode) {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      toggleBtn.textContent = '🌙';
    } else {
      document.body.classList.remove('dark-mode');
      toggleBtn.textContent = '☀️';
    }
  }

  // Al cargar la página: aplicar modo guardado o por defecto
  const savedMode = localStorage.getItem('themeMode');
  if (savedMode === 'dark') {
    applyMode(true);
  } else {
    applyMode(false);
  }

  // Al hacer clic en el botón: alternar modo y guardar preferencia
  toggleBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    const isCurrentlyDarkMode = document.body.classList.contains('dark-mode');
    applyMode(isCurrentlyDarkMode);

    if (isCurrentlyDarkMode) {
      localStorage.setItem('themeMode', 'dark');
    } else {
      localStorage.setItem('themeMode', 'light');
    }
  };
}
