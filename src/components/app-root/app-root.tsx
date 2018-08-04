import { Component } from '@stencil/core';
import '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {

  render() {
    return [

      <header class="global-header">
        <h1 class="global-header__title">Spotify Migrator</h1>
      </header>,

      <main>
        <stencil-router>
          <stencil-route-switch scrollTopOffset={0}>
            <stencil-route url='/' component='app-home' exact={true} />
            <stencil-route component="app-not-found"></stencil-route>
          </stencil-route-switch>
        </stencil-router>
      </main>
    ];
  }
}
