import 'kontra';
import {preload} from './preload'
import {getRandomIntInRange} from './helpers';
import {createAsteroid, ASTEROID_SCORES} from './asteroid';
import {createParticle} from './particle';
import {createShip} from './ship';
import {createText, drawLives, centerText} from './hud';
import {createSaucer, SAUCER_SCORES} from './saucer';

const START_LIVES = 3;
const START_ASTEROIDS = 3;
const EXTRA_LIFE_EVERY = 10000;
const SAUCER_DEFAULT_SPAWN_TIMER = 2000;
const SAUCER_HOMING_SPEED = 200; //smaller = faster
const SFX_ASTEROID_EXPLODE = 'Explosion__007';
const SFX_ASTEROID_HIT = 'Punch__003';
const SFX_SHIP_EXPLODE = 'Explosion2__005';
const SFX_SAUCER_EXPLODE = 'Explosion__006'
const SFX_SAUCER_MOVE = 'Space__007' //Roar__004 005, Space__007
const SFX_GAME_OVER = 'Space__009'; //008/009
const SFX_EXTRA_LIFE = 'Powerup__008';
const SFX_HYPERSPACE = 'Teleport__009';

let sprites = [];
let lives = START_LIVES;
let score = 0;
let msg = 'hit ENTER to start';
let loopCount = 0;
let level = 0;
let isLevellingUp = false;
let isWaitingToStartGame = true;
let audioTimer;
let nextLifeAt = EXTRA_LIFE_EVERY;

preload();
kontra.init();
if (kontra.store.get("high score")){
    // pass
} else {
    kontra.store.set("high score", 0)
}

let scrWidth = kontra.canvas.width;
let scrHeight = kontra.canvas.height;

//Add HUD with number of lives, score.
let scoreText = createText(48, 48, 24);
let hiscoreText = createText(scrWidth/4, 48, 24);
let startText = createText(scrWidth/2-96, 96, 18);
let gameOverText = createText(scrWidth/2, 192, 28);
startText.setText('Hit Enter to Start')
startText.animate = true;
let debugText = createText(scrWidth/2, scrHeight - 32, 12, '#00ff00', 'debug');


let ship = createShip(scrWidth / 2, scrHeight / 2);
sprites.push(ship);  

let saucerBulletPool = kontra.pool({
    create: kontra.sprite  // create a new sprite every time the pool needs new objects
  });

//let quadtree = kontra.quadtree();

// ============================================================================
// Main Game Loop
// ============================================================================
let loop = kontra.gameLoop({
    update() {
        //debugText.setText('bullets' + ship.bulletPool.getAliveObjects().length);
        startText.update();

        // *** Start Game if Enter pressed ***
        if (isWaitingToStartGame === true){
            if (kontra.keys.pressed('enter')){
                startText.setText('');
                console.log('Starting game...')
                isWaitingToStartGame = false;
            } else {
                return;
            }
        }

        // *** Hyperspace ***
        if (kontra.keys.pressed('h')){
            kontra.assets.audio[SFX_HYPERSPACE].play();
            sprites.forEach(sprite => {
                if (sprite.type === 'ship'){
                    sprite.x = getRandomIntInRange(scrWidth);
                    sprite.y = getRandomIntInRange(scrHeight);
                }
            })
        }
       
        // *** Check for extra life ***
        if (score >= nextLifeAt){
            nextLifeAt += EXTRA_LIFE_EVERY;
            lives += 1;
            kontra.assets.audio[SFX_EXTRA_LIFE].play();
        }

        // *** Spawn Saucers at semi-random intervals ***
        let saucerSpawnTimer = SAUCER_DEFAULT_SPAWN_TIMER/level;
        loopCount += 1;
        if (loopCount >= saucerSpawnTimer){
            // probability of getting a small saucer increases with levels
            let probSmallSaucer = 2 - (Math.random(0.1 * level));
            sprites.push(createSaucer(
                startOffScreen(getRandomIntInRange(scrWidth), scrWidth / 2), 
                startOffScreen(getRandomIntInRange(scrHeight), scrHeight / 2),
                Math.round(probSmallSaucer),
                sprites
            ));
            let duration = kontra.assets.audio[SFX_SAUCER_MOVE].duration;
            audioTimer = setInterval(function(){
                kontra.assets.audio[SFX_SAUCER_MOVE].play()
            }, duration)
            loopCount = 0;
        }
        // *** update saucers and each saucer's bullets ***
        sprites = sprites.filter(sprite => (sprite.type !== 'saucerBullet'));
        sprites.forEach(sprite => {
            if (sprite.type === 'saucer'){
                // saucers head towards the player ship
                sprite.dx = (ship.x - sprite.x) / SAUCER_HOMING_SPEED;
                sprite.dy = (ship.y - sprite.y) / SAUCER_HOMING_SPEED;
                // add saucer's bullets to sprite array
                sprite.bullets.forEach(bullet => {
                    if(bullet.isAlive()) {sprites.push(bullet)}
                })
            }
        })

        // *** update all sprites in array, and count asteroids ***
        let asteroidCount = 0;
        sprites.map(sprite => {
            sprite.update();
            // edge of screen detection
            if (sprite.x < 0) {sprite.x = scrWidth;}
            if (sprite.x > scrWidth) {sprite.x = 0;}
            if (sprite.y < 0) {sprite.y = scrHeight;}
            if (sprite.y > scrHeight) {sprite.y = 0;}

            if (sprite.type === 'asteroid'){
                asteroidCount += 1;
            }
            if (sprite.type==='ship'){
                sprite.bulletPool.update();
                sprites.push(...sprite.bulletPool.getAliveObjects());
            }

        });

        // *** If all asteroids destroyed, start new level ***
        if (asteroidCount <= 0 && isLevellingUp === false) {
            isLevellingUp = true;
            // clear out all sprites except player
            sprites = sprites.filter(sprite => (sprite.type === 'ship'));
            clearInterval(audioTimer)
            // pause before adding more asteroids
            setTimeout(function(){
                level += 1;
                console.log('Level', level);
                createAsteroids(START_ASTEROIDS + level);
                isLevellingUp = false;
            }, 1000)
        }

        // *** collision detection ***
        for (let i = 0; i < sprites.length; i++){
            // check for collision against asteroids
            if (sprites[i].type === 'asteroid' || sprites[i].type === 'saucer' || sprites[i].type === 'saucerBullet' ){
                for (let j = 0; j < sprites.length; j++){
                    // don't worry about asteroid vs. asteroid collisions
                    if (sprites[j].type === 'ship' || sprites[j].type === 'bullet'){
                        let enemy = sprites[i];
                        let sprite = sprites[j];

                        // circle vs. circle collision detection
                        let dx = enemy.x - sprite.x;
                        let dy = enemy.y - sprite.y;
                        if (Math.sqrt(dx * dx + dy * dy) < enemy.radius + sprite.width) {

                            // *** Ship collision ***
                            if (sprite.type === 'ship'){
                                kontra.assets.audio[SFX_SHIP_EXPLODE].play();
                                // create ship explosion with particle fx
                                for (var n = 0; n < 50; n++){
                                    sprites.push(createParticle(sprite.x,sprite.y,90));
                                }
                                lives -= 1;
                                clearInterval(audioTimer);
                                if (lives <= 0){
                                    
                                    // *** stop game and display Game Over ***
                                    setTimeout(function(){
                                        kontra.assets.audio[SFX_GAME_OVER].play();
                                        sprites.forEach(sprite => sprite.ttl = 0);
                                        clearInterval(audioTimer);
                                    },1000)
                                    gameOverText.setText('Game Over')
                                    if (score > kontra.store.get("high score")) {
                                        kontra.store.set("high score", score)
                                    }
                                    
                                    // *** reset game ***
                                    setTimeout(function(){
                                        isWaitingToStartGame = true;
                                        gameOverText.setText('');
                                        startText.setText('Hit Enter to Start')
                                        lives=START_LIVES;
                                        loopCount = 0;
                                        score = 0;
                                        sprites =[];
                                        ship = createShip(scrWidth / 2, scrHeight / 2);
                                        sprites.push(ship);  

                                    }, 2000)
                                } else {
                                    setTimeout(function(){
                                        ship = createShip(scrWidth / 2, scrHeight / 2);
                                        sprites.push(ship);  
                                    }, 2000)
                                }
                            }
                            // *** kill sprites by setting ttl to 0 ***
                            enemy.ttl = 0;
                            sprite.ttl = 0;

                            if (enemy.type === 'asteroid'){
                                // *** split asteroid if it's big enough ***
                                if (enemy.size >= 2){
                                    let newSize = enemy.size - 1;
                                    score += ASTEROID_SCORES[enemy.size]
                                    kontra.assets.audio[SFX_ASTEROID_HIT].play();
                                    for (var x = 0; x < 3; x++){
                                        sprites.push(createAsteroid(enemy.x, enemy.y, newSize));
                                    }
                                } else {
                                    score += ASTEROID_SCORES[enemy.size]
                                    kontra.assets.audio[SFX_ASTEROID_EXPLODE].play();
                                    // *** create asteroid explosion with particle fx ***
                                    for (var n = 0; n < 20; n++){
                                        sprites.push(createParticle(enemy.x, enemy.y, 40, '255,255,255,'));
                                    }
                                }
                                break;
                            }

                            if (enemy.type === 'saucer'){
                                score += SAUCER_SCORES[enemy.size];
                                clearInterval(audioTimer);
                                kontra.assets.audio[SFX_SAUCER_EXPLODE].play()
                                // *** create saucer explosion with particle fx ***
                                for (var n = 0; n < 20; n++){
                                    sprites.push(createParticle(enemy.x, enemy.y, 40, '255,0,255,'));
                                }
                            }
                        }
                    }
                }
            }
        }
        sprites = sprites.filter(sprite => sprite.isAlive());
    },
    render() {
        sprites.map(sprite => {
            sprite.render();
            if (sprite.type==='ship'){
                sprite.bulletPool.render();
            }
        });
        saucerBulletPool.render();
        scoreText.setText(score);
        //debugText.setText('render' + ship.bulletPool.getAliveObjects().length.toString());
        let hiscoreValue = kontra.store.get("high score") || 0;
        hiscoreText.setText(hiscoreValue)
        hiscoreText.x = scrWidth - 100 - (hiscoreText.fontSize * hiscoreValue.toString().length);
        drawLives(lives);
        
        gameOverText.render();
        startText.render();
    }
});
loop.start();

function createAsteroids(numAsteroids){
    for (var i = 0; i < numAsteroids; i++){
        let x = startOffScreen(getRandomIntInRange(scrWidth), scrWidth / 2);
        let y = startOffScreen(getRandomIntInRange(scrHeight), scrHeight / 2);
        sprites.push(createAsteroid(x, y, 3));
    }
}

function startOffScreen(xy, midpoint){
    if (xy < midpoint){
         return xy -= midpoint
    } else {
        return xy += midpoint
    }
}
