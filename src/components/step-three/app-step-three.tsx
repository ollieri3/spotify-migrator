import { Component, Prop, State } from "@stencil/core";
import { SpotifyService } from '../../services';
import { RouterHistory } from "@stencil/router";

@Component({
  tag: 'app-step-three',
  styleUrl: 'app-step-three.scss'
})
export class AppStepThree {

  @Prop() history: RouterHistory;
  @Prop() spotifyService: SpotifyService;

  @State() userProfile: any;

  async componentWillLoad() {
    await this.spotifyService.validateAccessToken(this.history.location.hash)
      .then((userProfile) => this.userProfile = userProfile)
      .catch(() => this.history.push('/'));
  }

  render() {
    return (
      <section class="page">
        <h1>Building your Spotify Library</h1>
        <app-active-user-card user={this.userProfile}></app-active-user-card>
      </section>
    )
  }


}
