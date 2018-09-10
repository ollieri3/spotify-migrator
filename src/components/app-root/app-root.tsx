import { Component } from '@stencil/core';
import { SpotifyService } from '../../services';
import '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {

  public spotifyService = new SpotifyService();

  render() {
    return [

      <header class="global-header">
        <stencil-route-link url="/">
          <h1 class="global-header__title">Spotify Migrator</h1>
        </stencil-route-link>
      </header>,

      <main>
        <stencil-router>
          <stencil-route-switch scrollTopOffset={0}>
            <stencil-route url='/' component='app-home' exact={true} />
            <stencil-route url='/step-one' component='app-step-one' exact={true} componentProps={{ spotifyService: this.spotifyService }}></stencil-route>
            <stencil-route url='/step-two' component='app-step-two' exact={true} componentProps={{ spotifyService: this.spotifyService }}></stencil-route>
            <stencil-route component="app-not-found"></stencil-route>
          </stencil-route-switch>
        </stencil-router>
      </main>
    ];
  }
}
