import { Component } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss'
})
export class AppHome {

  render() {
    return (
      <section class="page">

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin odio orci, suscipit consequat odio eu, dictum efficitur nunc. Ut efficitur nulla sem, a malesuada libero vulputate nec. Nam tincidunt tincidunt condimentum. Duis sed odio sed nunc dictum imperdiet. Praesent auctor elit eu augue eleifend, a porttitor mauris blandit.
        </p>

        <stencil-route-link url="/step-one" anchorClass="button">Get Started</stencil-route-link>

      </section>
    );
  }
}
