import React, { useRef, useEffect, useState, memo } from 'react';
import gsap from 'gsap';

import gameOver from './images/game_over.png';
import cloud_1 from './images/cloud_1.svg';
import cloud_2 from './images/cloud_2.svg';
import zombieImg from './images/zombie.png';
import bobImg from './images/bob.png';
import shotgunImg from './images/shotgun.png';
import background1 from './images/background_1.png';
import background2 from './images/background_2.png';
import background3 from './images/background_3.png';
import jump from './sounds/jump.wav';
import fire from './sounds/fire.wav';
import reload from './sounds/reload.wav';
import eaten from './sounds/gameover.wav';
import wind from './sounds/wind.mp3';
import cheat from './sounds/cheat.mp3';

let canvasWidth;
let canvasHeight;
let isPlaying = true;
let ghostMode = false;
let taps = 0;
let speed = 1;
let scoreId;
let cloudId;
let gunsId;
let bullets = 0;
const MAX_SNOW = 40;
const MAX_FLY = 10;
const MAX_CLOUDS = 3;
const FRICTION = 0.98;
const CLOUD = [cloud_1, cloud_2];

let jumpSound = new Audio(jump);
let fireSound = new Audio(fire);
let reloadSound = new Audio(reload);
let eatenSound = new Audio(eaten);
let cheatSound = new Audio(cheat);
let windSound = new Audio();

class Character {
  constructor(x, y, context) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: 0,
      y: -2,
    };
    this.context = context;
  }
}

class Bob extends Character {
  constructor(x, y, context) {
    super(x, y, context);
    this.width = 60;
    this.height = 98;
    this.grounded = false;
    this.img = new Image();
    this.gunImg = new Image();
    this.equipped = false;
    this.img.src = bobImg;
    this.gunImg.src = shotgunImg;
  }

  addGravity(weight) {
    this.position.y = this.position.y - this.velocity.y;

    if (this.grounded === false) {
      this.velocity.y = this.velocity.y - weight;
    }

    //Stop falling when ground is reached
    if (this.position.y + this.height >= canvasHeight) {
      this.velocity.y = 0;
      this.grounded = true;
    }
  }

  draw() {
    this.context.current.drawImage(
      this.img,
      this.position.x,
      this.position.y,
      60,
      98
    );

    if (this.equipped) {
      this.context.current.drawImage(
        this.gunImg,
        this.position.x + 10,
        this.position.y + this.height / 2,
        57,
        31
      );
    }

    //Collider for debug...
    //this.context.current.strokeStyle = "white";
    //this.context.current.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }

  jump() {
    if (this.grounded === true) {
      this.velocity.y = 13;
      this.grounded = false;
    }
  }
}

class Zombie extends Character {
  constructor(x, y, context) {
    super(x, y, context);

    this.velocity = {
      x: -4,
      y: 0,
    };
    this.width = 70;
    this.height = 100;
    this.img = new Image();
    this.img.src = zombieImg;
  }

  draw() {
    this.context.current.drawImage(this.img, this.position.x, this.position.y);

    //Collider for debugging...
    //this.context.current.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }

  move() {
    this.position.x = this.position.x + this.velocity.x * speed;
  }
}

class Background {
  constructor(img, speedModifier, context) {
    this.img = img;
    this.context = context;
    this.x = 0;
    this.width = 1600;
    this.height = 203;
    this.x2 = this.width;
    this.speedModifier = speedModifier;
    this.speed = speed * this.speedModifier;
    this.y = canvasHeight - this.height;
  }

  draw() {
    this.context.current.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    );
    this.context.current.drawImage(
      this.img,
      this.x2,
      this.y,
      this.width,
      this.height
    );
  }

  update() {
    this.speed = speed * this.speedModifier;
    if (this.x <= -this.width) {
      this.x = this.width + this.x2 - this.speed;
    }
    if (this.x2 <= -this.width) {
      this.x2 = this.width + this.x - this.speed;
    }
    this.x = Math.floor(this.x - this.speed);
    this.x2 = Math.floor(this.x2 - this.speed);
  }
}

class Gun {
  constructor(context) {
    this.position = {
      x: canvasWidth,
      y: canvasHeight - 300,
    };
    this.velocity = {
      x: -3,
      y: 0,
    };
    this.width = 47;
    this.height = 21;
    this.img = new Image();
    this.img.src = shotgunImg;
    this.context = context;
  }

  draw() {
    this.context.current.drawImage(
      this.img,
      this.position.x,
      this.position.y,
      47,
      21
    );
  }

  move() {
    this.position.x = this.position.x + this.velocity.x * speed;
  }
}

class Projectile {
  constructor(x, y, context) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.size = 2;
    this.context = context;
  }

  draw() {
    this.context.current.beginPath();
    this.context.current.fillStyle = 'red';
    this.context.current.arc(
      this.position.x,
      this.position.y,
      this.size,
      0,
      Math.PI * 2,
      false
    );
    this.context.current.fill();
  }

  fire() {
    this.velocity.x = 7;
    this.position.x = this.position.x + this.velocity.x;
  }
}

class Particle {
  constructor(x, y, radius, color, context) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: (Math.random() - 0.5) * (Math.random() * 6),
      y: (Math.random() - 0.5) * (Math.random() * 6),
    };
    this.alpha = 1;
    this.radius = radius;
    this.color = color;
    this.context = context;
  }

  draw() {
    this.context.current.save();
    this.context.current.globalAlpha = this.alpha;
    this.context.current.beginPath();
    this.context.current.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    this.context.current.fillStyle = this.color;
    this.context.current.fill();
    this.context.current.restore();
  }

  move() {
    this.velocity.x = this.velocity.x * FRICTION;
    this.velocity.y = this.velocity.y * FRICTION;
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
    this.alpha = this.alpha - 0.01;
  }
}

class Cloud {
  constructor(context) {
    this.context = context;
    this.position = {
      x: canvasWidth,
      y: getRandomNumber(50, canvasHeight / 2 - 30),
    };

    this.velocity = {
      x: getRandomNumber(-0.1, -0.3),
      y: 0,
    };
    this.img = new Image();
    this.img.src = CLOUD[Math.round(Math.random())];
  }

  move() {
    this.position.x = this.position.x + this.velocity.x * speed;
  }

  draw() {
    this.context.current.drawImage(this.img, this.position.x, this.position.y);
  }
}

class SnowFlake {
  constructor(context) {
    this.SNOW_XSPEED_RANGE = [-1, 0];
    this.SNOW_YSPEED_RANGE = [0.3, 0.5];
    this.SNOW_SIZE_RANGE = [1, 3];
    this.SNOW_LIFESPAN_RANGE = [75, 150];

    this.context = context;
    this.x = getRandomNumber(0, canvasWidth);
    this.y = getRandomNumber(0, canvasHeight);
    this.xSpeed = getRandomNumber(
      this.SNOW_XSPEED_RANGE[0],
      this.SNOW_XSPEED_RANGE[1]
    );
    this.ySpeed = getRandomNumber(
      this.SNOW_YSPEED_RANGE[0],
      this.SNOW_YSPEED_RANGE[1]
    );
    this.size = getRandomNumber(
      this.SNOW_SIZE_RANGE[0],
      this.SNOW_SIZE_RANGE[1]
    );
    this.lifeSpan = getRandomNumber(
      this.SNOW_LIFESPAN_RANGE[0],
      this.SNOW_LIFESPAN_RANGE[1]
    );
    this.age = 0;
    this.color = {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 0,
    };
  }

  moveSnow() {
    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;
    this.age = this.age + 1;

    if (this.age < this.lifeSpan / 2) {
      this.color.alpha += 1 / (this.lifeSpan / 2);

      if (this.color.alpha > 1) {
        this.color.alpha = 1;
      }
    } else {
      this.color.alpha -= 1 / (this.lifeSpan / 2);

      if (this.color.alpha < 0) {
        this.color.alpha = 0;
      }
    }
  }

  draw() {
    this.context.current.beginPath();
    this.context.current.fillStyle =
      'rgba(' +
      this.color.red +
      ', ' +
      this.color.green +
      ', ' +
      this.color.blue +
      ', ' +
      this.color.alpha +
      ')';
    this.context.current.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.context.current.fill();
  }
}

class Firefly {
  constructor(context) {
    this.FLY_XSPEED_RANGE = [-0.3, 0.3];
    this.FLY_YSPEED_RANGE = [-0.3, 0.1];
    this.FLY_SIZE_RANGE = [0.6, 1.5];
    this.FLY_LIFESPAN_RANGE = [140, 440];

    this.context = context;
    this.x = getRandomNumber(0, canvasWidth);
    this.y = getRandomNumber(canvasHeight / 2, canvasHeight);
    this.xSpeed = getRandomNumber(
      this.FLY_XSPEED_RANGE[0],
      this.FLY_XSPEED_RANGE[1]
    );
    this.ySpeed = getRandomNumber(
      this.FLY_YSPEED_RANGE[0],
      this.FLY_YSPEED_RANGE[1]
    );
    this.size = getRandomNumber(this.FLY_SIZE_RANGE[0], this.FLY_SIZE_RANGE[1]);
    this.lifeSpan = getRandomNumber(
      this.FLY_LIFESPAN_RANGE[0],
      this.FLY_LIFESPAN_RANGE[1]
    );
    this.age = 0;
    this.color = {
      hue: 290,
      saturation: 100,
      lightness: 50,
    };
  }

  move() {
    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;
    this.age = this.age + 1;
  }

  draw() {
    this.context.current.beginPath();
    this.context.current.fillStyle = `hsl(${this.color.hue}, ${this.color.saturation}%, ${this.color.lightness}%)`;
    this.context.current.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.context.current.fill();
  }
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function Game({ handleGameOver }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const scoreBarRef = useRef(null);
  const [score, setScore] = useState(1);
  const [gameover, setIsGameover] = useState(false);
  let bulletImg = new Image();
  bulletImg.src = shotgunImg;

  let backgroundImg_1 = new Image();
  let backgroundImg_2 = new Image();
  let backgroundImg_3 = new Image();
  backgroundImg_1.src = background1;
  backgroundImg_2.src = background2;
  backgroundImg_3.src = background3;

  let animationId;
  let char;

  let zombies = [];
  let snowFlakes = [];
  let fireflies = [];
  let clouds = [];
  let particles = [];
  let guns = [];
  let projectiles = [];
  let backgrounds = [];

  spawnEnemies();

  function createSnow() {
    if (snowFlakes.length < MAX_SNOW) {
      snowFlakes.push(new SnowFlake(contextRef));
    }
  }

  function createFlies() {
    if (fireflies.length < MAX_FLY) {
      fireflies.push(new Firefly(contextRef));
    }
  }

  function createGuns() {
    setTimeout(function () {
      if (guns.length === 0 && isPlaying && char.equipped === false) {
        guns.push(new Gun(contextRef));
      }
      createGuns();
    }, getRandomNumber(10000, 12000));
  }

  function spawnEnemies() {
    let timeout = getRandomNumber(1000, 2800);
    setTimeout(function () {
      zombies.push(new Zombie(canvasWidth, canvasHeight - 100, contextRef));
      if (isPlaying) {
        spawnEnemies();
      }
    }, timeout);
  }

  function createClouds() {
    if (clouds.length < MAX_CLOUDS) {
      clouds.push(new Cloud(contextRef));
    }
  }

  cloudId = setInterval(function () {
    createClouds();
  }, getRandomNumber(3000, 6500));

  createClouds();

  function removeClouds() {
    clouds.forEach(function (cld, index) {
      if (cld.position.x + 280 < 0) {
        clouds.splice(index, 1);
      }
    });
  }

  function removeGuns() {
    guns.forEach(function (gun, index) {
      if (gun.position.x < 0) {
        guns.splice(index, 1);
      }
    });
  }

  function removeSnow() {
    let i = snowFlakes.length;

    while (i--) {
      let snow = snowFlakes[i];

      if (snow.age >= snow.lifeSpan) {
        snowFlakes.splice(i, 1);
      }
    }
  }

  function removeFlies() {
    let i = fireflies.length;

    while (i--) {
      let fly = fireflies[i];

      if (fly.age >= fly.lifeSpan) {
        fireflies.splice(i, 1);
      }
    }
  }

  function increaseSpeed(increasedSpeed) {
    speed = speed + increasedSpeed;
  }

  useEffect(function () {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    windSound.src = wind;
    windSound.play();
    windSound.addEventListener('ended', function () {
      this.currentTime = 0;
      this.play();
    });

    char = new Bob(50, canvasHeight - 110, contextRef);
    isPlaying = true;

    const context = canvas.getContext('2d');
    contextRef.current = context;

    let layer1 = new Background(backgroundImg_1, 1, contextRef);
    let layer2 = new Background(backgroundImg_2, 0.5, contextRef);
    let layer3 = new Background(backgroundImg_3, 0.1, contextRef);

    backgrounds.push(layer3);
    backgrounds.push(layer2);
    backgrounds.push(layer1);

    if (char.equipped === false) {
      createGuns();
    }
    animate();

    document.addEventListener('touchstart', (event) => {
      mobileController(event);
    });
    document.addEventListener('keydown', (event) => {
      controller(event);
    });
  }, []);

  function render() {
    contextRef.current.fillStyle = '#3E3E3E';
    contextRef.current.fillRect(0, 0, canvasWidth, canvasHeight);

    backgrounds.forEach(function (background, index) {
      background.draw();
    });

    //Draw moon
    contextRef.current.fillStyle = '#FCFF9B';
    contextRef.current.arc(canvasWidth - 30, 60, 180, 0, Math.PI * 2, false);
    contextRef.current.fill();

    //Draw bullets
    for (let i = 0; i < bullets; i = i + 2) {
      contextRef.current.drawImage(bulletImg, 10 + i * 20, 10);
    }

    char.draw();

    zombies.forEach(function (zombie, index) {
      zombie.draw();
    });

    snowFlakes.forEach(function (snow, index) {
      snow.draw();
    });

    fireflies.forEach(function (fly, index) {
      fly.draw();
    });

    clouds.forEach(function (cld, index) {
      cld.draw();
    });

    particles.forEach(function (particle, index) {
      particle.draw();
    });

    guns.forEach(function (gun, index) {
      gun.draw();
    });

    projectiles.forEach(function (projectile, index) {
      projectile.draw();
    });
  }

  function controller(event) {
    event.preventDefault();

    if (event.key === ' ' && isPlaying) {
      if (char.equipped === false) {
        char.jump();
        jumpSound.play();
      } else {
        projectiles.push(
          new Projectile(char.position.x, char.position.y + 55, contextRef)
        );
        fireSound.play();
        bullets--;
        if (bullets < 1) {
          char.equipped = false;
        }
      }
    }

    return () => {
      document.removeEventListener('keydown', (event) => {
        controller(event);
      });
    };
  }

  function mobileController() {
    if (isPlaying) {
      if (char.equipped === false) {
        char.jump();
        jumpSound.play();
      } else {
        projectiles.push(
          new Projectile(char.position.x, char.position.y + 55, contextRef)
        );
        fireSound.play();
        bullets--;
        if (bullets <= 1) {
          char.equipped = false;
        }
      }
    }

    return () => {
      document.removeEventListener('touchstart', (event) => {
        mobileController(event);
      });
    };
  }

  //Definitely nothing suspicious going on over here...
  function handleScoreClick() {
    if (taps < 2) {
      taps++;
    } else {
      cheatSound.play();
      ghostMode = true;
      taps = 0;

      gsap.to(scoreBarRef.current, {
        backgroundColor: 'red',
        width: 0,
        ease: 'linear',
        duration: 6,
      });

      setTimeout(function () {
        ghostMode = false;
        gsap.to(scoreBarRef.current, {
          backgroundColor: '#00F3D2',
          width: '50%',
          ease: 'linear',
          duration: 0.1,
        });
      }, 6000);
    }
  }

  function updateScore() {
    scoreId = setTimeout(function () {
      if (isPlaying) {
        setScore(score + 1);
        if (score % 10 === 0) {
          increaseSpeed(0.025);
        }
      } else {
        clearInterval(scoreId);
      }
    }, 500);
  }
  updateScore();

  function update() {
    char.addGravity(0.4);
    zombies.forEach(function (zombie, index) {
      //Collision detection
      if (!ghostMode) {
        if (
          char.position.x + char.width >= zombie.position.x &&
          char.position.x <= zombie.position.x + zombie.width &&
          char.position.y + char.height >= zombie.position.y &&
          char.position.y <= zombie.position.y + zombie.height
        ) {
          isPlaying = false;
          setIsGameover(true);
          taps = 0;
          speed = 1;
          bullets = 0;
          window.navigator.vibrate(300);
          clearInterval(cloudId);
          clearInterval(gunsId);
          cancelAnimationFrame(animationId);
          eatenSound.play();
          windSound.src = '';
          windSound.currentTime = 0;
          return;
        }
      }

      projectiles.forEach(function (projectile, projIndex) {
        if (projectile.position.x + projectile.size >= zombie.position.x) {
          projectiles.splice(projIndex, 1);
          zombies.splice(index, 1);

          for (let i = 0; i < 40; i++) {
            particles.push(
              new Particle(
                zombie.position.x + 20,
                zombie.position.y + 20,
                Math.random() * 3,
                'red',
                contextRef
              )
            );
          }
        }
      });

      if (isPlaying) {
        zombie.move();
      }

      //Clean up
      if (zombie.position.x + zombie.width < 0) {
        zombies.splice(index, 1);
      }
    });

    guns.forEach(function (gun, index) {
      if (
        char.position.x + char.width > +gun.position.x &&
        char.position.x <= gun.position.x + gun.width &&
        char.position.y + char.height >= gun.position.y &&
        char.position.y <= gun.position.y + gun.height
      ) {
        char.equipped = true;
        bullets = 6;
        guns.splice(index, 1);
        reloadSound.play();
      }
    });

    createSnow();
    removeSnow();

    createFlies();
    removeFlies();

    removeGuns();

    removeClouds();

    snowFlakes.forEach(function (snow, index) {
      snow.moveSnow();
    });

    fireflies.forEach(function (fly, index) {
      fly.move();
    });

    clouds.forEach(function (cld, index) {
      cld.move();
    });

    guns.forEach(function (gun, index) {
      gun.move();
    });

    projectiles.forEach(function (projectile, index) {
      projectile.fire();
    });

    backgrounds.forEach(function (background, index) {
      background.update();
    });

    particles.forEach(function (particle, index) {
      if (particle.alpha <= 0) {
        particles.splice(index, 1);
      } else {
        particle.move();
      }
    });

    render();
  }

  function animate() {
    if (isPlaying) {
      update();
      animationId = requestAnimationFrame(animate);
    }
  }

  return (
    <>
      <h2 onClick={handleScoreClick} className="scoreBoard">
        Score: {score}
      </h2>
      <div
        style={{ opacity: ghostMode ? 1 : 0 }}
        ref={scoreBarRef}
        className="ghostModeBar"
      ></div>
      <canvas className="game" ref={canvasRef}>
        I'm sorry but your computer is from the stone age. Please update
      </canvas>
      {gameover && (
        <img
          className="gameOver"
          src={gameOver}
          alt="game over"
          onClick={handleGameOver}
        />
      )}
    </>
  );
}

export default memo(Game);
