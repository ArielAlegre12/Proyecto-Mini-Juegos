export function setupMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  hamburgerBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('open'); // Para animar el icono a una 'X'
  });

  // Cerrar menú si clic afuera
  document.addEventListener('click', (event) => {
    if (!hamburgerBtn.contains(event.target) && !mainNav.contains(event.target)) {
      mainNav.classList.remove('open');
      hamburgerBtn.classList.remove('open');
    }
  });

  // Cerrar menú si se clickea en un link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburgerBtn.classList.remove('open');
    });
  });

  // Toggle submenú juegos
  document.getElementById('toggleJuegos').addEventListener('click', function () {
    this.classList.toggle('active');
    const submenu = document.getElementById('submenuJuegos');
    submenu.classList.toggle('show');
  });
   
  // Toggle submenú login 
  const toggleLoginBtn = document.getElementById("toggleLogin");
  const submenuLogin = document.getElementById("submenuLogin");
  if (toggleLoginBtn && submenuLogin) {
    toggleLoginBtn.addEventListener("click", () => {
      submenuLogin.classList.toggle("show");
    });
    document.getElementById("toggleLogin").addEventListener("click", () => {
  const submenu = document.getElementById("submenuLogin");
  submenu.classList.toggle("show");
});

  }

  // Click en juego - cierra menú y submenú, hace scroll y abre acordeón
  document.querySelectorAll('.juego-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const juegoId = link.dataset.juego;
      const section = document.getElementById(juegoId);

      mainNav.classList.remove('open');
      hamburgerBtn.classList.remove('open');

      document.getElementById('toggleJuegos').classList.remove('active');

      section.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        // Cierra todos los acordeones abiertos
        document.querySelectorAll('.accordion-content.active').forEach(item => {
          item.classList.remove('active');
        });

        // Abre el acordeón correspondiente
        const content = section.querySelector('.accordion-content');
        content?.classList.add('active');

        // Ejecuta lógica específica
        if (juegoId === 'juegoTrivia') {
          import('./trivia.js').then(mod => mod.loadTriviaQuestions());
        }
        if (juegoId === 'juegoAcertijos') {
          import('./acertijos.js').then(mod => mod.cargarAcertijos());
        }
      }, 400);
    });
  });
}
