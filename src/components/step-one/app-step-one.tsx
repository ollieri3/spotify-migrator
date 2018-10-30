import { Component, Prop } from "@stencil/core";
import { SpotifyService } from '../../services';

@Component({
  tag: 'app-step-one',
  styleUrl: 'app-step-one.scss'
})
export class AppStepOne {

  @Prop() spotifyService: SpotifyService;

  render() {
    return (
      <section class="page">
        <h1>Step One</h1>
        <button onClick={() => this.spotifyService.authorizeUser(
          'http://localhost:3333/step-two',
          true,
          null,
          ['user-library-read', 'playlist-read-private', 'user-follow-read']
        )}>Sign in with Spotify</button>
      </section>
    )
  }


}
