document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('game'),
    ctx = canvas.getContext('2d');

  // Jugador con posición y velocidad
  let player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    speed: 5,
    vx: 0,
  };

  // Puntero para apuntar disparos
  let pointer = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false,
  };

  // Estado de teclas
  let keys = {
    left: false,
    right: false,
  };

  // Arrays para balas, enemigos y powerups
  let bullets = [],
    enemies = [],
    powerUps = [];

  // Variables de juego
  let score = 0,
    lastShot = 0,
    fireRate = 200,
    gamePaused = false,
    gameOver = false,
    powerUpActive = false,
    powerUpTimeout = null,
    spawnInterval = null,
    animId = null,
    moveTouchId = null,
    aimTouchId = null,
    moveCenter = {},
    aimCenter = {};

  // Elementos UI
  const pauseOverlay = document.getElementById('pauseOverlay'),
    pauseText = document.getElementById('pauseText'),
    resumeBtn = document.getElementById('resumeBtn'),
    btnPauseMobile = document.getElementById('btnPauseMobile'),
    joystickMove = document.getElementById('joystickMove'),
    joystickMoveStick = joystickMove.querySelector('.joystickStick'),
    joystickAim = document.getElementById('joystickAim'),
    joystickAimStick = joystickAim.querySelector('.joystickStick');

  // Inicializar posición central de joysticks
  function initJoystick() {
    const rm = joystickMove.getBoundingClientRect(),
      ra = joystickAim.getBoundingClientRect();
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

  // Verifica si un touch está dentro del joystick
  function isInside(t, el) {
    const r = el.getBoundingClientRect();
    return (
      t.clientX >= r.left &&
      t.clientX <= r.right &&
      t.clientY >= r.top &&
      t.clientY <= r.bottom
    );
  }

  // Manejador touch start para joysticks
  function handleTouchStart(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (moveTouchId === null && isInside(t, joystickMove)) moveTouchId = t.identifier;
      if (aimTouchId === null && isInside(t, joystickAim)) aimTouchId = t.identifier;
    }
    initJoystick();
  }

  // Manejador touch move para joysticks
  function handleTouchMove(e) {
    e.preventDefault();
    const maxD = joystickMove.clientWidth / 2;
    for (const t of e.changedTouches) {
      if (t.identifier === moveTouchId) {
        const dx = t.clientX - moveCenter.x,
          dy = t.clientY - moveCenter.y,
          dist = Math.hypot(dx, dy),
          ang = Math.atan2(dy, dx),
          clamped = Math.min(dist, maxD),
          sx = Math.cos(ang) * clamped,
          sy = Math.sin(ang) * clamped;
        joystickMoveStick.style.transform = `translate(${sx}px,${sy}px)`;
        keys.left = sx / maxD < -0.3;
        keys.right = sx / maxD > 0.3;
      }
      if (t.identifier === aimTouchId) {
        const dx = t.clientX - aimCenter.x,
          dy = t.clientY - aimCenter.y,
          dist = Math.hypot(dx, dy),
          ang = Math.atan2(dy, dx),
          clamped = Math.min(dist, maxD),
          sx = Math.cos(ang) * clamped,
          sy = Math.sin(ang) * clamped;
        joystickAimStick.style.transform = `translate(${sx}px,${sy}px)`;
        const normX = sx / maxD,
          normY = sy / maxD;
        if (normX || normY) {
          pointer.down = true;
          pointer.x = Math.min(Math.max(player.x + normX * canvas.width, 0), canvas.width);
          pointer.y = Math.min(Math.max(player.y + normY * canvas.height, 0), canvas.height);
        } else pointer.down = false;
      }
    }
  }

  // Manejador touch end para joysticks
  function handleTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === moveTouchId) resetMove();
      if (t.identifier === aimTouchId) resetAim();
    }
  }

  // Manejador mousemove para apuntar
  function handleMouse(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
    if (e.key.toLowerCase() === 'p') togglePause();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
  });

  canvas.addEventListener('mousemove', handleMouse);
  canvas.addEventListener('mousedown', () => (pointer.down = true));
  canvas.addEventListener('mouseup', () => (pointer.down = false));

  btnPauseMobile.addEventListener('click', togglePause);

  // Pausar y reanudar
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
  resumeBtn.addEventListener('click', togglePause);

  // Crear enemigo
  function spawnEnemy() {
    if (gamePaused || gameOver) return;
    enemies.push({
      x: Math.random() * (canvas.width - 30) + 15,
      y: -20,
      size: 30,
      speed: 2 + Math.random() * 1.5,
    });
  }

  // Crear powerup
  function spawnPowerUp() {
    if (gamePaused || gameOver) return;
    powerUps.push({
      x: Math.random() * (canvas.width - 30) + 15,
      y: -20,
      size: 20,
      speed: 2,
    });
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

  // Activar powerup
  function activatePowerUp() {
    powerUpActive = true;
    document.getElementById('score').style.color = '#a2a';
    clearTimeout(powerUpTimeout);
    powerUpTimeout = setTimeout(() => {
      powerUpActive = false;
      document.getElementById('score').style.color = 'white';
    }, 10000);
  }

  // Loop principal
  function loop(time) {
    animId = requestAnimationFrame(loop);

    // Control teclado si no hay joystick activo
    if (moveTouchId === null) {
      if (keys.left) player.vx = -player.speed;
      else if (keys.right) player.vx = player.speed;
      else player.vx = 0;
    }
    player.x += player.vx;
    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));

    // Disparo automático
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
    bullets = bullets.filter((b) => {
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      return b.x >= 0 && b.x <= canvas.width && b.y >= 0 && b.y <= canvas.height;
    });

    // Actualizar enemigos
    enemies = enemies.filter((e) => {
      e.y += e.speed;
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < e.size + 20) {
        gameOver = true;
        togglePause();
        document.getElementById('pauseText').innerText = `¡Perdiste! Puntos: ${score}`;
        return false;
      }
      if (e.y > canvas.height + e.size) {
        score = Math.max(0, score - 1);
        document.getElementById('score').innerText = `Puntaje: ${score}`;
        return false;
      }
      return true;
    });

    // Actualizar power-ups
    powerUps = powerUps.filter((p) => {
      p.y += p.speed;
      const d = Math.hypot(p.x - player.x, p.y - player.y);
      if (d < p.size + 20) {
        activatePowerUp();
        return false;
      }
      return p.y <= canvas.height + p.size;
    });

    // Colisiones balas-enemigos
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
    drawPlayer();
    bullets.forEach((b) => {
      ctx.fillStyle = '#f33';
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.size, b.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    powerUps.forEach((p) => {
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
    enemies.forEach((e) => {
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

    // Dibujar jugador (metalero con guitarra y cabello)
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

      // Disparar puntero
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
