interface AlbumGrid {
  columns: number,
  rows: number,
  albumWidth: number,
  leftoverWidth: number,
  leftoverHeight: number
}

interface CanvasPosition {
  x: number,
  y: number
}

interface AlbumWallReferences {
  canvasContext: CanvasRenderingContext2D,
  albumCanvasEl: HTMLCanvasElement,
  mainEl: HTMLElement
}

interface AlbumWallConfiguration {
  grid: AlbumGrid,
  coords: CanvasPosition[]
}

export {
  AlbumGrid,
  CanvasPosition,
  AlbumWallReferences,
  AlbumWallConfiguration
};
