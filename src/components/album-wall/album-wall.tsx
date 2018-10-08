import { Component, Element, Method } from '@stencil/core';

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

export interface AlbumWallConfiguration {
  context: CanvasRenderingContext2D,
  grid: AlbumGrid,
  coords: CanvasPosition[]
}

@Component({
  tag: 'app-album-wall',
  styleUrl: './album-wall.scss'
})
export class AppAlbumWall {

  @Element() albumWall;

  private albums: HTMLImageElement[] = [];
  private albumWallConfiguration: AlbumWallConfiguration;
  private resizeListenerReference;
  private timeoutReference;

  @Method() setupAlbumWall(size: number): Function {
    this.albumWallConfiguration = this.setupCanvas(size);
    return this.addAlbums.bind(this);
  }

  componentDidLoad() {

    // window.requestAnimationFrame(() => {
    //   this.setupCanvas(albums.length);
    // })

    this.resizeListenerReference = this.resizeListener.bind(this);
    window.addEventListener('resize', this.resizeListenerReference);

  }

  resizeListener() {
    if (this.timeoutReference) this.timeoutReference = clearInterval(this.timeoutReference);
    this.timeoutReference = setTimeout(() => {
      // this.setupCanvas(albums.length);
      // clear canvas if created an add item
    }, 500);
  }

  addAlbums(albums: string[]) {

    const { context, grid, coords } = this.albumWallConfiguration;

    albums.forEach(album => {
      this.createImage(album, grid.albumWidth).then(imageData => {
        const idx = this.albums.push(imageData) - 1;
        context.drawImage(imageData.image, coords[idx].x, coords[idx].y, grid.albumWidth, grid.albumWidth);
      })
    })

    // this.albums.then(albums => {
    //   albums.forEach((album, idx) => {
    //     this.createImage(album).then(imageData => {
    //       ctx.drawImage(imageData.image, coords[idx].x, coords[idx].y, grid.albumWidth, grid.albumWidth);
    //     })
    //   })
    // })
  }

  setupCanvas(albumsAmount: number): { context: CanvasRenderingContext2D, grid: AlbumGrid, coords: CanvasPosition[] } {

    console.log('setup fired');

    const main = document.getElementById('main');
    const albumCanvas = document.getElementById('album-canvas') as HTMLCanvasElement;

    albumCanvas.height = main.scrollHeight;
    albumCanvas.width = main.offsetWidth;

    const grid = this.calculateAlbumGridSize(albumsAmount, albumCanvas.width, albumCanvas.height);

    const albumCanvasSidePadding = grid.leftoverWidth / 2;
    albumCanvas.style.padding = `${albumCanvasSidePadding}px ${albumCanvasSidePadding}px 0px ${albumCanvasSidePadding}px`;

    return {
      context: albumCanvas.getContext('2d'),
      grid,
      coords: this.calculateArtworkCoordinates(grid, albumsAmount)
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
        resolve({ image, width: size, height: size });
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
