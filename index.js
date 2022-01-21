const grid = document.getElementById('screen');
const start = document.getElementById('start');
const player = document.createElement('div');
const timer = document.getElementById('timer');
const score = document.getElementById('score');
const stats = document.getElementById('stats');
const hungry = document.getElementById('hungry');

let scTop = 50;
let scLeft = 50;
let fruits = [];
let limit = 10;
let time = 0;
let gameScore = 0;
let hungryPoints = 0;
let intervals = [];
const moveBy = 2;
class Fruit {
    static id = -1;
    constructor(score, position) {
        Fruit.id++;
        this.id = Fruit.id;
        this.score = score;
        this.position = { x: position.x, y: position.y }
    }
    removeSelf() {
        console.log(this.id);
        const refHtml = document.getElementById(this.id);
        refHtml.remove();
    }
    get xPosition() { return this.position.x; }
    get yPosition() { return this.position.y; }
}

document.addEventListener('keypress', (e) => {
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
});

const spawner = () => {
    if (fruits.length < limit) {
        const fruit = document.createElement('div');
        let top = Math.floor(Math.random() * 80);
        if (top % 2 != 0) {
            top++;
        }
        let left = Math.floor(Math.random() * 80);
        if (left % 2 != 0) {
            left++;
        }
        //generate fruits at left border
        fruit.style.top = `${top}%`;
        fruit.style.left = `${left}%`;
        fruit.classList.add('fruit-1');
        const fruitObj = new Fruit(10, { x: left, y: top });
        fruit.id = fruitObj.id;
        fruits.push(fruitObj);
        grid.appendChild(fruit);
    }

}
const timeInterval = () => {
    timer.innerHTML = `Elapsed time: ${time++}s`;
    hungryPoints+=10;
    hungry.innerHTML = `Hungry: ${hungryPoints}/100`;
    if(hungryPoints>=100){
        gameOver();
    }
}
const instantiatePlayer = () => {
    player.style.left = `${50}%`;
    player.style.top = `${50}%`;
    player.classList.add('player');
    grid.appendChild(player);

    setInterval(checkCollision, 500);
}
const checkCollision = () => {
    for (let i = 0; i < fruits.length; i++) {
        const element = fruits[i];
        const x = parseInt(player.style.left.split('%'));
        const y = parseInt(player.style.top.split('%'));
        if (x == element.xPosition && y == element.yPosition) {
            score.innerHTML = `Score: ${gameScore += element.score}`;
            element.removeSelf();
            hungryPoints=0;
            fruits.splice(i, 1);
        }
    }
}
const startGame = () => {
    start.disabled = true;
    score.innerHTML = `Score: 0`;
    timer.innerHTML = 'Elapsed time: 0s';
    hungry.innerHTML = 'Hungry: 0/100';
    stats.classList.add('stats');
    instantiatePlayer();
    intervals.push(setInterval(timeInterval, 1000));
    intervals.push(setInterval(spawner, 3000));
}

const gameOver = () => {
    intervals.forEach(item => clearInterval(item));
}