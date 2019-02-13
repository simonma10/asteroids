import 'kontra'

export function createText(x, y, fontSize = 32, fillStyle = '#ffffff'){
    let textSprite = kontra.sprite({
        x: x,
        y: y,
        fontSize: fontSize,
        fillStyle: fillStyle,
        
        render: function(text) {
            this.context.save();
            //this.context.fillStyle = this.color;
            this.context.font = fontSize.toString() + 'px Vectorb';
            //this.context.textBaseline = 'middle';
            this.context.fillStyle = '#ffffff';
            this.context.fillText(text, this.x, this.y);
            this.context.restore();
        },

        update: function() {
            //this.context.fillText('Hello world', this.x, this.y)
        }
    });
    return textSprite;
}

export function centerText(text, xy, fontSize){
    return xy - ((text.toString().length / 2) * (fontSize - 8))
}

export function drawLife(x, y){
    let lifeSprite = kontra.sprite({
        x: x,
        y: y,

        render: function() {
            this.context.save();
            this.context.translate(this.x, this.y);
            
            this.context.strokeStyle = 'rgba(256,256,256,1)';
            this.context.beginPath();
            // draw a triangle
            this.context.moveTo(-3, -5);
            this.context.lineTo(3, 12);
            this.context.lineTo(-8, 12);
          
            this.context.closePath();
            this.context.stroke();
    
            this.context.restore();
        }
    })
    return lifeSprite;
}

export function drawLives(lives){
    for (let i = 0; i < lives; i++){
        let lifeSprite = drawLife(56 + (i * 24), 64);
        lifeSprite.render();
    }
}

