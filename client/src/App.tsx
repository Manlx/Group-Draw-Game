import styled from "styled-components";
import { useRef, useState } from "react";

import "./index.css"
import { calculateDrawOffsets } from "./utils";

const SizingButton = styled.button`
  background-color: #565656;
  color: white;
  padding: 0.5rem;
`;

const SizingLabel = styled.label`
  color: white;
`

const SizingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`

const maxDisplayedDrawingSize = 70;

const minDrawingSize = 20;

const drwaingDisplayMultiplier = 1;

type ColorInput = {
  $size: number;
};

const ColorInput = styled.input.attrs<ColorInput>({type: 'color'})`
  width:  ${({$size}) => $size * drwaingDisplayMultiplier > maxDisplayedDrawingSize ? maxDisplayedDrawingSize : $size * drwaingDisplayMultiplier < minDrawingSize ? minDrawingSize : $size * drwaingDisplayMultiplier }px;
  height: ${({$size}) => $size * drwaingDisplayMultiplier > maxDisplayedDrawingSize ? maxDisplayedDrawingSize : $size * drwaingDisplayMultiplier < minDrawingSize ? minDrawingSize : $size * drwaingDisplayMultiplier }px;
  background-color: transparent;
  padding: 0;
  margin: 0;
  border: none;
`

const CanvasDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const CanvasTools = styled.div`

  --borderStyle: solid #a26719 0.5rem;
  background-color: #7a4a0c;
  /* background-color: #352005; */
  /* background-color: #503717; */
  border-right: var(--borderStyle);
  border-top: var(--borderStyle);
  border-bottom: var(--borderStyle);
  
  display: flex;
  flex-direction: column;
  align-items: center;

  height: 30rem;
  gap: 1rem;
  padding: 1rem 1rem 1rem 0.5rem;
  border-radius: 0 1rem 1rem 0;
`

type ColorCanvasProps = {
  $backgroundColor: string
}
const ColorCanvas = styled.canvas<ColorCanvasProps>`
  
  background-color: ${({$backgroundColor}) => $backgroundColor};
`

const CanvasToolsButton = styled.button`
  
  background-color: #4a2e08;
  color: white;
  padding: 0.25rem 1rem;
  font-size: 1.5rem;
  width: 100%;
`

const wsClient = new WebSocket(`ws://${window.location.hostname}:3000`);

export const App: React.FC = () => {

  let isDrawing = false;
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [drawingSize, setDrawingSize] = useState(10);
  const [drawingColor, setDrawingColor] = useState('#FF0000');
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#AAAAAA');

  wsClient.onmessage =async function (ev) {

    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      
      const data:WSDataFormats.WebsocketMessage  = typeof ev.data === "string" ? JSON.parse(ev.data) : JSON.parse(await ev.data.text())

      if (data.messageType === 'CLEAR_CANVAS') {

        ctx.reset();
      }

      if (data.messageType === "CANVAS_DATA") {

        const image = new Image();

        image.onload = function() {

          // ctx.reset();

          ctx.drawImage(image,0,0)

          setCanvasBackgroundColor(data.backgroundColor)
        }
        image.src = data.image

        return;
      }
    }
  }

  const drawUpdate = (mouseEvent: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

    if (!isDrawing){

      return;
    }

    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {

      const x = mouseEvent.nativeEvent.offsetX
      const y = mouseEvent.nativeEvent.offsetY

      ctx.fillStyle = drawingColor

      const drawOffsets = calculateDrawOffsets(drawingSize)

      ctx.fillRect(x + drawOffsets[0], y + drawOffsets[1], drawOffsets[2], drawOffsets[3]);
    }
  }

  const resetCanvas = () => {

    const data: WSDataFormats.ClearCanvasMessage = {
      messageType: 'CLEAR_CANVAS',
    }

    wsClient.send(JSON.stringify(data))
  }

  const getData = () => {

    const ctx = canvasRef.current?.getContext("2d");

    if (ctx && canvasRef.current) {

      const data: WSDataFormats.CanvasDataMessage = {
        messageType: 'CANVAS_DATA',
        backgroundColor: canvasBackgroundColor,
        image: canvasRef.current?.toDataURL('image/png')
        // canvasData: ctx.getImageData(0,0,200,200,{colorSpace: 'srgb'}).data,
        // canvasDataB: ctx.getImageData(0,0,200,200,{colorSpace: 'srgb'})
      }

      wsClient.send(JSON.stringify(data))
    }
  }

  const canvasSize = '600px'

  return (
    <>

      <CanvasDiv>

        <ColorCanvas
          $backgroundColor={canvasBackgroundColor}
          onMouseDown={() => isDrawing = true}
          onMouseUp={() => isDrawing = false}
          onMouseMove={drawUpdate}
          width={canvasSize}
          height={canvasSize}
          ref={canvasRef}>

        </ColorCanvas>
        <CanvasTools>
          <ColorInput 
            $size={40}
            value={canvasBackgroundColor}
            onChange={(event)=>{
              setCanvasBackgroundColor(event.target.value)
            }}/>

          <CanvasToolsButton onClick={resetCanvas}>Reset</CanvasToolsButton>
          <CanvasToolsButton onClick={getData}>Send Data</CanvasToolsButton>
          
        </CanvasTools>
      </CanvasDiv>

      <SizingContainer>

        <SizingLabel>Pen Size:</SizingLabel>
        <input type="range" min={5} max={200} value={drawingSize} onChange={(e) => setDrawingSize(Number.parseInt(e.currentTarget.value))}/>
        <div>
          <SizingButton onClick={() => setDrawingSize( drawingSize - 1)}>{'<'}</SizingButton>
          <SizingButton onClick={() => setDrawingSize( drawingSize + 1)}>{'>'}</SizingButton>
        </div>
        <SizingLabel>Drawing Size: {drawingSize}</SizingLabel>
        <ColorInput 
          $size={drawingSize}
          value={drawingColor}
          onChange={(event)=>{
            setDrawingColor(event.target.value)
          }}></ColorInput>
      </SizingContainer>
    </>
  )
}

export default App
