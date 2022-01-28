const ua = navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(ua);

let grid = document.getElementById('screen');
let start = document.getElementById('start');
let player = document.createElement('div');
let timer = document.getElementById('timer');
let score = document.getElementById('score');
let stats = document.getElementById('stats');
let hungry = document.getElementById('hungry');
let popup = document.getElementById('popup');
let restart = document.getElementById('restart');
let pause = document.getElementById('pause');
let best = document.getElementById('best');
let mobile = isMobile ? document.getElementById('mobile') : [];
let level = document.getElementById('level');

let scTop = 50;
let scLeft = 50;
let fruits = [];
let ghosts = [];
let limit = 7;  // fruit generation limit
let time = 0;
let firstMove = false;
let gameScore = 0;
let hungryPoints = 0;
let isGameStarted = false;
let isHungry = false;
let intervals = []; //collection of all game intervals
let movementID = 0;
let movementBackup = 'key'; // stores the current player movement key
let currentLevel = 1;

const moveBy = 1;   //player movement

const bestScore = parseInt(localStorage.getItem('score'));

if (!isNaN(bestScore)) {
    best.innerHTML = `Best: ${bestScore}`;
} else {
    best.innerHTML = 'Best: 0';
}

class Fruit {
    static id = -1;
    constructor(score, position) {
        Fruit.id++;
        this.id = Fruit.id;
        this.score = score;
        this.position = position;
    }
    removeSelf() {
        const refHtml = document.getElementById(this.id);
        refHtml.remove();
    }
}

class Ghost {
    movementPattern = [];
    targetPoint = {};
    constructor(position, elementRef) {
        this.position = position;
        this.elementRef = elementRef;
        this.speed = 1;
        this.iteration = 0;
        this.generatePattern();
        this.startInterval();
    }
    get screenInfo() {
        return this.elementRef.getBoundingClientRect();
    }
    movement() {
        let { x, y } = this.distanceBetween();
        x = parseInt(x);
        y = parseInt(y);
        const angle = Math.atan2(y, x);

        const xVel = this.speed * Math.cos(angle);
        const yVel = this.speed * Math.sin(angle);

        this.elementRef.style.top = `${this.position.top += yVel}%`;
        this.elementRef.style.left = `${this.position.left += xVel}%`;
        if (x == 0 && y == 0) {
            this.iteration++;
            if (this.iteration == this.movementPattern.length) this.iteration = 0;
            this.targetPoint = this.movementPattern[this.iteration];
        }

    }
    set animationState(state=''){
        this.elementRef.style.animationPlayState = state;
    }
    startInterval() {
        this.curIntervalID = setInterval(() => this.movement(), 50);
        intervals.push(this.curIntervalID);
    }
    distanceBetween() {
        const distance = {
            x: this.targetPoint.left - this.position.left,
            y: this.targetPoint.top - this.position.top
        }
        return distance;
    }
    generatePattern() {

        for (let i = 0; i < 5; i++) {
            const top = parseInt(Math.random() * (100 - 1) + 1);
            const left = parseInt(Math.random() * (100 - 1) + 1);
            this.movementPattern.push({ top, left });
        }
        this.targetPoint = this.movementPattern[0];
    }
}

const setEvents = () => {
    pause.addEventListener("click", pauseGame);

    if (!isMobile) {
        document.addEventListener('keypress', playerMovement);
        document.addEventListener('keypress', pauseGameAction);
    } else { // mobile devices
        const keys = ['W', 'S', 'A', 'D'];
        for (let i = 0; i < 4; i++) { //create 4 buttons to append in html

            const btn = document.createElement('button');
            btn.textContent = keys[i];
            btn.style.width = '45px';
            btn.classList.add('btn', 'btn-primary', 'p-3', 'm-2');
            btn.addEventListener('click', () => { setMovement(keys[i]) });


            if (i == 0 || i == 1) { //up, down buttons
                const div = mobile.firstElementChild;
                div.append(btn);
            } else { // left, right buttons
                const div = mobile.lastElementChild;
                div.append(btn);
            }
        }
    }
}

const fruitSpawner = () => {
    if (fruits.length < limit) {
        const fruit = document.createElement('div');
        spawner(fruit);
        let fruitNumber = parseInt(Math.random() * (4 - 1) + 1);

        fruit.style.backgroundImage = `url(img/fruits/f${fruitNumber}.png)`;
        fruit.classList.add('fruit');

        grid.appendChild(fruit);
        const fruitObj = new Fruit(10, fruit.getBoundingClientRect());
        fruits.push(fruitObj);

        fruit.id = fruitObj.id;

        isHungry = true;
    }

}
const ghostSpawner = () => {
    if (currentLevel < 11) {
        let ghost = document.createElement('div');
        const { top, left } = spawner(ghost);
        const ghostSprite = Math.random() >= 0.5 ? 'pink' : 'red';
        ghost.style.backgroundImage = `url(img/ghosts/${ghostSprite}/${ghostSprite}-1.png)`;
        ghost.classList.add(`ghost-${ghostSprite}`);
        grid.appendChild(ghost);

        const newGhost = new Ghost({ top, left }, ghost, ghost.getBoundingClientRect());
        ghosts.push(newGhost);
    }
}
const spawner = (element) => {
    let top = parseInt(Math.random() * (100 - 1) + 1);
    let left = parseInt(Math.random() * (100 - 1) + 1);

    if (top <= 0) top = 0;
    if (top >= 100) top = 100;
    if (left <= 0) left = 0;
    if (left >= 100) left = 100;

    element.style.top = `${top}%`;
    element.style.left = `${left}%`;

    return { top, left };
}
const timeInterval = () => {
    timer.innerHTML = `Time: ${time++}s`;
    if (isHungry) hungryPoints += 7;
    hungry.innerHTML = `Hungry: ${hungryPoints}/100`;
    if (hungryPoints >= 100) {
        hungry.innerHTML = `Hungry: 100/100`;
        gameOver();
    }
}
const instantiatePlayer = () => {
    player.style.left = `${scLeft}%`;
    player.style.top = `${scTop}%`;
    player.classList.add('player');
    grid.appendChild(player);
    intervals.push(setInterval(checkCollisions, 150));
}
const playerMovement = ({ key }) => {
    setMovement(key.toLowerCase());
}
/**
 * Sets the player movement direction and update his position
 * @param {*} key 
 */
const setMovement = (key) => {
    key = key.toLowerCase();
    if (key == 'w' || key == 's' || key == 'a' || key == 'd') {
        movementBackup = key;
        player.className = `move-${key}-player`;
        player.classList.add('player');

        if (!firstMove) {
            movementID = setInterval(() => playerContinuousMovement(), 30);
            firstMove = true;
        }
    }
}
const pauseGameAction = (e) => {
    if (e.key === 'p' && isGameStarted) pause.click();
}
/**
 * Moves the player in the direction he's looking
 */
const playerContinuousMovement = () => {
    switch (movementBackup) {
        case 'w':
            player.style.top = `${scTop -= moveBy}%`;
            if (scTop <= 0) player.style.top = `${scTop = 0}%`;
            break;
        case 's':
            player.style.top = `${scTop += moveBy}%`;
            if (scTop >= 100) player.style.top = `${scTop = 100}%`;
            break;
        case 'a':
            player.style.left = `${scLeft -= moveBy}%`;
            if (scLeft <= 0) player.style.left = `${scLeft = 0}%`;
            break;
        case 'd':
            player.style.left = `${scLeft += moveBy}%`;
            if (scLeft >= 100) player.style.left = `${scLeft = 100}%`;
            break;
    }
}
const checkCollisions = () => {
    const playerPosition = player.getBoundingClientRect();

    //Fruits
    for (let i = 0; i < fruits.length; i++) {
        const element = fruits[i];
        if (colliderCheck(playerPosition, element.position)) {
            score.innerHTML = `Score: ${gameScore += element.score}`;
            hungryPoints = 0;
            hungry.innerHTML = `Hungry: 0/100`;

            if (gameScore / 80 >= currentLevel) {
                currentLevel++;
                level.innerHTML = `Level: ${currentLevel}`;
                ghostSpawner();
            }

            element.removeSelf();
            fruits[i] = null;
            fruits = fruits.filter(n => n != null);

        }
    }
    //Ghosts
    for (let i = 0; i < ghosts.length; i++) {
        const element = ghosts[i];
        if (colliderCheck(playerPosition, element.screenInfo)) {
            gameOver();
        }
    }
}
const colliderCheck = (playerPosition, element) => {
    return (playerPosition.x < element.x + element.width &&
        playerPosition.x + playerPosition.width > element.x &&
        playerPosition.y < element.y + element.height &&
        playerPosition.height + playerPosition.y > element.y)
}

const gameOver = () => {
    pauseGame();
    htmlGameOver();
    if (isNaN(bestScore)) {
        best.innerHTML = gameScore;
        localStorage.setItem('score', gameScore.toString());
        return;
    } else if (bestScore < gameScore) {
        best.innerHTML = gameScore;
        localStorage.setItem('score', gameScore.toString());
    }
}

const reloadPage = () => {
    window.location.reload();
}
const startGame = () => {
    start.disabled = true;
    score.innerHTML = `Score: 0`;
    timer.innerHTML = 'Time: 0s';
    hungry.innerHTML = 'Hungry: 0/100';
    stats.style.opacity = 1;
    pause.disabled = restart.disabled = false;

    instantiatePlayer();
    intervals.push(setInterval(timeInterval, 1000), setInterval(fruitSpawner, 3000));

    level.innerText = 'Level 1';
    grid.scrollIntoView();

    isGameStarted = true;
}
const pauseGame = () => {
    intervals.forEach(item => clearInterval(item));
    intervals = [];
    clearInterval(movementID); // stops the player movement interval
    document.removeEventListener("keypress", playerMovement);
    pause.innerHTML = 'Unpause';
    pause.removeEventListener("click", pauseGame);
    pause.addEventListener("click", unpauseGame);

    for (const iterator of ghosts) {
        iterator.animationState = 'paused';
    }

    player.style.animationPlayState = 'paused'; //pause the player animation
}
const unpauseGame = () => {
    intervals.push( //restart all game invertals
        setInterval(timeInterval, 1000),
        setInterval(fruitSpawner, 3000),
        setInterval(checkCollisions, 150)
    );
    for (const iterator of ghosts) {
        iterator.startInterval();
        iterator.animationState = 'running';
    }

    firstMove = false;

    pause.removeEventListener("click", unpauseGame);
    pause.addEventListener("click", pauseGame);

    if (!isMobile) document.addEventListener('keypress', playerMovement);

    setMovement(movementBackup);

    player.style.animationPlayState = 'running';
    pause.innerHTML = 'Pause';
}
const htmlGameOver = () => {
    const p = document.createElement('p');
    p.innerHTML = 'You Lost!!';
    p.className = 'lost';
    stats.classList.add('fixed-stats', 'flex-column');
    popup.className = 'game-over';
    popup.appendChild(p);
    hungry.remove();
    stats.appendChild(restart);
    popup.appendChild(stats);

    pause.disabled = true;
}

setEvents();