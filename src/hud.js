import 'kontra'

export function createText(x, y, fontSize = 32, fillStyle = '#ffffff', text = ''){
    let textSprite = kontra.sprite({
        x: x,
        y: y,
        text: text,
        fontSize: fontSize,
        fillStyle: fillStyle,
        animate: false,
        alpha: 1,
        
        render: function() {
            this.context.save();
            //this.context.fillStyle = this.color;
            this.context.font = fontSize.toString() + 'px Vectorb';
            //this.context.textBaseline = 'middle';
            this.context.fillStyle = 'rgba(255,255,255,' + this.alpha.toString() + ')' ;
            this.context.fillText(this.text, this.x, this.y);
            this.context.restore();
        },

        update: function() {
            this.context.save();
            //this.context.fillStyle = this.color;
            this.context.font = fontSize.toString() + 'px Vectorb';
            //this.context.textBaseline = 'middle';
            //this.context.fillStyle = '#ffffff';
            if (this.animate === true){
                if(this.alpha > 0){
                    this.alpha -= 0.02;
                } else {
                    this.alpha = 1;
                }
            }
            this.context.fillStyle = 'rgba(255,255,255,' + this.alpha.toString() + ')' ;
            this.context.fillText(this.text, this.x, this.y);
            this.context.restore();
            
        },

        setText: function(text) {
            this.text = text.toString();
            //this.x = centerText(this.text, this.x, this.fontSize);
            this.update();
        },

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

