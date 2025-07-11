document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Jugador con posicion, velocidad y tamaño normal
  const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    speed: 5,
    vx: 0,
    size: 20
  };

  // Puntero para apuntar y disparar
  const pointer = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false
  };

  // Teclas para movimiento PC
  const keys = {
    left: false,
    right: false
  };

  const bullets = [];
  const enemies = [];
  const powerUps = [];

  let score = 0;
  let lastShot = 0;
  const fireRate = 200;

  let gamePaused = false;
  let animationFrameId = null;
  let spawnInterval = null;
  let powerUpInterval = null;
  let gameOver = false;

  let powerUpActive = false;
  let powerUpEndTime = 0;

  // Pausa, botones y sticks
  const pauseOverlay = document.getElementById('pauseOverlay');
  const resumeBtn = document.getElementById('resumeBtn');
  const btnPauseMobile = document.getElementById('btnPauseMobile');

  const joystickMove = document.querySelector('#joystickMove');
  const joystickMoveStick = joystickMove.querySelector('.joystickStick');
  const joystickAim = document.querySelector('#joystickAim');
  const joystickAimStick = joystickAim.querySelector('.joystickStick');

  // Variables multitouch para sticks (igual que antes)
  let moveTouchId = null;
  let aimTouchId = null;

  let moveCenter = { x: 0, y: 0 };
  let aimCenter = { x: 0, y: 0 };

  let movePos = { x: 0, y: 0 };
  let aimPos = { x: 0, y: 0 };

  // Igual que antes: inicializar centros joystick
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

  function resetMoveJoystick() {
    joystickMoveStick.style.transform = 'translate(0px, 0px)';
    movePos.x = 0;
    movePos.y = 0;
    keys.left = false;
    keys.right = false;
    moveTouchId = null;
  }

  function resetAimJoystick() {
    joystickAimStick.style.transform = 'translate(0px, 0px)';
    aimPos.x = 0;
    aimPos.y = 0;
    pointer.down = false;
    aimTouchId = null;
  }

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

  // Manejo multitouch de los sticks igual que antes
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
  }, {passive: false});
  joystickMove.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === moveTouchId) {
        handleMoveJoystick(touch);
        break;
      }
    }
  }, {passive: false});
  joystickMove.addEventListener('touchend', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === moveTouchId) {
        resetMoveJoystick();
        break;
      }
    }
  }, {passive: false});
  joystickMove.addEventListener('touchcancel', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === moveTouchId) {
        resetMoveJoystick();
        break;
      }
    }
  }, {passive: false});

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
  }, {passive: false});
  joystickAim.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === aimTouchId) {
        handleAimJoystick(touch);
        break;
      }
    }
  }, {passive: false});
  joystickAim.addEventListener('touchend', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === aimTouchId) {
        resetAimJoystick();
        break;
      }
    }
  }, {passive: false});
  joystickAim.addEventListener('touchcancel', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === aimTouchId) {
        resetAimJoystick();
        break;
      }
    }
  }, {passive: false});

  // Helper para chequear si el touch está dentro del joystick
  function isTouchInside(touch, container) {
    const rect = container.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  }

  function handleMoveJoystick(touch) {
    const dx = touch.clientX - moveCenter.x;
    const dy = touch.clientY - moveCenter.y;
    const maxDist = 50;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > maxDist) dist = maxDist;
    const angle = Math.atan2(dy, dx);
    const stickX = Math.cos(angle)*dist;
    const stickY = Math.sin(angle)*dist;
    joystickMoveStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    movePos.x = stickX / maxDist;
    movePos.y = stickY / maxDist;
    updatePlayerFromMoveJoystick();
  }

  function handleAimJoystick(touch) {
    const dx = touch.clientX - aimCenter.x;
    const dy = touch.clientY - aimCenter.y;
    const maxDist = 50;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > maxDist) dist = maxDist;
    const angle = Math.atan2(dy, dx);
    const stickX = Math.cos(angle)*dist;
    const stickY = Math.sin(angle)*dist;
    joystickAimStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    aimPos.x = stickX / maxDist;
    aimPos.y = stickY / maxDist;
    updatePointerFromAimJoystick();
  }

  // Teclado PC
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

  // Mouse apuntado y disparo
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

  // Touch apuntado y disparo (opcional, no afecta sticks)
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    pointer.x = touch.clientX - rect.left;
    pointer.y = touch.clientY - rect.top;
    pointer.down = true;
  }, {passive: false});
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    pointer.x = touch.clientX - rect.left;
    pointer.y = touch.clientY - rect.top;
  }, {passive: false});
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    pointer.down = false;
  }, {passive: false});

  // Botón pausa móvil
  btnPauseMobile.addEventListener('click', () => {
    if (gamePaused) resumeGame();
    else pauseGame();
  });

  // Spawn de enemigos (igual)
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

  // Spawn de power-ups morados que hacen los disparos más grandes
  function spawnPowerUp() {
    if (gamePaused || gameOver) return;
    const x = Math.random() * (canvas.width - 30) + 15;
    powerUps.push({ x, y: -20, size: 20, speed: 2 });
  }
  function startPowerUps() {
    powerUpInterval = setInterval(spawnPowerUp, 8000);
  }
  function stopPowerUps() {
    clearInterval(powerUpInterval);
  }

  function restartGame() {
    score = 0;
    gameOver = false;
    powerUpActive = false;
    bullets.length = 0;
    enemies.length = 0;
    powerUps.length = 0;
    pauseOverlay.style.visibility = 'hidden';
    pauseOverlay.firstElementChild.textContent = "Juego en pausa";
    document.getElementById('score').textContent = `Puntaje: ${score}`;
    gamePaused = false;
    startSpawning();
    startPowerUps();
    gameLoop();
  }

  function pauseGame() {
    gamePaused = true;
    pauseOverlay.style.visibility = 'visible';
    stopSpawning();
    stopPowerUps();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }

  function resumeGame() {
    if (gameOver) restartGame();
    else {
      gamePaused = false;
      pauseOverlay.style.visibility = 'hidden';
      startSpawning();
      startPowerUps();
      gameLoop();
    }
  }

  resumeBtn.addEventListener('click', resumeGame);

  // Disparo automático mientras pointer.down
  function shoot(time) {
    if (gamePaused || gameOver) return;
    if (time - lastShot > fireRate && pointer.down) {
      const dx = pointer.x - player.x;
      const dy = pointer.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 10;
      const size = powerUpActive ? 12 : 6; // disparo más grande si powerup activo
      bullets.push({
        x: player.x,
        y: player.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        size
      });
      lastShot = time;
    }
  }

  // Actualizar lógica del juego
  function update(time) {
    if (gamePaused || gameOver) return;

    // Mover jugador
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;
    player.x = Math.min(Math.max(player.x, player.size), canvas.width - player.size);

    // Mover balas
    for (let i = bullets.length -1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i,1);
    }

    // Mover enemigos
    for (let i = enemies.length -1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speed;
      if (e.y - e.size > canvas.height) enemies.splice(i,1);
    }

    // Mover power-ups
    for (let i = powerUps.length -1; i >= 0; i--) {
      const p = powerUps[i];
      p.y += p.speed;
      if (p.y - p.size > canvas.height) powerUps.splice(i,1);
    }

    // Chequear colisiones balas - enemigos
    for (let i = enemies.length -1; i >= 0; i--) {
      const e = enemies[i];
      for (let j = bullets.length -1; j >= 0; j--) {
        const b = bullets[j];
        const dist = Math.hypot(e.x - b.x, e.y - b.y);
        if (dist < e.size + b.size) {
          enemies.splice(i,1);
          bullets.splice(j,1);
          score++;
          document.getElementById('score').textContent = `Puntaje: ${score}`;
          break;
        }
      }
    }

    // Chequear colision jugador - enemigos
    for (const e of enemies) {
      const dist = Math.hypot(e.x - player.x, e.y - player.y);
      if (dist < e.size + player.size) {
        gameOver = true;
        pauseGame();
        pauseOverlay.firstElementChild.textContent = "Game Over! Haz perdido.";
        return;
      }
    }

    // Chequear colision jugador - powerUps
    for (let i = powerUps.length -1; i >= 0; i--) {
      const p = powerUps[i];
      const dist = Math.hypot(p.x - player.x, p.y - player.y);
      if (dist < p.size + player.size) {
        powerUps.splice(i,1);
        powerUpActive = true;
        powerUpEndTime = time + 10000; // dura 10 segundos
        break;
      }
    }

    // Controlar tiempo power-up
    if (powerUpActive && time > powerUpEndTime) {
      powerUpActive = false;
    }
  }

  // Dibujar el jugador con detalles como antes (guitarra, cabello, etc)
  function drawPlayer() {
    const p = player;

    // Cuerpo (círculo rojo oscuro)
    ctx.fillStyle = '#a22';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Guitarra (cuadrado pequeño y líneas)
    ctx.fillStyle = '#700';
    ctx.fillRect(p.x - 8, p.y - 5, 16, 10);
    ctx.strokeStyle = '#400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y);
    ctx.lineTo(p.x + 8, p.y);
    ctx.stroke();

    // Cabello (picos en la parte superior)
    ctx.fillStyle = '#d33';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(p.x + i * 5, p.y - p.size);
      ctx.lineTo(p.x + i * 5 + 5, p.y - p.size - 10);
      ctx.lineTo(p.x + i * 5 + 10, p.y - p.size);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Dibujar balas
  function drawBullets() {
    for (const b of bullets) {
      ctx.fillStyle = powerUpActive ? '#d9a0ff' : '#ff8';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dibujar enemigos (círculos rojos)
  function drawEnemies() {
    for (const e of enemies) {
      ctx.fillStyle = '#a22';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dibujar power-ups (círculos morados)
  function drawPowerUps() {
    for (const p of powerUps) {
      ctx.fillStyle = '#a0a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Loop principal
  let lastTime = 0;
  function gameLoop(time = 0) {
    if (gamePaused || gameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }
    animationFrameId = requestAnimationFrame(gameLoop);

    const delta = time - lastTime;
    lastTime = time;

    update(time);
    shoot(time);

    // Limpiar pantalla
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar elementos
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps();

    // Mostrar texto pausa en overlay si pausado o game over
    if (gamePaused) {
      pauseOverlay.style.visibility = 'visible';
    } else {
      pauseOverlay.style.visibility = 'hidden';
    }
  }

  // Ajustar canvas al tamaño de ventana
  function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth - 20, 600);
    canvas.height = Math.min(window.innerHeight * 0.6, 400);
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    initJoystickCenters();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Iniciar
  resizeCanvas();
  restartGame();
});
