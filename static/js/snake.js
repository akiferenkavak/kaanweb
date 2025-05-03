document.addEventListener('DOMContentLoaded', () => {
    // Canvas ve context tanımlama
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Oyun değişkenleri
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [];
    let food = {};
    let direction = '';
    let speed = 7;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameRunning = false;
    let gameInterval;
    
    // DOM elemanları
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Oyunu başlatma
    function initGame() {
        // Yılanı oluştur
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // Başlangıç yönü
        direction = 'right';
        
        // Skoru sıfırla
        score = 0;
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        
        // Yiyecek oluştur
        createFood();
        
        // Oyun döngüsünü başlat
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / speed);
        
        gameRunning = true;
        startBtn.textContent = 'Duraklat';
    }
    
    // Oyun döngüsü
    function gameLoop() {
        moveSnake();
        checkCollision();
        draw();
    }
    
    // Yılanı hareket ettirme
    function moveSnake() {
        // Yılanın başını kopyala
        const head = { ...snake[0] };
        
        // Yöne göre başı hareket ettir
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Yeni başı yılanın önüne ekle
        snake.unshift(head);
        
        // Yiyecek kontrolü
        if (head.x === food.x && head.y === food.y) {
            // Skoru artır
            score++;
            scoreElement.textContent = score;
            
            // Yüksek skoru güncelle
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Yeni yiyecek oluştur
            createFood();
        } else {
            // Yiyecek yenmediyse kuyruğu kısalt
            snake.pop();
        }
    }
    
    // Çarpışma kontrolü
    function checkCollision() {
        const head = snake[0];
        
        // Duvarlarla çarpışma
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // Kendisiyle çarpışma
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // Oyun sonu
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startBtn.textContent = 'Başlat';
        
        // Oyun sonu mesajı
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Oyun Bitti!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText(`Skorunuz: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    }
    
    // Çizim
    function draw() {
        // Arka planı temizle
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Yılanı çiz
        snake.forEach((segment, index) => {
            // Yılan başı için farklı renk
            if (index === 0) {
                ctx.fillStyle = '#4CAF50';
            } else {
                ctx.fillStyle = '#8BC34A';
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        });
        
        // Yiyeceği çiz
        ctx.fillStyle = '#448AFF';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // Rastgele yiyecek oluşturma
    function createFood() {
        // Rastgele konum oluştur
        let newFood;
        let onSnake;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Yiyeceğin yılanın üzerinde olup olmadığını kontrol et
            onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        } while (onSnake);
        
        food = newFood;
    }
    
    // Klavye kontrolü
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        // Mevcut yönün tam tersine gitmeyi engelle
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') direction = 'right';
                break;
        }
    });
    
    // Buton kontrolleri
    startBtn.addEventListener('click', () => {
        if (gameRunning) {
            // Oyunu duraklat
            clearInterval(gameInterval);
            gameRunning = false;
            startBtn.textContent = 'Devam Et';
        } else {
            // Oyun başlatılmamışsa başlat, duraklatılmışsa devam et
            if (snake.length === 0) {
                initGame();
            } else {
                gameInterval = setInterval(gameLoop, 1000 / speed);
                gameRunning = true;
                startBtn.textContent = 'Duraklat';
            }
        }
    });
    
    resetBtn.addEventListener('click', () => {
        initGame();
    });
    
    // Yüksek skoru göster
    highScoreElement.textContent = highScore;
    
    // Canvas'a başlangıç mesajı
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Başlatmak için "Başlat" butonuna tıklayın', canvas.width / 2, canvas.height / 2);
});