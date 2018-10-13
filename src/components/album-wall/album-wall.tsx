import { Component, Method } from '@stencil/core';

export interface AlbumGrid {
  columns: number,
  rows: number,
  albumWidth: number,
  leftoverWidth: number
}

export interface CanvasPosition {
  x: number,
  y: number
}

export interface AlbumWallReferences {
  canvasContext: CanvasRenderingContext2D,
  albumCanvasEl: HTMLCanvasElement,
  mainEl: HTMLElement
}

export interface AlbumWallConfiguration {
  grid: AlbumGrid,
  coords: CanvasPosition[]
}

@Component({
  tag: 'app-album-wall',
  styleUrl: './album-wall.scss'
})
export class AppAlbumWall {

  private albums: { image: HTMLImageElement, width: number, height: number, src: string }[] = [];
  private albumWallReferences: AlbumWallReferences;
  private resizeListenerReference;
  private timeoutReference;

  componentDidLoad() {
    window.requestAnimationFrame(() => {
      this.albumWallReferences = this.setupCanvas();
    })

    this.resizeListenerReference = this.resizeListener.bind(this);
    window.addEventListener('resize', this.resizeListenerReference);
  }

  resizeListener() {
    if (this.timeoutReference) this.timeoutReference = clearInterval(this.timeoutReference);
    this.timeoutReference = setTimeout(() => {
      this.setupCanvas();
      this.addAlbums([]);
    }, 500);
  }

  @Method() addAlbums(albums: string[]) {

    albums = [...new Set(albums)];
    albums = albums.filter(albumSrc => this.albums.findIndex(album => album.src === albumSrc) === -1);

    const { grid, coords } = this.recalculateCanvasSize(albums.length + this.albums.length);
    const { canvasContext } = this.albumWallReferences;

    this.albums.forEach((album, idx) => {
      canvasContext.drawImage(album.image, coords[idx].x, coords[idx].y, grid.albumWidth, grid.albumWidth);
    })

    albums.forEach(albumSrc => {
      this.createImage(albumSrc, grid.albumWidth).then(imageData => {
        const idx = this.albums.push(imageData) - 1;
        canvasContext.drawImage(imageData.image, coords[idx].x, coords[idx].y, grid.albumWidth, grid.albumWidth);
      })
    })
  }


  setupCanvas(): AlbumWallReferences {
    if (this.albumWallReferences) {
      const { canvasContext, albumCanvasEl } = this.albumWallReferences;
      canvasContext.clearRect(0, 0, albumCanvasEl.width, albumCanvasEl.height);
    }

    const main = document.getElementById('main');
    const albumCanvas = document.getElementById('album-canvas') as HTMLCanvasElement;

    albumCanvas.height = main.clientHeight;
    albumCanvas.width = main.offsetWidth;

    return {
      canvasContext: albumCanvas.getContext('2d'),
      albumCanvasEl: albumCanvas,
      mainEl: main
    }
  }

  recalculateCanvasSize(numberOfItems): AlbumWallConfiguration {

    const { albumCanvasEl, canvasContext } = this.albumWallReferences;

    canvasContext.clearRect(0, 0, albumCanvasEl.width, albumCanvasEl.height);

    const grid = this.calculateAlbumGridSize(numberOfItems, albumCanvasEl.width, albumCanvasEl.height);

    const albumCanvasSidePadding = grid.leftoverWidth / 2;

    albumCanvasEl.style.padding = `${albumCanvasSidePadding}px`;

    return {
      grid,
      coords: this.calculateArtworkCoordinates(grid, numberOfItems)
    }
  }

  calculateAlbumGridSize(numberOfAlbums, containerWidth, containerHeight): AlbumGrid {
    const containerArea = containerWidth * containerHeight;
    const maxAreaOfAlbum = containerArea / numberOfAlbums;

    const maxWidthOfAlbum = Math.sqrt(maxAreaOfAlbum);

    const rowSize = Math.ceil(containerWidth / maxWidthOfAlbum);
    const columnSize = Math.ceil(containerHeight / maxWidthOfAlbum);

    const albumWidth = Math.floor(Math.min(containerWidth / rowSize, containerHeight / columnSize));

    const columns = Math.floor(containerWidth / albumWidth);
    const rows = Math.floor(containerHeight / albumWidth);

    return {
      columns,
      rows,
      albumWidth,
      leftoverWidth: containerWidth - albumWidth * columns
    };
  }

  calculateArtworkCoordinates(grid: AlbumGrid, items: number): CanvasPosition[] {
    const coords = [];
    for (let i = 0; i < items; i++) {
      const coordinate = {
        y: grid.albumWidth * Math.floor(coords.length / grid.columns),
        x: grid.albumWidth * (coords.length % grid.columns)
      };
      coords.push(coordinate);
    }
    return coords;
  }

  createImage(src: string, size: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const image = new Image(64, 64);
      image.src = src;
      image.onload = () => {
        resolve({ image, width: size, height: size, src });
      }
      image.onerror = () => {
        reject();
      }
    })
  }

  componentDidUnload() {
    window.removeEventListener('resize', this.resizeListenerReference);
  }

  render() {
    return <canvas id="album-canvas"></canvas>
  }

}
