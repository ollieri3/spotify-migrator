import { Component } from '@stencil/core';


@Component({
  tag: 'app-not-found',
  styleUrl: 'app-not-found.scss'
})
export class AppNotFound {

  componenWillLoad() {
    console.log('not found component fired');
  }

  render() {
    return (
      <section>
        <h1>Sorry page not found</h1>
      </section>
    )
  }

}
