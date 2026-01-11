const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('ui');

canvas.width = 400;
canvas.height = 600;

let score = 0;
let gameActive = false; // Start with game inactive
let gameStarted = false; // New state to track if game has ever started

// Assets
const characterImg = new Image();
characterImg.src = 'assets/character.png';

const hitSound = new Audio('assets/hit.mp3');

const bird = {
    x: 50,
    y: 300,
    width: 50, // Slightly larger for the image
    height: 50,
    gravity: 0.6,
    velocity: 0,
    jump: -8,
    dive: 10 // New dive speed for CTRL
};

const pipes = [];
const pipeWidth = 60;
const pipeGap = 180;
const pipeSpeed = 3;

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({
        x: canvas.width,
        topHeight: height,
        passed: false
    });
}

function drawBird() {
    if (characterImg.complete) {
        ctx.drawImage(characterImg, bird.x, bird.y, bird.width, bird.height);
    } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#f00';
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Realistic fire effect using gradients
        const drawFire = (x, y, width, height, isTop) => {
            const gradient = ctx.createLinearGradient(x, y, x + width, y);
            gradient.addColorStop(0, '#FF4500'); // OrangeRed
            gradient.addColorStop(0.5, '#FFD700'); // Gold
            gradient.addColorStop(1, '#FF4500');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);

            // Animated "flame" particles on the edge
            ctx.fillStyle = '#FFA500';
            for (let i = 0; i < 5; i++) {
                const particleX = x + Math.random() * width;
                const particleY = isTop ? height - Math.random() * 20 : y + Math.random() * 20;
                const size = Math.random() * 8 + 4;
                ctx.beginPath();
                ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // Top fire pillar
        drawFire(pipe.x, 0, pipeWidth, pipe.topHeight, true);
        
        // Bottom fire pillar
        const bottomY = pipe.topHeight + pipeGap;
        drawFire(pipe.x, bottomY, pipeWidth, canvas.height - bottomY, false);
    });
}

function update() {
    if (!gameActive) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver();
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        // Collision detection
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + pipeGap)) {
            gameOver();
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.innerText = `Score: ${score}`;
        }
    });

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPipes();
    drawBird();
    
    if (!gameActive) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        
        if (!gameStarted) {
            ctx.font = '30px Arial';
            ctx.fillText('Amitabh 2D Game', canvas.width / 2, 100);
        } else {
            ctx.font = '40px Arial';
            ctx.fillText('GAME OVER', canvas.width / 2, 120);
            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${score}`, canvas.width / 2, 170);
        }

        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Made By - OG ADI', canvas.width / 2, 250);
        
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.fillText('Up - Use SpaceBar To Jump', canvas.width / 2, 300);
        ctx.fillText('Down - Use CTRL to Get Downward', canvas.width / 2, 330);
        ctx.font = '16px Arial';
        ctx.fillText('Game made In (duration) - 69 Secs', canvas.width / 2, 380);
        
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Press SPACE to Play', canvas.width / 2, 450);
    }
}

function gameOver() {
    gameActive = false;
    hitSound.play().catch(e => console.log("Audio play blocked:", e));
}

function resetGame() {
    bird.y = 300;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    scoreElement.innerText = `Score: 0`;
    gameActive = true;
    gameStarted = true;
    createPipe();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameActive) bird.velocity = bird.jump;
        else resetGame();
    }
    if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        e.preventDefault();
        if (gameActive) bird.velocity = bird.dive;
    }
});

canvas.addEventListener('mousedown', () => {
    if (gameActive) bird.velocity = bird.jump;
    else resetGame();
});

createPipe();

gameLoop();
