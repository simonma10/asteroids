import 'kontra';
import {degreesToRadians} from './helpers'

const SFX_SHIP_FIRE = 'Pew__004'; //003
const SFX_SHIP_THRUSTER = 'Punch__005';

export function createShip(x, y){
    let ship = kontra.sprite({
        x: x,
        y: y,
        width: 6,  // we'll use this later for collision detection
        rotation: 0,
        dt: 0,
        ttl: Infinity,
        type: 'ship',
        
        bulletPool: kontra.pool({
            create: kontra.sprite  // create a new sprite every time the pool needs new objects
          }),
        thruster: false,
    
        render() {
            //this.bullets.forEach(bullet => {
             //   bullet.render();
            //});
            this.context.save();    // have to do this when rotating sprites, otherwise entire context rotates...
    
            // transform the origin and rotate around it 
            // using the ships rotation
            this.context.translate(this.x, this.y);
            this.context.rotate(degreesToRadians(this.rotation));
            
            this.context.strokeStyle = 'rgba(256,256,256,1)';
            this.context.beginPath();
            // draw a triangle
            this.context.moveTo(-3, -5);
            this.context.lineTo(-2,-2);
            this.context.lineTo(-2, 2);
            this.context.lineTo(-3, 5)
            this.context.lineTo(12, 0);
          
            this.context.closePath();
            this.context.stroke();

            if (this.thruster === true){
                this.context.strokeStyle = 'rgba(256, 192, 192, 1)';
                this.context.beginPath();
                this.context.moveTo(-5, -2);
                this.context.lineTo(-10, 0);
                this.context.lineTo(-5, 2);
                this.context.closePath();
                this.context.stroke();

            }
            
            this.context.restore();
        },
        update() {
            //this.bullets.forEach(bullet => {
            //    bullet.update();
            //});
            if (kontra.keys.pressed('left')){
                this.rotation += -4;
            } else if (kontra.keys.pressed('right')){
                this.rotation += 4;
            }
    
            // move the ship forward in the direction it's facing
            const cos = Math.cos(degreesToRadians(this.rotation));
            const sin = Math.sin(degreesToRadians(this.rotation));
            if (kontra.keys.pressed('up')) {
                this.ddx = cos * 0.1;
                this.ddy = sin * 0.1;
                this.thruster = true;
                kontra.assets.audio[SFX_SHIP_THRUSTER].play();
            } else {
                this.thruster = false;
                this.ddx = this.ddy = 0;
            }
            this.advance();
    
             // set a max speed
            const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (magnitude > 10) {
                this.dx *= 0.95;
                this.dy *= 0.95;
            }
    
            // allow the player to fire no more than 1 bullet every 1/4 second
            this.dt += 1/60;
            if (kontra.keys.pressed('space') && this.dt > 0.25) {
                this.dt = 0;

                this.bulletPool.get({
                    type: 'bullet',
                    // start the bullet on the ship at the end of the triangle
                    x: this.x + cos * 12,
                    y: this.y + sin * 12,
                    // move the bullet slightly faster than the ship
                    dx: this.dx + cos * 5,
                    dy: this.dy + sin * 5,
                    // live only 50 frames
                    ttl: 50,
                    // bullets are small
                    width: 2,
                    height: 2,
                    color: 'white'
                })

                /*
                let bullet = kontra.sprite({
                    type: 'bullet',
                    // start the bullet on the ship at the end of the triangle
                    x: this.x + cos * 12,
                    y: this.y + sin * 12,
                    // move the bullet slightly faster than the ship
                    dx: this.dx + cos * 5,
                    dy: this.dy + sin * 5,
                    // live only 50 frames
                    ttl: 30,
                    // bullets are small
                    width: 2,
                    height: 2,
                    color: 'white',
                    update() {
                        this.advance();
                        console.log('bullet' + this.ttl.toString())
                    }
                });
                this.bullets.push(bullet);
                */
                kontra.assets.audio[SFX_SHIP_FIRE].play();
            }
            //this.bullets.filter(sprite => sprite.ttl > 0);
        }
        
      });
      return ship;
}