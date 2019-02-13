import 'kontra'
import {getRandomIntInRange} from './helpers';

export function createParticle(x, y, ttl = 80, color = ''){
    //let ParticleAxisVariance = getValueInRange(-5, 5)

    //let cos = Math.cos(degreesToRadians(angle + ParticleAxisVariance))
    //let sin = Math.sin(degreesToRadians(angle + ParticleAxisVariance))

    let particle = kontra.sprite({
        type: 'particle',
        x: x,
        y: y,
        dx: getRandomIntInRange(6, -3), //dx - cos * 4,
        dy: getRandomIntInRange(6, -3), //dy - sin * 4,

        ttl: ttl, //getValueInRange(20, ttl),
        dt: 0,
        color: color,
        colorString: getRandomIntInRange(128,128).toString() + "," + getRandomIntInRange(128,0).toString() + "0,",

        width: 2,
        update(){
            this.dt += 1/60
            this.advance()
        },
        render(){
            let frames = this.dt * 60
            let alpha = 1 - frames / this.ttl
            //let size = (1 + 0.5 * frames / this.ttl) * this.width
            let size = 2;
            //this.context.fillStyle = 'white' //Color.rgba(color.r, color.g, color.b, alpha)
            //this.context.fillRect(this.x, this.y, size, size)

            if (color !== ''){
                this.context.strokeStyle = "rgba(" + this.color + alpha + ")";
            } else {
                this.context.strokeStyle = "rgba(" + this.colorString + alpha + ")";
            }

            this.context.beginPath();  // start drawing a shape
            this.context.arc(this.x, this.y, getRandomIntInRange(1.5), 0, Math.PI*2);
            this.context.stroke();     // outline the circle 
        }
    });
    return particle;
}


