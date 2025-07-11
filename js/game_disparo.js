document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  document.getElementById('exitBtn').addEventListener('click', () => {
    window.location.href = '/index.html';
  });

  //sonido de fondo
  const backgroundMusic = new Audio('backgraund/space-sound-109576.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;

  // Cargar sonido de disparo
  const shootSound = new Audio('backgraund/laser-shot-.mp3');
  shootSound.volume = 0.5;  // volumen ajustable

  // Cargar sonido de power-up
  const powerUpSound = new Audio('backgraund/laser-zap-90575.mp3');
  powerUpSound.volume = 0.5;  // podés ajustar volumen



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
  const explosions = [];


  let score = 0;
  let lastShot = 0;
  const fireRate = 200;

  let soundEnabled = true;
  let gamePaused = false;
  let animationFrameId = null;
  let spawnInterval = null;
  let powerUpInterval = null;
  let gameOver = false;
  let bestScore = localStorage.getItem('bestScore') || 0;
  bestScore = Number(bestScore);


  let powerUpActive = false;
  let powerUpEndTime = 0;

  // Pausa, botones y sticks
  const pauseOverlay = document.getElementById('pauseOverlay');
  const resumeBtn = document.getElementById('resumeBtn');
  const btnPauseMobile = document.getElementById('btnPauseMobile');
  const restartBtn = document.getElementById('restartBtn');

  // Botón para activar/desactivar sonido
  const toggleSoundBtn = document.getElementById('toggleSoundBtn');
  toggleSoundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundButton();
    if (soundEnabled) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  });



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

 

  function playSound(sound) {
    if (!soundEnabled) return;
    sound.currentTime = 0;
    sound.play();
  }

  function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
      explosions.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`
      });
    }
  }



  // Mostrar puntaje en pantalla
  function updateScoreDisplay() {
    const scoreDiv = document.getElementById('score');
    if (scoreDiv) {
      scoreDiv.textContent = `Puntaje: ${score} | Mejor: ${bestScore}`;
    }
  }


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
  if (e.button === 0) {
    pointer.down = true;

    // Activar música si está activado el sonido y aún no se ha reproducido
    if (soundEnabled && backgroundMusic.paused) {
      backgroundMusic.play().catch(err => {
        console.log('El navegador bloqueó la reproducción automática:', err);
      });
    }
  }
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
    pauseOverlay.firstElementChild.textContent = "Menu de pausa Rey";
    updateScoreDisplay();
    gamePaused = false;
    startSpawning();
    startPowerUps();
    gameLoop();
    if (soundEnabled) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(() => {
        console.log('Audio bloqueado hasta una interacción del usuario.');
      });
    }
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
  restartBtn.addEventListener('click', () => {
    restartGame();
  });



  resumeBtn.addEventListener('click', resumeGame);

  function updateSoundButton() {
    if (toggleSoundBtn) {
      toggleSoundBtn.textContent = soundEnabled ? 'Sonido: ON 🔊' : 'Sonido: OFF 🔇';
    }
  }


  // Disparo automático mientras pointer.down
  function shoot(time) {
    if (gamePaused || gameOver) return;

    if (time - lastShot > fireRate && pointer.down) {
      const dx = pointer.x - player.x;
      const dy = pointer.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 10;
      const size = powerUpActive ? 12 : 6;

      bullets.push({
        x: player.x,
        y: player.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        size
      });

      // ✅ Elegir el sonido según si hay power-up
      if (soundEnabled) {
        if (powerUpActive) {
          powerUpSound.currentTime = 0;
          powerUpSound.play();
        } else {
          shootSound.currentTime = 0;
          shootSound.play();
        }
      }

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
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
    }

    // Mover enemigos
    // Mover enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speed;
      if (e.y - e.size > canvas.height) {
        enemies.splice(i, 1);
        score -= 1; // Resta 1 punto, puede ser negativo
        updateScoreDisplay(); // Actualiza en pantalla
      }
    }


    // Mover power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const p = powerUps[i];
      p.y += p.speed;
      if (p.y - p.size > canvas.height) powerUps.splice(i, 1);
    }

    // Chequear colisiones balas - enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const dist = Math.hypot(e.x - b.x, e.y - b.y);
        if (dist < e.size + b.size) {
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score++;
          createExplosion(e.x, e.y);
          if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
          }
          updateScoreDisplay();

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
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const p = powerUps[i];
      const dist = Math.hypot(p.x - player.x, p.y - player.y);
      if (dist < p.size + player.size) {
        powerUps.splice(i, 1);
        powerUpActive = true;
        powerUpEndTime = time + 10000; // dura 10 segundos

        powerUpSound.currentTime = 0;
        powerUpSound.play();

        break;
      }
    }



    // Controlar tiempo power-up
    if (powerUpActive && time > powerUpEndTime) {
      powerUpActive = false;
    }

    // Actualizar explosiones
    for (let i = explosions.length - 1; i >= 0; i--) {
      const p = explosions[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) explosions.splice(i, 1);
    }

  }

  // Dibujar el jugador con detalles como antes (guitarra, cabello, etc)
  function drawPlayer() {
    const p = player;

    // Calcular ángulo entre jugador y puntero (donde apunta)
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const angle = Math.atan2(dy, dx);

    ctx.save();

    // Mover el origen al centro del jugador
    ctx.translate(p.x, p.y);
    // Rotar el canvas según el ángulo calculado
    ctx.rotate(angle);

    // Dibujar la nave centrada en (0,0) porque ya trasladamos el contexto
    // Cuerpo nave
    ctx.fillStyle = '#3b82f6'; // azul
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-20, -15);
    ctx.lineTo(-20, 15);
    ctx.closePath();
    ctx.fill();

    // Propulsor animado (puede usar un contador global o timestamp para animar)
    const time = Date.now() * 0.01;
    const flameHeight = 10 + Math.sin(time) * 5;

    ctx.fillStyle = '#ff4500'; // naranja
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-20 - flameHeight, 8);
    ctx.lineTo(-20 - flameHeight, -8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }




  // Dibujar balas
  function drawBullets() {
    for (const b of bullets) {
      // Color según powerUp activo
      ctx.fillStyle = powerUpActive ? '#d9a0ff' : '#ff8';

      // Dibujar círculo principal
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();

      // Agregar un pequeño resplandor alrededor (halo)
      const gradient = ctx.createRadialGradient(b.x, b.y, b.size * 0.5, b.x, b.y, b.size * 2);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.7)');
      gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawExplosions() {
    for (const p of explosions) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 30;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }


  // Dibujar enemigos (círculos rojos)

  function drawEnemy(enemy, time) {
    const oscillation = Math.sin(time / 300) * 5; // movimiento flotante

    const x = enemy.x;
    const y = enemy.y + oscillation;
    const size = enemy.size;

    // Base del platillo (óvalo)
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 1.5, size, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cúpula (semi círculo transparente)
    ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.5, size * 1.2, size * 0.8, 0, 0, Math.PI, true);
    ctx.fill();

    // Luz central parpadeante
    const lightAlpha = 0.5 + 0.5 * Math.sin(time / 100);
    ctx.fillStyle = `rgba(255, 255, 0, ${lightAlpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Opcional: borde negro para definición
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 1.5, size, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.5, size * 1.2, size * 0.8, 0, 0, Math.PI, true);
    ctx.stroke();
  }

  function drawEnemies(time) {
    for (const e of enemies) {
      drawEnemy(e, time);
    }
  }


  // Dibujar power-ups (círculos morados)
  function drawPowerUp(powerUp, time) {
    const x = powerUp.x;
    const y = powerUp.y;
    const size = powerUp.size;
    const pulse = 0.5 + 0.5 * Math.sin(time / 200);
    const rotation = time / 300;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Halo brillante
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 0, ${0.2 * pulse})`;
    ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Estrella (5 puntas)
    ctx.beginPath();
    ctx.moveTo(0, -size);
    for (let i = 1; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? size : size / 2;
      ctx.lineTo(Math.sin(angle) * radius, -Math.cos(angle) * radius);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 215, 0, 1)`; // dorado brillante
    ctx.fill();
    ctx.restore();
  }


  function drawPowerUps() {
    for (const p of powerUps) {
      drawPowerUp(p, performance.now());
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
    drawPlayer(time);
    drawBullets();
    drawEnemies(time);
    drawPowerUps();
    drawExplosions();

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
