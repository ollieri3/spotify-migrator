import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-active-user-card',
  styleUrl: 'app-active-user-card.scss'
}) export class AppActiveUserCard {

  @Prop() user: any;

  render() {
    return (
      <div class="user-card">

        <figure class="user-card__profile-img">
          <img src={this.user ? this.user.images[0].url : ''} alt="" />
        </figure>

        <div class="user-card__profile-info">
          <p>transferring from: </p>
          <h4>{this.user ? this.user.display_name : ''}</h4>
        </div>
      </div>
    )
  }

}
