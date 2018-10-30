import { Component, Prop } from '@stencil/core';
import { SpotifyUser } from '../../services';

@Component({
  tag: 'app-active-user-card',
  styleUrl: 'app-active-user-card.scss'
}) export class AppActiveUserCard {

  @Prop() label: string;
  @Prop() user: SpotifyUser;

  render() {
    return (
      <div class="user-card">

        <figure class="user-card__profile-img">
          <img src={this.user && this.user.images.length ? this.user.images[0].url : ''} alt="" />
        </figure>

        <div class="user-card__profile-info">
          <p>{this.label}</p>
          <h4>{this.user ? this.user.display_name : ''}</h4>
        </div>
      </div>
    )
  }

}
