import { Component, Prop, State, Listen } from "@stencil/core";
import { RouterHistory } from '@stencil/router';
import { SpotifyService, Endpoint, SpotifyUser } from "../../services";
import { TransferForm } from "../transfer-form/app-transfer-form";
import idb, { DB, ObjectStore } from 'idb';
import { TransferProgress, LoadingProgress } from "../transfer-progress/app-transfer-progress";

export interface TransferInfo {
  transferId: string,
  from: SpotifyUser,
  transferForm: TransferForm
}

export const DBTableSchema = {
  transferInfo: {
    tableName: 'transferInfo',
    options: { keyPath: 'transferId'}
  },
  library: {
    tableName: 'library',
    options: { autoIncrement: true }
  },
  playlists: {
    tableName: 'playlists',
    options: { autoIncrement: true }
  },
  followedPlaylists: {
    tableName: 'followedPlaylists',
    options: { autoIncrement: true }
  },
  followedArtists: {
    tableName: 'followedArtists',
    options: { autoIncrement: true }
  }
}

@Component({
  tag: 'app-step-two',
  styleUrl: 'app-step-two.scss'
})
export class AppStepTwo {

  @Prop() history: RouterHistory;
  @Prop() spotifyService: SpotifyService;

  @State() userProfile: SpotifyUser;
  @State() transferStarted = false;
  @State() transferProgress: TransferProgress = { downloads: {}, downloadsAreComplete: false};

  @Listen('startTransfer') handleTransfer(event: CustomEvent) {
    this.beginTransfer(event.detail);
    this.transferStarted = true;
  }

  async componentWillLoad() {
    try {
      this.userProfile = await this.spotifyService.validateAccessToken(this.history.location.hash);
    } catch (error) {
      console.error(error);
      this.history.push('/');
    }
  }

  createDatabase(schema: any): Promise<DB> {
    return idb.open('smdb', 1, upgradeDb => {
      return Object.keys(schema).forEach(key => {
        return upgradeDb.createObjectStore(schema[key].tableName, schema[key].options)
      });
    })
  }

  async clearStoreAddItems(store: ObjectStore<any, any>, items: any[]): Promise<any> {
    await store.clear();
    items.forEach(item => store.add(item));
    return;
  }

  async downloadAlbumImages() {
    const albumWall = document.querySelector('app-album-wall');
    const albums = await this.spotifyService.getAllPaginatedItems(Endpoint.albums);
    albumWall.addAlbums(albums.map(item => item.album.images[1].url));
  }

  async storeTransferInformation(database: DB, form: TransferForm): Promise<void> {
    try {
      const transferInformation : TransferInfo = {
        transferId: `${this.userProfile.display_name.split(" ")[0]}-${this.userProfile.id}`,
        from: this.userProfile,
        transferForm: form
      };
      const transaction = database.transaction(DBTableSchema.transferInfo.tableName, 'readwrite');
      const store = transaction.objectStore(DBTableSchema.transferInfo.tableName);
      this.clearStoreAddItems(store, [transferInformation]);
      await transaction.complete;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async downloadAndStoreLibrary(database: DB): Promise<void> {
    try {
      const tracks = await this.spotifyService.getAllPaginatedItems(Endpoint.tracks, response => {
        this.updateTransferProgress('library', response);
      })
      const transaction = database.transaction(DBTableSchema.library.tableName, 'readwrite');
      const store = transaction.objectStore(DBTableSchema.library.tableName);
      this.clearStoreAddItems(store, tracks);
      await transaction.complete;
      this.updateTransferItem('library', { isComplete: true });
      return;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async downloadAndStoreArtists(database: DB): Promise<void> {
    try {
      const artists = await this.spotifyService.getAllPaginatedItems(Endpoint.artists, response => this.updateTransferProgress('artists', response));
      const transaction = database.transaction(DBTableSchema.followedArtists.tableName, 'readwrite');
      const store = transaction.objectStore(DBTableSchema.followedArtists.tableName);
      await this.clearStoreAddItems(store, artists);
      await transaction.complete;
      this.updateTransferItem('artists', { isComplete: true });
      return

    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async downloadAndStorePlaylists(database: DB, followedPlaylists: boolean, playlists: boolean): Promise<void> {

    try {

      const playlists = await this.spotifyService.getAllPaginatedItems(Endpoint.playlists, response => {
        this.updateTransferProgress('playlists', response);
      });

      let transactions: Promise<any>[] = [];

      if (followedPlaylists) {
        const playlistsToSave = playlists.filter(playlist => playlist.owner.id !== this.userProfile.id);
        const transaction = database.transaction(DBTableSchema.followedPlaylists.tableName, 'readwrite');
        const store = transaction.objectStore(DBTableSchema.followedPlaylists.tableName);
        const followedPlaylistsPromise = this.clearStoreAddItems(store, playlistsToSave).then(_ => transaction.complete);
        transactions.push(followedPlaylistsPromise);
      }

      if (playlists) {
        const playlistsToSave = playlists.filter(playlist => playlist.owner.id === this.userProfile.id);
        const transaction = database.transaction(DBTableSchema.playlists.tableName, 'readwrite');
        const store = transaction.objectStore(DBTableSchema.playlists.tableName);
        const playlistsPromise = this.clearStoreAddItems(store, playlistsToSave).then(_ => transaction.complete);
        transactions.push(playlistsPromise);
      }
      await Promise.all(transactions);
      this.updateTransferItem('playlists', { isComplete: true });
      return;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  updateTransferProgress(key: string, endpointResponse: any): TransferProgress {
    return this.updateTransferItem(key, {
      itemsDownloaded: [this.transferProgress.downloads[key].itemsDownloaded[0] + endpointResponse.items.length, endpointResponse.total]
    })
  }

  updateTransferItem(key: string, itemUpdate: LoadingProgress): TransferProgress {
    return this.transferProgress = {
      ...this.transferProgress,
      downloads: {
        ...this.transferProgress.downloads,
        [key]: {
          ...this.transferProgress.downloads[key],
          ...itemUpdate
        }
      }
    }
  }

  addTransferItem(key: string, itemUpdate: LoadingProgress): TransferProgress {
    return this.transferProgress = {
      ...this.transferProgress,
      downloads: {
        ...this.transferProgress.downloads,
        [key]: itemUpdate
      }
    }
  }

  async beginTransfer(form: TransferForm) {

    const database = await this.createDatabase(DBTableSchema);
    const transferTransactions: Promise<any>[] = [];
    transferTransactions.push(this.storeTransferInformation(database, form));

    if (form.library) {
      this.downloadAlbumImages();
      this.addTransferItem('library', {
        label: 'Library',
        itemsDownloaded: [0, -1],
        isComplete: false
      })
      transferTransactions.push(this.downloadAndStoreLibrary(database));
    }

    if (form.playlists || form.followedPlaylists) {
      this.addTransferItem('playlists', {
        label: 'Playlists',
        itemsDownloaded: [0, -1],
        isComplete: false
      })
      transferTransactions.push(this.downloadAndStorePlaylists(database, form.followedPlaylists, form.playlists));
    }

    if (form.followedArtists) {
      this.addTransferItem('artists', {
        label: 'Artists',
        itemsDownloaded: [0, -1],
        isComplete: false
      })
      transferTransactions.push(this.downloadAndStoreArtists(database));
    }

    try {
      await Promise.all(transferTransactions);
      this.transferProgress = {...this.transferProgress, downloadsAreComplete: true};
      this.continue();
    } catch (error) {
      console.error(error);
    }
  }

  continue(){
    const authDialog = document.getElementById('authorization-dialog') as HTMLDialogElement;
    authDialog.showModal();
  }

  render() {
    return [
      <section class="page">

        <div class="step-heading">
          <h1><span class="big-num">2.</span>Select items for transfer</h1>
          <app-active-user-card user={this.userProfile}></app-active-user-card>
        </div>

        {(this.transferStarted)
          ? <app-transfer-progress transferProgress={this.transferProgress}></app-transfer-progress>
          : <app-transfer-form></app-transfer-form>
        }

        { this.transferProgress.downloadsAreComplete
          ? <div class="continue-control"><button class="button" onClick={this.continue}>continue</button></div>
          : null
        }

      </section>,
      <app-album-wall></app-album-wall>
    ]
  }
}
