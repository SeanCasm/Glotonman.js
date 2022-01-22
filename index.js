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

let scTop = 50;
let scLeft = 50;
let fruits = [];
let limit = 5;
let time = 0;
let gameScore = 0;
let hungryPoints = 0;
let started = false;
let intervals = [];
const moveBy = 1;
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


const setEvents = () => {
    pause.addEventListener("click",pauseGame);
    document.addEventListener('keypress', playerMovement);
}
const playerMovement=(e)=>{
    switch (e.key) {
        case 'w':
            player.className = 'move-up-player';
            player.style.top = `${scTop -= moveBy}%`;
            if (scTop <= 0) player.style.top = `${scTop = 0}%`;
            player.classList.add('player');
            break;
        case 's':
            player.className = 'move-down-player';
            player.style.top = `${scTop += moveBy}%`;
            if (scTop >= 100) player.style.top = `${scTop = 100}%`;
            player.classList.add('player');
            break;
        case 'a':
            player.className = 'move-left-player';
            player.style.left = `${scLeft -= moveBy}%`;
            if (scLeft <= 0) player.style.left = `${scLeft = 0}%`;
            player.classList.add('player');
            break;
        case 'd':
            player.className = 'move-right-player';
            player.style.left = `${scLeft += moveBy}%`;
            if (scLeft >= 100) player.style.left = `${scLeft = 100}%`;
            player.classList.add('player');
            break;
    }
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
        started = true;
    }

}
const timeInterval = () => {
    timer.innerHTML = `Time: ${time++}s`;
    if (started) hungryPoints += 7;
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

    intervals.push(setInterval(checkCollision, 150));
}
const checkCollision = () => {
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
    intervals.push(setInterval(timeInterval, 1000));
    intervals.push(setInterval(spawner, 3000));
}

const gameOver = () => {
    pauseGame();
    htmlGameOver();
}

const reloadPage = () => {
    window.location.reload();
}
const pauseGame=()=>{
    intervals.forEach(item=>clearInterval(item));
    document.removeEventListener("keypress",playerMovement);
    pause.innerHTML = 'Unpause';
    pause.removeEventListener("click",pauseGame);
    pause.addEventListener("click",unpauseGame);

    player.style.animationPlayState='paused';
}
const unpauseGame=()=>{
    setInterval(timeInterval, 1000);
    setInterval(spawner, 3000);
    setInterval(checkCollision, 150);
    pause.removeEventListener("click",unpauseGame);
    pause.addEventListener("click",pauseGame);
    document.addEventListener('keypress', playerMovement);
    player.style.animationPlayState='running';
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

    pause.disabled=true;
}

setEvents();