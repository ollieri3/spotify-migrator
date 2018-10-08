import { Component } from '@stencil/core';
import { SpotifyService } from '../../services';
import dialogPolyfill from 'dialog-polyfill';
import 'intersection-observer'; // Polyfill for intersection observer
import '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {

  public spotifyService = new SpotifyService();

  componentDidLoad() {
    this.registerDialogs();
  }

  registerDialogs() {
    //Register polyfill for all dialogs
    const dialogs = document.querySelectorAll('dialog');
    for (let i = 0; i < dialogs.length; i++) {
      dialogPolyfill.registerDialog(dialogs[i]);
    }
  }

  render() {
    return [

      <header class="global-header">
        <stencil-route-link url="/">
          <h1 class="global-header__title">Spotify Migrator</h1>
        </stencil-route-link>
      </header>,

      <main id="main">
        <stencil-router>
          <stencil-route-switch scrollTopOffset={0}>
            <stencil-route url='/' component='app-home' exact={true} />
            <stencil-route url='/step-one' component='app-step-one' exact={true} componentProps={{ spotifyService: this.spotifyService }}></stencil-route>
            <stencil-route url='/step-two' component='app-step-two' exact={true} componentProps={{ spotifyService: this.spotifyService }}></stencil-route>
            <stencil-route url='/step-three' component='app-step-three' exact={true} componentProps={{ spotifyService: this.spotifyService }}> </stencil-route>
            <stencil-route component="app-not-found"></stencil-route>
          </stencil-route-switch>
        </stencil-router>
      </main>,

      <dialog id="authorization-dialog">
        <app-authorization-modal spotifyService={this.spotifyService}></app-authorization-modal>
      </dialog>

    ];
  }
}
