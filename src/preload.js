import 'kontra';

let assetPath = './assets';

let audioAssets = [
    'Explosion__006.ogg',
    'Explosion__007.ogg',
    'Explosion__010.ogg',
    'Explosion2__005.ogg',
    'Explosion2__006.ogg',
    'Pew__003.ogg',
    'Pew__004.ogg',
    'Pew__007.ogg',
    'Powerup__008.ogg',
    'Punch__003.ogg',
    'Punch__005.ogg',
    'Roar__004.ogg',
    'Roar__005.ogg',
    'Space__007.ogg',
    'Space__008.ogg',
    'Space__009.ogg',
    'Teleport__009.ogg'
]

export function preload(){
    kontra.assets.audioPath = assetPath;
    kontra.assets.load(...audioAssets)
    .then(function() {
        // all assets have loaded
        console.log('All assets loaded')
    }).catch(function(err) {
        // error loading an asset
        console.log('error loading asset', err)
    });
}