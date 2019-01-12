import { Component, Prop, State, Listen } from "@stencil/core";
import { RouterHistory } from '@stencil/router';
import { SpotifyService, Endpoint, SpotifyUser } from "../../services";
import idb, { DB, ObjectStore } from 'idb';
import { TransferInfo, DBTableSchema } from "./app-step-two.models";
import { TransferProgress, LoadingProgress } from "../transfer-progress/app-transfer-progress.models";
import { TransferForm } from "../transfer-form/app-transfer-form.models";

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

  private transferInfo: TransferInfo;

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

  async storeTransferInformation(database: DB, form: TransferForm): Promise<TransferInfo> {
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
      return transferInformation;
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
    transferTransactions.push(this.storeTransferInformation(database, form).then( info =>
      this.transferInfo = info
    ));

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
      setTimeout(this.continue.bind(this), 500); // Allow user time to see the view change
    } catch (error) {
      console.error(error);
    }
  }

  continue(){
    const authDialog = document.getElementById('authorization-dialog') as HTMLDialogElement;
    const authComponent = document.querySelector('app-authorization-modal');
    authComponent.transferId = this.transferInfo.transferId;
    authDialog.showModal();
  }

  render() {
    return [
      <section class="page">

        {/* <div class={`step-heading ${this.transferStarted ? 'transferring' : ''}`} > */}
        <div class='step-heading'>
          <h1>What would you like to transfer?</h1>
          <app-active-user-card label="transferring from" user={this.userProfile}></app-active-user-card>
        </div>

        {(this.transferStarted)
          ? <app-transfer-progress transferProgress={this.transferProgress}></app-transfer-progress>
          : <app-transfer-form></app-transfer-form>
        }

        { this.transferProgress.downloadsAreComplete
          ? <div class="continue-control"><button class="button" onClick={this.continue.bind(this)}>continue</button></div>
          : null
        }

      </section>,
      <app-album-wall></app-album-wall>
    ]
  }
}
