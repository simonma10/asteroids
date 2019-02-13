// convert degrees to radians
export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

export function getRandomIntInRange(max, mod=0){
    return Math.random() * max + mod;
}
