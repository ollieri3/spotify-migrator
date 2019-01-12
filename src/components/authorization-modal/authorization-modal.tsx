import { Component, Prop, State, Element } from '@stencil/core';
import { SpotifyService } from '../../services';

@Component({
  tag: 'app-authorization-modal',
  styleUrl: 'authorization-modal.scss'
}) export class AppAuthorizationModal {

  @Prop() spotifyService: SpotifyService;
  @Prop() transferId:  string = '';

  @State() canContinue = false;
  @State() timeRemaining = 5;

  @Element() hostElement;

  private continueInterval: any;

  componentWillLoad() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio > 0) {
        this.startContinueInterval();
      } else {
        this.clearContinueInterval();
      }
    }, { threshold: 1.0 });
    observer.observe(this.hostElement);
  }

  startContinueInterval() {
    this.continueInterval = setInterval(() => {
      this.timeRemaining = this.timeRemaining - 1;
      if (this.timeRemaining === 0) {
        this.canContinue = true;

      }
    }, 1000);
  }

  clearContinueInterval() {
    if (this.continueInterval) {
      clearTimeout(this.continueInterval);
      this.timeRemaining = 5;
    }
  }

  componentDidUnload() {
    this.clearContinueInterval();
  }

  render() {
    return (
      <section class="authorization-info">
        <p>You'll now need to log in to the Spotify account you'd like to transfer your data to.</p>
        <p>After clicking the button below you will be directed to the Spotify authorization page, near the bottom you can click <br></br>'not you', allowing you to sign up for a new account or change to an already existing account.</p>
        <button class="button authorization-info__continue-button" disabled={!this.canContinue} onClick={() => this.spotifyService.authorizeUser(
          'http://localhost:3333/step-three',
          true,
          this.transferId,
          ['user-library-modify']
        )}>ok, let's go! {this.timeRemaining > 0 && <span>({this.timeRemaining})</span>}</button>
      </section>
    )
  }
}
