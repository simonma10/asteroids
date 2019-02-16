import 'kontra';

import {getRandomIntInRange} from './helpers'

export const SAUCER_SCORES = [0,500,250];
export const SFX_SAUCER_FIRE = 'Pew__007'

export function createSaucer(x, y, size){
    let saucer = kontra.sprite({
        x: x,
        y: y,
        dx: getRandomIntInRange(4, -2),
        dy: getRandomIntInRange(4, -2),
        dt: 0,
        size: size,
        radius: size * 10,
        type: 'saucer',
        ttl: Infinity,
        bullets: [],

        render() {
            let fontSize = 22 * this.size;

            this.context.save();
           
            this.context.textBaseline = 'middle';
            this.context.textAlign = 'center';
            this.context.fillStyle = 'rgba(256,256,256,0.5)';
            // Vector Battle Font has multiple asteroid shapes attached to extended Latin character set
            // https://www.fontspace.com/freaky-fonts/vector-battle/5167/charmap
            
            this.shape='Ç' // saucer shape

            this.context.font = fontSize.toString() + 'px Vectorb'//'64px Vectorb';
            this.context.fillText(this.shape, this.x, this.y);
          
            //this.context.strokeStyle = 'rgba(256,0,0,0.5)';   // Debug: show hitbox around asteroid
            this.context.strokeStyle = 'rgba(256,0,0,0)';

            this.context.beginPath();  // start drawing a shape
            this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            this.context.stroke();     // outline the circle 
            this.context.restore();
        },
        update() {
            this.advance();
            this.dt += 1;
            if (this.dt >= 60){
                let saucerBullet = kontra.sprite({
                    x: this.x,
                    y: this.y,
                    dx: this.dx + getRandomIntInRange(4, -2),
                    dy: this.dy + getRandomIntInRange(4, -2),
                    // live only 50 frames
                    ttl: 80,
                    // bullets are small
                    width: 2,
                    height: 2,
                    radius: 8,
                    color: 'white',
                    type: 'saucerBullet',
                    update() {
                        this.advance();
                    }
                }) 
                kontra.assets.audio[SFX_SAUCER_FIRE].play();
                this.dt = 0;
                this.bullets.push(saucerBullet);
            }
        }



    })
    return saucer;
}