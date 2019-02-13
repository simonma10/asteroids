import 'kontra';
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
let sprites = [];
let lives = START_LIVES;
let score = 0;
let msg = '';
let loopCount = 0;
let level = 1;
let isLevellingUp = false;


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
let msgText = createText(scrWidth/2, scrHeight/2 - 64, 48)
msgText.x = centerText(msg, msgText.x, msgText.fontSize);


createAsteroids(START_ASTEROIDS);
let ship = createShip(scrWidth / 2, scrHeight / 2);
sprites.push(ship);  

let saucerBulletPool = kontra.pool({
    create: kontra.sprite  // create a new sprite every time the pool needs new objects
  });

/* saucerBulletPool.get({
    x: 100,
    y: 200,
    width: 20,
    height: 40,
    color: 'red',
    ttl: 60
});
 */
let quadtree = kontra.quadtree();
//quadtree.bounds = {x: ship.x, y: ship.y, width: ship.width, height: ship.height}

let loop = kontra.gameLoop({
    update() {
        // Spawn Saucers at semi-random intervals
        let saucerSpawnTimer = SAUCER_DEFAULT_SPAWN_TIMER/level;
        loopCount += 1;
        if (loopCount >= saucerSpawnTimer){
            // probability of getting a small saucer increases with levels
            let probSmallSaucer = 2 - (Math.random(0.1 * level));
            //console.log(probSmallSaucer, Math.round(probSmallSaucer))
            sprites.push(createSaucer(
                getRandomIntInRange(scrWidth), 
                getRandomIntInRange(scrHeight), 
                Math.round(probSmallSaucer),
                sprites
            ));
            loopCount = 0;
        }
        // update saucers and each saucer's bullets
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
        // delete all bullets from sprites array, and re-add them (hacky workaround)
        sprites = sprites.filter(sprite => (sprite.type !== 'bullet'));
        ship.bullets.forEach(bullet => {
            if (bullet.isAlive()) {sprites.push(bullet)}
        });
        
        //quadtree.clear();
        //quadtree.bounds = {x: ship.x, y: ship.y, width: ship.width, height: ship.height }
        //quadtree.add(ship, saucerBulletPool.getAliveObjects());
        //let objects = quadtree.get(ship);
        //if(objects.length > 1) { 
            //console.log(objects);
            //loop.stop();
        //}

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
        });

        // *** If all asteroids destroyed, start new level ***
        if (asteroidCount <= 0 && isLevellingUp === false) {
            isLevellingUp = true;
            level += 1;
            console.log('Level', level);
            // clear out all sprites except player
            sprites = sprites.filter(sprite => (sprite.type === 'ship'));
            // pause before adding more asteroids
            setTimeout(function(){
                createAsteroids(START_ASTEROIDS + level);
                isLevellingUp = false;
            }, 2000)
        }

        // collision detection
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
                            if (sprite.type === 'ship'){
                                // create ship explosion with particle fx
                                for (var n = 0; n < 50; n++){
                                    sprites.push(createParticle(sprite.x,sprite.y,90));
                                }
                                lives -= 1;
                                if (lives <= 0){
                                    sprites.forEach(sprite => sprite.ttl = 0);
                                    msg = 'Game Over'
                                    msgText.x = centerText(msg, msgText.x, msgText.fontSize);
                                    if (score > kontra.store.get("high score")) {
                                        kontra.store.set("high score", score)
                                    }
                                } else {
                                    setTimeout(function(){
                                        ship = createShip(scrWidth / 2, scrHeight / 2);
                                        sprites.push(ship);  
                                    }, 2000)
                                }
                            }
                            // kill sprites by setting ttl to 0
                            enemy.ttl = 0;
                            sprite.ttl = 0;

                            if (enemy.type === 'asteroid'){
                                // split asteroid if it's big enough
                                if (enemy.size >= 2){
                                    let newSize = enemy.size - 1;
                                    score += ASTEROID_SCORES[enemy.size]
                                    for (var x = 0; x < 3; x++){
                                        sprites.push(createAsteroid(enemy.x, enemy.y, newSize));
                                    }
                                } else {
                                    score += ASTEROID_SCORES[enemy.size]
                                    // create asteroid explosion with particle fx
                                    for (var n = 0; n < 20; n++){
                                        sprites.push(createParticle(enemy.x, enemy.y, 40, '255,255,255,'));
                                    }
                                }
                                break;
                            }

                            if (enemy.type === 'saucer'){
                                score += SAUCER_SCORES[enemy.size];
                                // create saucer explosion with particle fx
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
        sprites.map(sprite => sprite.render());
        saucerBulletPool.render();
        scoreText.render(score)
        let hiscoreValue = kontra.store.get("high score");
        hiscoreText.x = scrWidth - 100 - (hiscoreText.fontSize * hiscoreValue.toString().length);
        hiscoreText.render(hiscoreValue)
        drawLives(lives);
        if (msg) {
            msgText.render(msg)
        }
    }
  });
  loop.start();

function createAsteroids(numAsteroids){
    for (var i = 0; i < numAsteroids; i++){
        sprites.push(createAsteroid(getRandomIntInRange(scrWidth - 100, 100), 100, 3));
    }
}
