const ua = navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(ua);

const grid = document.getElementById('screen');
const start = document.getElementById('start');
const player = document.createElement('div');
const timer = document.getElementById('timer');
const score = document.getElementById('score');
const stats = document.getElementById('stats');
const hungry = document.getElementById('hungry');
const popup = document.getElementById('popup');
const restart = document.getElementById('restart');
const pause = document.getElementById('pause');
const best = document.getElementById('best');
const mobile = isMobile ? document.getElementById('mobile') : [];

let scTop = 50;
let scLeft = 50;
let fruits = [];
let limit = 5;
let time = 0;
let gameScore = 0;
let hungryPoints = 0;
let isGameStarted = false;
let isHungry = false;
let intervals = [];
let movementID=0;

const moveBy = 1;
const bestScore = parseInt(localStorage.getItem('score'));

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

if (!isNaN(bestScore)) {
    best.innerHTML = `Best: ${bestScore}`;
} else {
    best.innerHTML = 'Best: 0';
}

const setEvents = () => {
    pause.addEventListener("click", pauseGame);

    if (!isMobile) { 
        document.addEventListener('keypress', playerMovement);
        document.addEventListener('keypress', pauseGameAction);
    } else { // mobile devices
        const keys = ['w','s','a','d'];
        for (let i = 0; i < 4; i++) { //create 4 buttons to append in html
            const btn = document.createElement('button');
            btn.classList.add('btn','btn-primary','p-4','m-1');
            btn.addEventListener('click',()=>{playerMovement_Mobile(keys[i])});
            if(i==0 || i==1){ //up, down buttons
                const div = mobile.firstElementChild;
                div.append(btn);
            }else{ // left, right buttons
                const div = mobile.lastElementChild;
                div.append(btn);
            }
        }
    }
}
const playerMovement_Mobile = (key) => {
    checkKeyPressed(key);
}
const playerMovement = (e) => {
    const key = e.key.toLowerCase();
    checkKeyPressed(key);
}
const checkKeyPressed = (key) => {
    switch (key) {
        case 'w':
            player.className = 'move-up-player';
            player.classList.add('player');
            clearInterval(movementID);
            movementID=setInterval(()=>playerContinuousMovement(key),30);
            break;
        case 's':
            player.className = 'move-down-player';
            player.classList.add('player');
            clearInterval(movementID);
            movementID=setInterval(()=>playerContinuousMovement(key),30);
            break;
        case 'a':
            player.className = 'move-left-player';
            player.classList.add('player');
            clearInterval(movementID);
            movementID=setInterval(()=>playerContinuousMovement(key),30);
            break;
        case 'd':
            player.className = 'move-right-player';
            player.classList.add('player');
            clearInterval(movementID);
            movementID=setInterval(()=>playerContinuousMovement(key),30);
            break;
    }
}
const pauseGameAction = (e) => {
    if (e.key === 'p' && isGameStarted) pause.click();
}
const spawner = () => {
    if (fruits.length < limit) {
        const fruit = document.createElement('div');
        let top = parseInt(Math.random() * (100 - 1) + 1);
        let left = parseInt(Math.random() * (100 - 1) + 1);
        let fruitNumber = parseInt(Math.random() * (4 - 1) + 1);
        if (top <= 0) fruit.style.top = '0%';
        if (top >= 100) fruit.style.top = '100%';
        if (left <= 0) fruit.style.left = '0%';
        if (left >= 100) fruit.style.left = '100%';

        fruit.style.top = `${top}%`;
        fruit.style.left = `${left}%`;
        fruit.style.backgroundImage = `url(img/fruits/f${fruitNumber}.png)`;
        fruit.classList.add('fruit');
        grid.appendChild(fruit);
        const fruitObj = new Fruit(10, fruit.getBoundingClientRect());
        fruits.push(fruitObj);
        fruit.id = fruitObj.id;

        isHungry = true;
    }

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
/**
 * Moves the player in the direction he's looking
 */
const playerContinuousMovement=(key)=>{    
    switch (key) {
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
const checkCollisions=()=>{
    for (let i = 0; i < fruits.length; i++) {
        const element = fruits[i];
        const playerPosition = player.getBoundingClientRect();
        if (closeToFruit(playerPosition, element.position)) {
            score.innerHTML = `Score: ${gameScore += element.score}`;
            element.removeSelf();
            hungryPoints = 0;
            fruits.splice(i, 1);
        }
    }
}
const closeToFruit = (playerPosition, element) => {
    return (playerPosition.x < element.x + element.width &&
        playerPosition.x + playerPosition.width > element.x &&
        playerPosition.y < element.y + element.height &&
        playerPosition.height + playerPosition.y > element.y)
}
const startGame = () => {
    start.disabled = true;
    score.innerHTML = `Score: 0`;
    timer.innerHTML = 'Time: 0s';
    hungry.innerHTML = 'Hungry: 0/100';
    stats.style.opacity = 1;
    pause.disabled = restart.disabled = false;


    instantiatePlayer();
    intervals.push(setInterval(timeInterval, 1000), setInterval(spawner, 3000));

    isGameStarted = true;
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
const pauseGame = () => {
    intervals.forEach(item => clearInterval(item));
    intervals = [];
    clearInterval(movementID); // stops the player movement interval
    document.removeEventListener("keypress", playerMovement);
    pause.innerHTML = 'Unpause';
    pause.removeEventListener("click", pauseGame);
    pause.addEventListener("click", unpauseGame);

    player.style.animationPlayState = 'paused';
}
const unpauseGame = () => {
    intervals.push(
        setInterval(timeInterval, 1000),
        setInterval(spawner, 3000),
        setInterval(checkCollisions, 150)
    );
    pause.removeEventListener("click", unpauseGame);
    pause.addEventListener("click", pauseGame);
    if (!isMobile) document.addEventListener('keypress', playerMovement);
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