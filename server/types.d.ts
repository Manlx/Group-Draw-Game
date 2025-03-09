namespace WSDataFormats {

  type CanvasDataMessage = {
    messageType: 'CANVAS_DATA',
    backgroundColor: string,
    image: string
  }

  type ClearCanvasMessage = {
    messageType: 'CLEAR_CANVAS'
  }

  type WebsocketMessage = ClearCanvasMessage | CanvasDataMessage
}