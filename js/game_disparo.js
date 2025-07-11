document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // --- Variables jugador y puntero ---
  const player = {
    x: 0, y: 0,
    speed: 5,
    vx: 0
  };
  const pointer = {
    x: 0, y: 0,
    down: false
  };

  // --- Teclas para movimiento ---
  const keys = {
    left: false,
    right: false
  };

  // --- Balas y enemigos ---
  const bullets = [];
  const enemies = [];

  let score = 0;
  let lastShot = 0;
  const fireRate = 200;

  let gamePaused = false;
  let animationFrameId = null;
  let spawnInterval = null;
  let gameOver = false;

  // --- Elementos DOM ---
  const pauseOverlay = document.getElementById('pauseOverlay');
  const resumeBtn = document.getElementById('resumeBtn');
  const btnPauseMobile = document.getElementById('btnPauseMobile');

  // --- Joystick elementos ---
  const joystickMove = document.querySelector('#joystickMove');
  const joystickMoveStick = joystickMove.querySelector('.joystickStick');
  const joystickAim = document.querySelector('#joystickAim');
  const joystickAimStick = joystickAim.querySelector('.joystickStick');

  // --- Variables multitouch ---
  let moveTouchId = null;
  let aimTouchId = null;

  let moveCenter = { x: 0, y: 0 };
  let aimCenter = { x: 0, y: 0 };

  let movePos = { x: 0, y: 0 };
  let aimPos = { x: 0, y: 0 };

  // --- Función para ajustar canvas al tamaño ventana ---
  function resizeCanvas() {
    const maxWidth = 600;
    const maxHeight = window.innerHeight * 0.7;
    canvas.width = Math.min(window.innerWidth * 0.9, maxWidth);
    canvas.height = Math.min(maxHeight, 400);

    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    pointer.x = canvas.width / 2;
    pointer.y = canvas.height / 2;
  }

  // --- Inicializar centros joystick ---
  function initJoystickCenters() {
    const rectMove = joystickMove.getBoundingClientRect();
    moveCenter.x = rectMove.left + rectMove.width / 2;
    moveCenter.y = rectMove.top + rectMove.height / 2;
    resetMoveJoystick();

    const rectAim = joystickAim.getBoundingClientRect();
    aimCenter.x = rectAim.left + rectAim.width / 2;
    aimCenter.y = rectAim.top + rectAim.height / 2;
    resetAimJoystick();
  }

  // --- Reset joystick movimiento ---
  function resetMoveJoystick() {
    joystickMoveStick.style.transform = 'translate(0px, 0px)';
    movePos.x = 0;
    movePos.y = 0;
    keys.left = false;
    keys.right = false;
    moveTouchId = null;
  }

  // --- Reset joystick apuntado ---
  function resetAimJoystick() {
    joystickAimStick.style.transform = 'translate(0px, 0px)';
    aimPos.x = 0;
    aimPos.y = 0;
    pointer.down = false;
    aimTouchId = null;
  }

  // --- Actualizar teclas según joystick movimiento ---
  function updatePlayerFromMoveJoystick() {
    if (movePos.x < -0.3) {
      keys.left = true;
      keys.right = false;
    } else if (movePos.x > 0.3) {
      keys.left = false;
      keys.right = true;
    } else {
      keys.left = false;
      keys.right = false;
    }
  }

  // --- Actualizar puntero según joystick apuntado ---
  function updatePointerFromAimJoystick() {
    if (aimPos.x === 0 && aimPos.y === 0) {
      pointer.down = false;
      return;
    }
    pointer.down = true;
    pointer.x = player.x + aimPos.x * 100;
    pointer.y = player.y + aimPos.y * 100;
    pointer.x = Math.min(Math.max(pointer.x, 0), canvas.width);
    pointer.y = Math.min(Math.max(pointer.y, 0), canvas.height);
  }

  // --- Helper para saber si un touch está dentro de un contenedor ---
  function isTouchInside(touch, container) {
    const rect = container.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  }

  // --- Manejo multitouch joystick movimiento ---
  joystickMove.addEventListener('touchstart', e => {
    e.preventDefault();
    initJoystickCenters();
    for (const touch of e.changedTouches) {
      if (moveTouchId === null && isTouchInside(touch, joystickMove)) {
        moveTouchId = touch.identifier;
        handleMoveJoystick(touch);
        break;
      }
    }
  }, { passive: false });

  joystickMove.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === moveTouchId) {
        handleMoveJoystick(touch);
        break;
      }
    }
  }, { passive: false });

  joystickMove.addEventListener('touchend', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === moveTouchId) {
        resetMoveJoystick();
        break;
      }
    }
  }, { passive: false });

  joystickMove.addEventListener('touchcancel', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === moveTouchId) {
        resetMoveJoystick();
        break;
      }
    }
  }, { passive: false });

  // --- Manejo multitouch joystick apuntado ---
  joystickAim.addEventListener('touchstart', e => {
    e.preventDefault();
    initJoystickCenters();
    for (const touch of e.changedTouches) {
      if (aimTouchId === null && isTouchInside(touch, joystickAim)) {
        aimTouchId = touch.identifier;
        handleAimJoystick(touch);
        break;
      }
    }
  }, { passive: false });

  joystickAim.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === aimTouchId) {
        handleAimJoystick(touch);
        break;
      }
    }
  }, { passive: false });

  joystickAim.addEventListener('touchend', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === aimTouchId) {
        resetAimJoystick();
        break;
      }
    }
  }, { passive: false });

  joystickAim.addEventListener('touchcancel', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === aimTouchId) {
        resetAimJoystick();
        break;
      }
    }
  }, { passive: false });

  // --- Funciones manejo joystick ---
  function handleMoveJoystick(touch) {
    const dx = touch.clientX - moveCenter.x;
    const dy = touch.clientY - moveCenter.y;
    const maxDist = 50;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) dist = maxDist;
    const angle = Math.atan2(dy, dx);
    const stickX = Math.cos(angle) * dist;
    const stickY = Math.sin(angle) * dist;
    joystickMoveStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    movePos.x = stickX / maxDist;
    movePos.y = stickY / maxDist;
    updatePlayerFromMoveJoystick();
  }

  function handleAimJoystick(touch) {
    const dx = touch.clientX - aimCenter.x;
    const dy = touch.clientY - aimCenter.y;
    const maxDist = 50;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) dist = maxDist;
    const angle = Math.atan2(dy, dx);
    const stickX = Math.cos(angle) * dist;
    const stickY = Math.sin(angle) * dist;
    joystickAimStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    aimPos.x = stickX / maxDist;
    aimPos.y = stickY / maxDist;
    updatePointerFromAimJoystick();
  }

  // --- Teclado PC ---
  window.addEventListener('keydown', e => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
    if (e.key.toLowerCase() === 'p') {
      if (gamePaused) resumeGame();
      else pauseGame();
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
  });

  // --- Mouse apuntado y disparo ---
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) pointer.down = true;
  });
  canvas.addEventListener('mouseup', e => {
    if (e.button === 0) pointer.down = false;
  });

  // --- Touch canvas para disparar apuntado ---
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    pointer.x = touch.clientX - rect.left;
    pointer.y = touch.clientY - rect.top;
    pointer.down = true;
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    pointer.x = touch.clientX - rect.left;
    pointer.y = touch.clientY - rect.top;
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    pointer.down = false;
  }, { passive: false });

  // --- Botón pausa ---
  btnPauseMobile.addEventListener('click', () => {
    if (gamePaused) resumeGame();
    else pauseGame();
  });

  // --- Spawn enemigos ---
  function spawnEnemy() {
    if (gamePaused || gameOver) return;
    const x = Math.random() * (canvas.width - 30) + 15;
    enemies.push({ x, y: -20, size: 30, speed: 2 + Math.random() * 2 });
  }
  function startSpawning() {
    spawnInterval = setInterval(spawnEnemy, 1000);
  }
  function stopSpawning() {
    clearInterval(spawnInterval);
  }

  // --- Reiniciar juego ---
  function restartGame() {
    score = 0;
    gameOver = false;
    bullets.length = 0;
    enemies.length = 0;
    pauseOverlay.style.visibility = 'hidden';
    pauseOverlay.firstElementChild.textContent = "Juego en pausa";

    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    pointer.x = canvas.width / 2;
    pointer.y = canvas.height / 2;

    gamePaused = false;
    startSpawning();
    gameLoop();
  }

  // --- Pausar y reanudar ---
  function pauseGame() {
    gamePaused = true;
    pauseOverlay.style.visibility = 'visible';
    stopSpawning();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }

  function resumeGame() {
    if (gameOver) restartGame();
    else {
      gamePaused = false;
      pauseOverlay.style.visibility = 'hidden';
      startSpawning();
      gameLoop();
    }
  }

  resumeBtn.addEventListener('click', resumeGame);

  // --- Disparo automático ---
  function shoot(time) {
    if (gamePaused || gameOver) return;
    if (time - lastShot > fireRate && pointer.down) {
      bullets.push({
        x: player.x,
        y: player.y - 15,
        size: 6,
        speed: 8,
        angle: Math.atan2(pointer.y - player.y, pointer.x - player.x)
      });
      lastShot = time;
    }
  }

  // --- Actualizar jugador ---
  function updatePlayer() {
    if (keys.left) player.vx = -player.speed;
    else if (keys.right) player.vx = player.speed;
    else player.vx = 0;

    player.x += player.vx;
    player.x = Math.min(Math.max(player.x, 20), canvas.width - 20);
  }

  // --- Actualizar balas ---
  function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;

      if (
        b.x < 0 || b.x > canvas.width ||
        b.y < 0 || b.y > canvas.height
      ) {
        bullets.splice(i, 1);
      }
    }
  }

  // --- Actualizar enemigos ---
  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speed;

      // Colisión jugador - game over
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < e.size + 20) {
        gameOver = true;
        pauseGame();
        pauseOverlay.firstElementChild.textContent = "¡Perdiste! Puntos: " + score;
        return;
      }

      // Enemigo se escapa -> pierde punto
      if (e.y > canvas.height + e.size) {
        enemies.splice(i, 1);
        score = Math.max(0, score - 1);
        document.getElementById('score').textContent = `Puntaje: ${score}`;
      }
    }
  }

  // --- Colisiones balas - enemigos ---
  function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const dx = e.x - b.x;
        const dy = e.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < e.size + b.size) {
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score++;
          document.getElementById('score').textContent = `Puntaje: ${score}`;
          break;
        }
      }
    }
  }

  // --- Dibujar ---
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Jugador
    ctx.fillStyle = '#a22';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Puntero
    ctx.fillStyle = '#f55';
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Balas
    ctx.fillStyle = 'yellow';
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemigos
    ctx.fillStyle = 'lime';
    enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // --- Loop principal ---
  function gameLoop(time = 0) {
    if (gamePaused) return;
    updatePlayer();
    shoot(time);
    updateBullets();
    updateEnemies();
    checkCollisions();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Inicializar ---
  resizeCanvas();
  initJoystickCenters();
  restartGame();

  // --- Resize ventana ---
  window.addEventListener('resize', () => {
    resizeCanvas();
    initJoystickCenters();
  });
});
