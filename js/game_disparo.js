document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Jugador
  const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    speed: 5,
    vx: 0
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

  let score = 0;
  let lastShot = 0;
  const fireRate = 200;

  let gamePaused = false;
  let animationFrameId = null;
  let spawnInterval = null;
  let gameOver = false;

  const pauseOverlay = document.getElementById('pauseOverlay');
  const resumeBtn = document.getElementById('resumeBtn');
  const btnPauseMobile = document.getElementById('btnPauseMobile');

  // Joystick apuntado (stick derecho)
  const joystickAim = document.getElementById('joystickAim');
  const joystickAimStick = joystickAim.querySelector('.joystickStick');

  // Variables joystick apuntado multitouch
  let aimTouchId = null;
  let aimCenter = { x: 0, y: 0 };
  let aimPos = { x: 0, y: 0 };

  // Inicializar centro joystick apuntado
  function initAimJoystickCenter() {
    const rectAim = joystickAim.getBoundingClientRect();
    aimCenter.x = rectAim.left + rectAim.width / 2;
    aimCenter.y = rectAim.top + rectAim.height / 2;
    resetAimJoystick();
  }

  // Reset joystick apuntado
  function resetAimJoystick() {
    joystickAimStick.style.transform = 'translate(0px, 0px)';
    aimPos.x = 0;
    aimPos.y = 0;
    pointer.down = false;
    aimTouchId = null;
  }

  // Actualizar puntero según aimPos
  function updatePointerFromAimJoystick() {
    if (aimPos.x === 0 && aimPos.y === 0) {
      pointer.down = false; // no apunta ni dispara si no movió joystick
      return;
    }
    pointer.down = true;
    pointer.x = player.x + aimPos.x * 100;
    pointer.y = player.y + aimPos.y * 100;
    pointer.x = Math.min(Math.max(pointer.x, 0), canvas.width);
    pointer.y = Math.min(Math.max(pointer.y, 0), canvas.height);
  }

  // Helper para saber si un touch está dentro del contenedor joystick
  function isTouchInside(touch, container) {
    const rect = container.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  }

  // Manejo multitouch para joystick apuntado
  joystickAim.addEventListener('touchstart', e => {
    e.preventDefault();
    initAimJoystickCenter();
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

  function handleAimJoystick(touch) {
    const dx = touch.clientX - aimCenter.x;
    const dy = touch.clientY - aimCenter.y;
    const maxDist = joystickAim.clientWidth / 2; // 55 o 45 segun CSS
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

  // Teclado PC para mover y pausar
  window.addEventListener('keydown', e => {
    if (e.repeat) return; // no repetir al mantener apretada

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

  // Touch canvas para disparar apuntado (opcional)
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

  // Botón pausa
  btnPauseMobile.addEventListener('click', () => {
    if (gamePaused) resumeGame();
    else pauseGame();
  });

  // Lógica de juego
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

  function restartGame() {
    score = 0;
    gameOver = false;
    bullets.length = 0;
    enemies.length = 0;
    pauseOverlay.style.visibility = 'hidden';
    pauseOverlay.firstElementChild.textContent = "Juego en pausa";
    document.getElementById('score').textContent = `Puntaje: ${score}`;
    gamePaused = false;
    startSpawning();
    gameLoop();
  }

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

  // Disparo automático mientras pointer.down
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

  function updatePlayer() {
    if (keys.left) player.vx = -player.speed;
    else if (keys.right) player.vx = player.speed;
    else player.vx = 0;

    player.x += player.vx;
    player.x = Math.min(Math.max(player.x, 20), canvas.width - 20);
  }

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

  // Actualizar enemigos, restar 1 punto si se escapan, y detectar colisión con jugador
  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speed;

      // Colisión con jugador - game over
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < e.size + 20) {
        gameOver = true;
        pauseGame();
        pauseOverlay.firstElementChild.textContent = "¡Perdiste! Puntos: " + score;
        return;
      }

      // Enemigo pasa abajo -> pierde punto
      if (e.y > canvas.height + e.size) {
        enemies.splice(i, 1);
        score = Math.max(0, score - 1);
        document.getElementById('score').textContent = `Puntaje: ${score}`;
      }
    }
  }

  // Detectar colisión balas - enemigos, aumentar puntos
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

  // Dibujar jugador metálico con guitarra y cabello
  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Cuerpo
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(0, -45, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ojos blancos
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(-6, -48, 5, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -48, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas negras mirando puntero
    let eyeDirX = pointer.x - player.x;
    let eyeDirY = pointer.y - (player.y - 48);
    let eyeAngle = Math.atan2(eyeDirY, eyeDirX);
    let pupilOffsetX = Math.cos(eyeAngle) * 2;
    let pupilOffsetY = Math.sin(eyeAngle) * 2;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(-6 + pupilOffsetX, -48 + pupilOffsetY, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(6 + pupilOffsetX, -48 + pupilOffsetY, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boca sonriente
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -33);
    ctx.quadraticCurveTo(0, -25, 6, -33);
    ctx.stroke();

    // Cabello largo y negro (metalero)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-18, -60);
    ctx.bezierCurveTo(-12, -90, 12, -90, 18, -60);
    ctx.lineTo(18, -40);
    ctx.bezierCurveTo(12, -70, -12, -70, -18, -40);
    ctx.closePath();
    ctx.fill();

    // Sombrero (gorro de lana negro)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, -70, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Guitarra (arma)
    ctx.strokeStyle = '#a22';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Cuerpo guitarra
    ctx.beginPath();
    ctx.moveTo(5, -15);
    ctx.lineTo(40, 0);
    ctx.lineTo(5, 20);
    ctx.closePath();
    ctx.fillStyle = '#800';
    ctx.fill();
    ctx.stroke();

    // Mango guitarra
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(65, -10);
    ctx.lineTo(65, 10);
    ctx.lineTo(40, 0);
    ctx.stroke();

    // Cuerdas guitarra
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(40 + i * 5, -10);
      ctx.lineTo(40 + i * 5, 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Dibujar balas
  function drawBullets() {
    ctx.fillStyle = '#f33';
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.size, b.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Dibujar enemigos rojos
  function drawEnemies() {
    ctx.fillStyle = '#f00';
    enemies.forEach(e => {
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.size, e.size, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Limpiar pantalla
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Loop principal juego
  function gameLoop(time = 0) {
    if (gamePaused) return;

    clear();

    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();
    shoot(time);

    drawPlayer();
    drawBullets();
    drawEnemies();

    if (!gameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // Inicio
  restartGame();
  initAimJoystickCenter();
  window.addEventListener('resize', initAimJoystickCenter);
});
