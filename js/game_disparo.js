document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Jugador con posición y velocidad horizontal
  let player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    speed: 5,
    vx: 0,
  };

  // Puntero para apuntar (mouse o joystick derecho)
  let pointer = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false,
  };

  // Estado de teclas para movimiento
  let keys = { left: false, right: false };

  // Arrays para balas, enemigos y power-ups
  let bullets = [], enemies = [], powerUps = [];

  // Variables de juego
  let score = 0,
    lastShot = 0,
    fireRate = 200, // ms entre disparos
    gamePaused = false,
    gameOver = false,
    powerUpActive = false,
    powerUpTimeout = null,
    spawnInterval = null,
    animId = null;

  // Joystick IDs y centros (para multitouch)
  let moveTouchId = null, aimTouchId = null;
  let moveCenter = {}, aimCenter = {};

  // Elementos UI
  const pauseOverlay = document.getElementById('pauseOverlay');
  const resumeBtn = document.getElementById('resumeBtn');
  const btnPauseMobile = document.getElementById('btnPauseMobile');
  const joystickMove = document.getElementById('joystickMove');
  const joystickMoveStick = joystickMove.querySelector('.joystickStick');
  const joystickAim = document.getElementById('joystickAim');
  const joystickAimStick = joystickAim.querySelector('.joystickStick');

  // Inicializa centros de los joysticks
  function initJoystick() {
    const rm = joystickMove.getBoundingClientRect();
    const ra = joystickAim.getBoundingClientRect();
    moveCenter = { x: rm.left + rm.width / 2, y: rm.top + rm.height / 2 };
    aimCenter = { x: ra.left + ra.width / 2, y: ra.top + ra.height / 2 };
    resetMove();
    resetAim();
  }

  // Reset joystick movimiento
  function resetMove() {
    joystickMoveStick.style.transform = 'translate(0,0)';
    moveTouchId = null;
    keys.left = false;
    keys.right = false;
  }

  // Reset joystick apuntar
  function resetAim() {
    joystickAimStick.style.transform = 'translate(0,0)';
    aimTouchId = null;
    pointer.down = false;
  }

  // Chequea si un touch está dentro de un elemento
  function isInside(t, el) {
    const r = el.getBoundingClientRect();
    return (
      t.clientX >= r.left &&
      t.clientX <= r.right &&
      t.clientY >= r.top &&
      t.clientY <= r.bottom
    );
  }

  // Manejo de touchstart para joysticks
  function handleTouchStart(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (moveTouchId === null && isInside(t, joystickMove)) moveTouchId = t.identifier;
      else if (aimTouchId === null && isInside(t, joystickAim)) aimTouchId = t.identifier;
    }
    initJoystick();
  }

  // Manejo de touchmove para joysticks
  function handleTouchMove(e) {
    e.preventDefault();
    const maxD = joystickMove.clientWidth / 2;

    for (const t of e.changedTouches) {
      // Joystick movimiento
      if (t.identifier === moveTouchId) {
        const dx = t.clientX - moveCenter.x;
        const clampedX = Math.min(Math.max(dx, -maxD), maxD);
        joystickMoveStick.style.transform = `translateX(${clampedX}px)`;
        keys.left = clampedX < -maxD * 0.3;
        keys.right = clampedX > maxD * 0.3;
      }
      // Joystick apuntar
      if (t.identifier === aimTouchId) {
        const dx = t.clientX - aimCenter.x;
        const dy = t.clientY - aimCenter.y;
        const dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const clamped = Math.min(dist, maxD);
        const sx = Math.cos(ang) * clamped;
        const sy = Math.sin(ang) * clamped;
        joystickAimStick.style.transform = `translate(${sx}px,${sy}px)`;
        const normX = sx / maxD;
        const normY = sy / maxD;
        if (normX !== 0 || normY !== 0) {
          pointer.down = true;
          pointer.x = Math.min(Math.max(player.x + normX * canvas.width, 0), canvas.width);
          pointer.y = Math.min(Math.max(player.y + normY * canvas.height, 0), canvas.height);
        } else pointer.down = false;
      }
    }
  }

  // Manejo de touchend para joysticks
  function handleTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === moveTouchId) resetMove();
      if (t.identifier === aimTouchId) resetAim();
    }
  }

  // Mousemove para apuntar
  function handleMouse(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  }
  // Mouse down y up para disparar
  function handleMouseDown() {
    pointer.down = true;
  }
  function handleMouseUp() {
    pointer.down = false;
  }

  // Eventos
  joystickMove.addEventListener('touchstart', handleTouchStart, { passive: false });
  joystickMove.addEventListener('touchmove', handleTouchMove, { passive: false });
  joystickMove.addEventListener('touchend', handleTouchEnd, { passive: false });
  joystickMove.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  joystickAim.addEventListener('touchstart', handleTouchStart, { passive: false });
  joystickAim.addEventListener('touchmove', handleTouchMove, { passive: false });
  joystickAim.addEventListener('touchend', handleTouchEnd, { passive: false });
  joystickAim.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  window.addEventListener('keydown', e => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
    if (e.key.toLowerCase() === 'p') togglePause();
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
  });

  canvas.addEventListener('mousemove', handleMouse);
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);

  btnPauseMobile.addEventListener('click', togglePause);
  resumeBtn.addEventListener('click', togglePause);

  // Función para pausar/reanudar el juego
  function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
      pauseOverlay.style.visibility = 'visible';
      cancelAnimationFrame(animId);
      clearInterval(spawnInterval);
    } else {
      if (gameOver) location.reload();
      else {
        pauseOverlay.style.visibility = 'hidden';
        startGame();
      }
    }
  }

  // Crear enemigos
  function spawnEnemy() {
    if (gamePaused || gameOver) return;
    enemies.push({
      x: Math.random() * (canvas.width - 30) + 15,
      y: -20,
      size: 30,
      speed: 2 + Math.random() * 1.5,
    });
  }

  // Crear power-ups
  function spawnPowerUp() {
    if (gamePaused || gameOver) return;
    powerUps.push({
      x: Math.random() * (canvas.width - 30) + 15,
      y: -20,
      size: 20,
      speed: 2,
    });
  }

  // Activar power-up: balas más grandes 10s
  function activatePowerUp() {
    powerUpActive = true;
    document.getElementById('score').style.color = '#a2a';
    clearTimeout(powerUpTimeout);
    powerUpTimeout = setTimeout(() => {
      powerUpActive = false;
      document.getElementById('score').style.color = 'white';
    }, 10000);
  }

  // Iniciar juego
  function startGame() {
    initJoystick();
    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = setInterval(() => {
      spawnEnemy();
      if (Math.random() < 0.3) spawnPowerUp();
    }, 1000);
    animId = requestAnimationFrame(loop);
  }

  // Loop principal de juego
  function loop(time) {
    animId = requestAnimationFrame(loop);

    // Movimiento jugador con teclado o joystick
    if (!moveTouchId) {
      if (keys.left) player.vx = -player.speed;
      else if (keys.right) player.vx = player.speed;
      else player.vx = 0;
    } else {
      if (keys.left) player.vx = -player.speed;
      else if (keys.right) player.vx = player.speed;
      else player.vx = 0;
    }
    player.x += player.vx;
    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));

    // Disparo automático si el puntero está activo y no pausado
    if (time - lastShot > fireRate && pointer.down && !gamePaused && !gameOver) {
      bullets.push({
        x: player.x,
        y: player.y - 15,
        size: powerUpActive ? 14 : 6,
        speed: 8,
        angle: Math.atan2(pointer.y - player.y, pointer.x - player.x),
      });
      lastShot = time;
    }

    // Actualizar balas
    bullets = bullets.filter(b => {
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      return b.x >= 0 && b.x <= canvas.width && b.y >= 0 && b.y <= canvas.height;
    });

    // Actualizar enemigos
    enemies = enemies.filter(e => {
      e.y += e.speed;
      // Colisión con jugador: pierde juego
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < e.size + 20) {
        gameOver = true;
        togglePause();
        document.getElementById('pauseText').innerText = `¡Perdiste! Puntos: ${score}`;
        return false;
      }
      // Si enemigo pasa la pantalla, descuenta un punto
      if (e.y > canvas.height + e.size) {
        score = Math.max(0, score - 1);
        document.getElementById('score').innerText = `Puntaje: ${score}`;
        return false;
      }
      return true;
    });

    // Actualizar power-ups
    powerUps = powerUps.filter(p => {
      p.y += p.speed;
      const d = Math.hypot(p.x - player.x, p.y - player.y);
      if (d < p.size + 20) {
        activatePowerUp();
        return false;
      }
      return p.y <= canvas.height + p.size;
    });

    // Colisión balas-enemigos
    enemies.forEach((e, ei) => {
      bullets.forEach((b, bi) => {
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.size + b.size) {
          enemies.splice(ei, 1);
          bullets.splice(bi, 1);
          score++;
          document.getElementById('score').innerText = `Puntaje: ${score}`;
        }
      });
    });

    // Dibujar todo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja jugador
    drawPlayer();

    // Dibuja balas
    bullets.forEach(b => {
      ctx.fillStyle = '#f33';
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.size, b.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dibuja power-ups (circulo morado con cruz)
    powerUps.forEach(p => {
      ctx.fillStyle = '#a2a';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size / 2);
      ctx.lineTo(p.x, p.y + p.size / 2);
      ctx.moveTo(p.x - p.size / 2, p.y);
      ctx.lineTo(p.x + p.size / 2, p.y);
      ctx.stroke();
    });

    // Dibuja enemigos (cuadrados con cruz)
    enemies.forEach(e => {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.size, e.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(e.x - e.size / 2, e.y);
      ctx.lineTo(e.x + e.size / 2, e.y);
      ctx.moveTo(e.x, e.y - e.size / 2);
      ctx.lineTo(e.x, e.y + e.size / 2);
      ctx.stroke();
    });

    // Función que dibuja el jugador metalero con guitarra y cabello
    function drawPlayer() {
      const px = player.x;
      const py = player.y;

      // Cuerpo
      ctx.fillStyle = '#222';
      ctx.strokeStyle = '#a22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(px, py, 20, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeza
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.ellipse(px, py - 45, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ojos (emociones)
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.ellipse(px - 6, py - 50, 4, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(px + 6, py - 50, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.ellipse(px - 6, py - 50, 2, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(px + 6, py - 50, 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boca - metalera 😎
      ctx.strokeStyle = '#a22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 8, py - 35);
      ctx.lineTo(px + 8, py - 35);
      ctx.stroke();

      // Cabello
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(px - 15, py - 65);
      ctx.lineTo(px - 5, py - 90);
      ctx.lineTo(px, py - 70);
      ctx.lineTo(px + 5, py - 90);
      ctx.lineTo(px + 15, py - 65);
      ctx.closePath();
      ctx.fill();

      // Guitarra (arma)
      ctx.fillStyle = '#a22';
      ctx.strokeStyle = '#700';
      ctx.lineWidth = 3;
      // mástil
      ctx.beginPath();
      ctx.moveTo(px + 10, py - 15);
      ctx.lineTo(px + 40, py - 35);
      ctx.lineTo(px + 45, py - 25);
      ctx.lineTo(px + 15, py - 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // cuerpo guitarra
      ctx.beginPath();
      ctx.ellipse(px + 30, py - 20, 15, 25, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Disparar puntero (línea roja)
      ctx.strokeStyle = '#f33';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py - 15);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
    }

  }

  startGame();
});
