window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 400;

    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    let isPlaying = false;
    let score = 0;
    let speed = 6;
    let frameCount = 0;
    let obstacles = [];

    const player = {
        x: 150,
        y: 280,
        width: 30,
        height: 60,
        normalHeight: 60,
        duckHeight: 30,
        vy: 0,
        gravity: 0.8,
        jumpPower: -14,
        isGrounded: true,
        isDucking: false,
        color: '#00ffcc',

        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + (this.width - 8), this.y + 10, 5, 5);
        },

        update() {
            this.y += this.vy;
            if (this.y + this.height < 340) {
                this.vy += this.gravity;
                this.isGrounded = false;
            } else {
                this.vy = 0;
                this.y = 340 - this.height;
                this.isGrounded = true;
            }
        },

        jump() {
            if (this.isGrounded && !this.isDucking) {
                this.vy = this.jumpPower;
                this.isGrounded = false;
            }
        },

        duck(ducking) {
            if (this.isDucking === ducking) return;
            this.isDucking = ducking;
            if (ducking) {
                this.height = this.duckHeight;
                if (this.isGrounded) this.y = 340 - this.duckHeight;
            } else {
                this.height = this.normalHeight;
                if (this.isGrounded) this.y = 340 - this.normalHeight;
            }
        }
    };

    const zombie = {
        x: 30,
        y: 270,
        width: 45,
        height: 70,
        color: '#ff3333',
        animOffset: 0,

        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff0000';
            
            const armOffset = Math.sin(this.animOffset) * 10;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillRect(this.x + 20, this.y + 15 + armOffset, 30, 10);
            
            ctx.shadowBlur = 0;
            this.animOffset += 0.15;
        }
    };

    class Obstacle {
        constructor() {
            this.x = canvas.width + 50;
            this.type = Math.random() > 0.4 ? 'low' : 'high';
            
            if (this.type === 'low') {
                this.width = 25 + Math.random() * 15;
                this.height = 40;
                this.y = 340 - this.height;
                this.color = '#ff9900';
            } else {
                this.width = 40;
                this.height = 30;
                this.y = 340 - 65;
                this.color = '#cc00ff';
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        }

        update() {
            this.x -= speed;
        }
    }

    window.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            player.jump();
        } else if (e.code === 'ArrowDown') {
            player.duck(true);
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowDown') {
            player.duck(false);
        }
    });

    canvas.addEventListener('touchstart', (e) => {
        if (!isPlaying) return;
        const touchY = e.touches[0].clientY;
        const rect = canvas.getBoundingClientRect();
        const relativeY = touchY - rect.top;

        if (relativeY < rect.height / 2) {
            player.jump();
        } else {
            player.duck(true);
        }
    });

    canvas.addEventListener('touchend', () => {
        player.duck(false);
    });

    function startGame() {
        score = 0;
        speed = 6;
        obstacles = [];
        isPlaying = true;
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        isPlaying = false;
        finalScoreElement.textContent = Math.floor(score);
        gameOverScreen.classList.remove('hidden');
    }

    function handleObstacles() {
        if (frameCount % Math.max(60, Math.floor(120 - speed * 4)) === 0) {
            obstacles.push(new Obstacle());
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].draw();

            const o = obstacles[i];
            if (
                player.x < o.x + o.width &&
                player.x + player.width > o.x &&
                player.y < o.y + o.height &&
                player.y + player.height > o.y
            ) {
                gameOver();
            }

            if (o.x + o.width < 0) {
                obstacles.splice(i, 1);
            }
        }
    }

    function drawGround() {
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 340);
        ctx.lineTo(canvas.width, 340);
        ctx.stroke();
    }

    function gameLoop() {
        if (!isPlaying) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        frameCount++;
        score += 0.1;
        speed += 0.001;
        scoreElement.textContent = Math.floor(score);

        drawGround();

        player.update();
        player.draw();

        zombie.draw();

        handleObstacles();

        requestAnimationFrame(gameLoop);
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
});