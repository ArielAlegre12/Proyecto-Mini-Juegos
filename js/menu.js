export function setupMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');
  const toggleLoginBtn = document.getElementById("toggleLogin");
  const submenuLogin = document.getElementById("submenuLogin");

  hamburgerBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('open'); //para animar el icono a una 'X'
  });

  //cerrar menú si clic afuera
  document.addEventListener('click', (event) =>{
    //verifico si existen antes de preguntar por .contains
    const isLoginClick = toggleLoginBtn && toggleLoginBtn.contains(event.target);
    const isSubMenuClick = submenuLogin && submenuLogin.contains(event.target);
    const isHamburgerClick =  hamburgerBtn.contains(event.target);
    const isNavClick = mainNav.contains(event.target);

    if(!isHamburgerClick && !isNavClick && !isLoginClick && !isSubMenuClick){
      mainNav.classList.remove('open');
      hamburgerBtn.classList.remove('open');
      if(submenuLogin) submenuLogin.classList.remove('show');
    }
  });

  //cerrar menú si se clickea en un link
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburgerBtn.classList.remove('open');
    });
  });

  //toggle submenú juegos
  document.getElementById('toggleJuegos').addEventListener('click', function () {
    this.classList.toggle('active');
    const submenu = document.getElementById('submenuJuegos');
    submenu.classList.toggle('show');
  });

  //toggle submenú login 
  if(toggleLoginBtn){
    toggleLoginBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();

      if(submenuLogin){
        submenuLogin.classList.toggle('open');
      }
    });
  }

  //click en juego - cierra menú y submenú, hace scroll y abre acordeón
  document.querySelectorAll('.juego-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.dataset.juego) {
        e.preventDefault();

        const juegoId = link.dataset.juego;
        const section = document.getElementById(juegoId);

        mainNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');

        document.getElementById('toggleJuegos').classList.remove('active');

        section.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
          //cierra todos los acordeones abiertos
          document.querySelectorAll('.accordion-content.active').forEach(item => {
            item.classList.remove('active');
          });

          //abre el acordeón correspondiente
          const content = section.querySelector('.accordion-content');
          content?.classList.add('active');

          //ejecuta lógica específica según el juego
          if (juegoId === 'juegoTrivia') {
            import('./trivia.js').then(mod => mod.loadTriviaQuestions());
          }
          if (juegoId === 'juegoAcertijos') {
            import('.acertijos.js').then(mod => mod.cargarAcertijos());
          }
        }, 400);
      } else {
        //para links sin data-juego, permitir navegación normal y cerrar menú
        mainNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        document.getElementById('toggleJuegos').classList.remove('active');
      }
    });
  });
}
