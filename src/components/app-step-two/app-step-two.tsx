import { Component, Prop, State, Listen } from "@stencil/core";
import { RouterHistory } from '@stencil/router';
import { SpotifyService } from "../../services";
import { TransferForm } from "../app-transfer-form/app-transfer-form";

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

  beginTransfer(form: TransferForm) {

    if (form.library) {
      this.spotifyService.getAllPaginatedItems('https://api.spotify.com/v1/me/tracks')
        .then(tracks => console.log('All tracks: ', tracks));
    }

    if (form.playlists || form.followedPlaylists) {
      this.spotifyService.getAllPaginatedItems('https://api.spotify.com/v1/me/playlists')
        .then(playlists => console.log('All playlists: ', playlists));
    }

    if (form.followedArtists) {
      this.spotifyService.getAllPaginatedItems('https://api.spotify.com/v1/me/following?type=artist')
    }
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
