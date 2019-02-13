import 'kontra';
import {getRandomIntInRange} from './helpers'

export const ASTEROID_SCORES = [0,300,200,100];

export function createAsteroid(x, y, size) {
    let asteroid = kontra.sprite({    
        x: x,
        y: y,
        radius: size * 10,
        dx: getRandomIntInRange(4, -2),
        dy: getRandomIntInRange(4, -2),
        ttl: Infinity,
        type: 'asteroid',
        size: size,
        shape: '',
        shapes: [ 'Ê', 'Ë', 'Ì', 'Í',  'Ï',  'Î'],
        idx: Math.floor(getRandomIntInRange(5,0)),
        render() {
            let fontSize = 22 * this.size;
            this.context.save();
           
            this.context.textBaseline = 'middle';
            this.context.textAlign = 'center';
            this.context.fillStyle = 'rgba(256,256,256,0.5)';
            // Vector Battle Font has multiple asteroid shapes attached to extended Latin character set
            // https://www.fontspace.com/freaky-fonts/vector-battle/5167/charmap
            // Ê Ë Ì Í Ï Î
            switch (this.size){
                case 3:
                case 2:
                case 1:
                    this.shape = this.shapes[this.idx];
                    break;
                default:
                    this.ttl = 0;
                    this.shape = ''
                    break;
            }
            this.context.font = fontSize.toString() + 'px Vectorb'//'64px Vectorb';
            this.context.fillText(this.shape, this.x, this.y);
          
            //this.context.strokeStyle = 'rgba(256,0,0,0.5)';   // Debug: show hitbox around asteroid
            this.context.strokeStyle = 'rgba(256,0,0,0)';

            this.context.beginPath();  // start drawing a shape
            this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            this.context.stroke();     // outline the circle 
            this.context.restore();
        }
    });
    return asteroid;
}