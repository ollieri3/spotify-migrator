import { Component, Prop, State, Listen } from "@stencil/core";
import { RouterHistory } from '@stencil/router';
import { SpotifyService, Endpoint } from "../../services";
import { TransferForm } from "../app-transfer-form/app-transfer-form";
import idb, { DB, ObjectStore } from 'idb';

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

  @Listen('startTransfer') handleTransfer(event: CustomEvent) {
    this.beginTransfer(event.detail);
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
      this.spotifyService.getAllPaginatedItems(Endpoint.tracks).then(tracks => {
        const transaction = database.transaction(DBTableSchema.library.tableName, 'readwrite');
        const store = transaction.objectStore(DBTableSchema.library.tableName);
        this.clearStoreAddItems(store, tracks).then(() => {
          transaction.complete
            .then(() => resolve())
            .catch(() => reject())
        })
      })
    })
  }

  downloadAndStoreArtists(database: DB): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.spotifyService.getAllPaginatedItems(Endpoint.artists).then(artists => {
        const transaction = database.transaction(DBTableSchema.followedArtists.tableName, 'readwrite');
        const store = transaction.objectStore(DBTableSchema.followedArtists.tableName);
        this.clearStoreAddItems(store, artists).then(() => {
          transaction.complete
            .then(() => resolve())
            .catch(() => reject())
        });
      });
    })
  }

  downloadAndStorePlaylists(database: DB, followedPlaylists: boolean, playlists: boolean): Promise<undefined> {
    return new Promise((resolve, reject) => {

      const transactions: Promise<any>[] = [];

      this.spotifyService.getAllPaginatedItems(Endpoint.playlists).then(playlists => {

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
          .then(() => resolve())
          .catch(() => reject());
      })
    })
  }

  async beginTransfer(form: TransferForm) {

    const database = await this.createDatabase(DBTableSchema);
    const transferTransactions: Promise<any>[] = [];

    if (form.library) {
      transferTransactions.push(this.downloadAndStoreLibrary(database));
    }

    if (form.followedArtists) {
      transferTransactions.push(this.downloadAndStoreArtists(database));
    }

    if (form.playlists || form.followedPlaylists) {
      transferTransactions.push(this.downloadAndStorePlaylists(database, form.followedPlaylists, form.playlists));
    }

    Promise.all(transferTransactions).then(_ => console.log('All transactions complete'));
  }

  render() {
    return (
      <section class="page">

        <div class="step-heading">
          <h1><span class="big-num">2.</span>What would you like to transfer?</h1>
          <app-active-user-card user={this.userProfile}></app-active-user-card>
        </div>

        <app-transfer-form></app-transfer-form>

      </section>
    )
  }


}
