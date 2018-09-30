import { Component, Prop, State, Listen } from "@stencil/core";
import { RouterHistory } from '@stencil/router';
import { SpotifyService, Endpoint } from "../../services";
import { TransferForm } from "../app-transfer-form/app-transfer-form";
import idb, { DB, ObjectStore } from 'idb';
import { TransferProgress, LoadingProgress } from "../app-transfer-progress/app-transfer-progress";

export const DBTableSchema = {
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

  @State() userProfile: any;
  @State() transferStarted = false;
  @State() transferProgress: TransferProgress;

  @Listen('startTransfer') handleTransfer(event: CustomEvent) {
    this.beginTransfer(event.detail);
    this.transferStarted = true;
  }

  async componentWillLoad() {
    await this.spotifyService.validateAccessToken(this.history.location.hash)
      .then((userProfile) => this.userProfile = userProfile)
      .catch(() => this.history.push('/'));
  }

  async createDatabase(schema: any): Promise<DB> {
    return idb.open('smdb', 1, upgradeDb => {
      return Object.keys(schema).forEach(key => {
        return upgradeDb.createObjectStore(schema[key].tableName, schema[key].options)
      });
    })
  }

  clearStoreAddItems(store: ObjectStore<any, any>, items: any[]): Promise<any> {
    return store.clear().then(() => {
      items.forEach(item => store.add(item));
    })
  }

  downloadAndStoreLibrary(database: DB): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.spotifyService.getAllPaginatedItems(Endpoint.tracks, (response) => this.updateTransferProgress('library', response)).then(tracks => {
        const transaction = database.transaction(DBTableSchema.library.tableName, 'readwrite');
        const store = transaction.objectStore(DBTableSchema.library.tableName);
        this.clearStoreAddItems(store, tracks).then(() => {
          transaction.complete
            .then(() => {
              this.updateTransferItem('library', { isComplete: true });
              resolve()
            })
            .catch(() => reject())
        })
      })
    })
  }

  downloadAndStoreArtists(database: DB): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.spotifyService.getAllPaginatedItems(
        Endpoint.artists, (response) => this.updateTransferProgress('artists', response)).then(artists => {

          const transaction = database.transaction(DBTableSchema.followedArtists.tableName, 'readwrite');
          const store = transaction.objectStore(DBTableSchema.followedArtists.tableName);
          this.clearStoreAddItems(store, artists).then(() => {
            transaction.complete
              .then(() => {
                this.updateTransferItem('artists', { isComplete: true });
                resolve()
              })
              .catch(() => reject())
          });
        });
    })
  }

  downloadAndStorePlaylists(database: DB, followedPlaylists: boolean, playlists: boolean): Promise<undefined> {
    return new Promise((resolve, reject) => {

      const transactions: Promise<any>[] = [];

      this.spotifyService.getAllPaginatedItems(Endpoint.playlists, (response) => this.updateTransferProgress('playlists', response)).then(playlists => {

        if (followedPlaylists) {
          const playlistsToSave = playlists.filter(playlist => playlist.owner.id !== this.userProfile.id);
          const transaction = database.transaction(DBTableSchema.followedPlaylists.tableName, 'readwrite');
          const store = transaction.objectStore(DBTableSchema.followedPlaylists.tableName);

          const followedPlaylistsPromise = new Promise((res, rej) => {
            this.clearStoreAddItems(store, playlistsToSave).then(() => {
              transaction.complete
                .then(() => res())
                .catch(() => rej())
            })
          })
          transactions.push(followedPlaylistsPromise);
        }

        if (playlists) {
          const playlistsToSave = playlists.filter(playlist => playlist.owner.id === this.userProfile.id);
          const transaction = database.transaction(DBTableSchema.playlists.tableName, 'readwrite');
          const store = transaction.objectStore(DBTableSchema.playlists.tableName);

          const playlistsPromise = new Promise((res, rej) => {
            this.clearStoreAddItems(store, playlistsToSave).then(() => {
              transaction.complete
                .then(() => res())
                .catch(() => rej())
            })
          })
          transactions.push(playlistsPromise);
        }

        Promise.all(transactions)
          .then(() => {
            this.updateTransferItem('playlists', { isComplete: true });
            return resolve();
          })
          .catch(() => reject());
      })
    })
  }

  updateTransferProgress(key: string, endpointResponse: any): TransferProgress {
    return this.updateTransferItem(key, {
      itemsDownloaded: [this.transferProgress[key].itemsDownloaded[0] + endpointResponse.items.length, endpointResponse.total]
    })
  }

  updateTransferItem(key: string, itemUpdate: LoadingProgress): TransferProgress {
    return this.transferProgress = {
      ...this.transferProgress,
      [key]: {
        ...this.transferProgress[key],
        ...itemUpdate
      }
    }
  }

  addTransferItem(key: string, itemUpdate: LoadingProgress): TransferProgress {
    return this.transferProgress = {
      ...this.transferProgress,
      [key]: itemUpdate
    }
  }

  async beginTransfer(form: TransferForm) {

    const database = await this.createDatabase(DBTableSchema);
    const transferTransactions: Promise<any>[] = [];

    if (form.library) {
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

    Promise.all(transferTransactions).then(_ => {
      console.log('All transactions complete');
      const authDialog: any = document.getElementById('authorization-dialog');
      authDialog.showModal();
    });
  }

  render() {
    return (
      <section class="page">
        <div class="step-heading">
          <h1><span class="big-num">2.</span>Select items for transfer</h1>
          <app-active-user-card user={this.userProfile}></app-active-user-card>
        </div>

        {(this.transferStarted)
          ? <app-transfer-progress transferProgress={this.transferProgress}></app-transfer-progress>
          : <app-transfer-form></app-transfer-form>
        }
      </section>
    )
  }


}
