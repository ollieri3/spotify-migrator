import { Component, Prop, State, Listen } from "@stencil/core";
import { RouterHistory } from '@stencil/router';
import { SpotifyService, Endpoint } from "../../services";
import { TransferForm } from "../app-transfer-form/app-transfer-form";
import idb, { DB } from 'idb';

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

  async createDatabase(form: TransferForm): Promise<DB> {
    return idb.open('smdb', 1, upgradeDb => {
      return Object.keys(form).forEach(key => {
        return upgradeDb.createObjectStore(key, { autoIncrement: true })
      });
    })
  }

  async beginTransfer(form: TransferForm) {

    const database = await this.createDatabase(form);
    const transferTransactions: Promise<any>[] = [];

    if (form.library) {

      const libraryPromise = new Promise((resolve, reject) => {
        this.spotifyService.getAllPaginatedItems(Endpoint.tracks).then(tracks => {
          const transaction = database.transaction('library', 'readwrite')
          const store = transaction.objectStore('library');
          tracks.forEach(track => store.add(track));
          transaction.complete
            .then(() => resolve())
            .catch(() => reject())
        })
      })
      transferTransactions.push(libraryPromise);
    }

    // if (form.playlists || form.followedPlaylists) {
    //   this.spotifyService.getAllPaginatedItems('https://api.spotify.com/v1/me/playlists')
    //     .then(playlists => console.log('All playlists: ', playlists));
    // }

    // if (form.followedArtists) {
    //   this.spotifyService.getAllPaginatedItems('https://api.spotify.com/v1/me/following?type=artist')
    // }

    Promise.all(transferTransactions).then(values => {
      console.log('All transactions complete', values);
    })

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
