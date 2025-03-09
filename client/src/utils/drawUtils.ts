export const calculateDrawOffsets = (drawSize: number): [number,number,number,number] => {

  if (drawSize === 1) {

    return [0,0,1,1];
  }

  return [
    - Math.floor(drawSize/2),
    - Math.floor(drawSize/2),
    drawSize,
    drawSize
  ]
}