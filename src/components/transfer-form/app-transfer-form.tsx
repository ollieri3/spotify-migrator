import { Component, State, Event } from '@stencil/core';
import { EventEmitter } from '@stencil/state-tunnel/dist/types/stencil.core';

export interface TransferForm {
  library: boolean,
  playlists: boolean,
  followedPlaylists: boolean,
  followedArtists: boolean
}

@Component({
  tag: 'app-transfer-form',
  styleUrl: 'app-transfer-form.scss'
})
export class AppTransferForm {

  @State() transferForm: TransferForm = {
    library: false,
    playlists: false,
    followedPlaylists: false,
    followedArtists: false,
  }

  @Event() startTransfer: EventEmitter

  startTransferHandler() {
    this.startTransfer.emit(this.transferForm);
  }

  toggleFormChange(value: string) {
    this.transferForm[value] = !this.transferForm[value];
    this.transferForm = Object.assign({}, this.transferForm);
  }

  checkForSelectedItems(formState) {
    return Object.keys(formState).map(key => formState[key]).some(transferFormItem => transferFormItem === true);
  }

  render() {
    return (
      <section class="action-card">

        <form class="transfer-form">
          <ul class="transfer-form__list">

            <li class={"transfer-form__list-item" + (this.transferForm.library === true ? " active" : '')} onClick={() => this.toggleFormChange('library')}>
              <input id="saved-albums" type="checkbox" checked={this.transferForm.library} onChange={() => this.toggleFormChange('library')} />
              <label class="transfer-form__list-label" htmlFor="saved-albums">Library (songs & albums)</label>
            </li>

            <li class={"transfer-form__list-item" + (this.transferForm.playlists === true ? " active" : '')} onClick={() => this.toggleFormChange('playlists')}>
              <input id="private-playlists" type="checkbox" checked={this.transferForm.playlists} onChange={() => this.toggleFormChange('playlists')} />
              <label htmlFor="private-playlists">Playlists</label>
            </li>

            <li class={"transfer-form__list-item" + (this.transferForm.followedPlaylists === true ? " active" : '')} onClick={() => this.toggleFormChange('followedPlaylists')}>
              <input id="followed-playlists" type="checkbox" checked={this.transferForm.followedPlaylists} onChange={() => this.toggleFormChange('followedPlaylists')} />
              <label htmlFor="followed-playlists">Followed playlists</label>
            </li>

            <li class={"transfer-form__list-item" + (this.transferForm.followedArtists === true ? " active" : '')} onClick={() => this.toggleFormChange('followedArtists')}>
              <input id="followed-artists" type="checkbox" checked={this.transferForm.followedArtists} onChange={() => this.toggleFormChange('followedArtists')} />
              <label htmlFor="followed-artists">Followed artists</label>
            </li>
          </ul>
        </form>

        <button class="button" onClick={() => this.startTransferHandler()} disabled={!this.checkForSelectedItems(this.transferForm)}>Transfer</button>

      </section>
    )
  }


}
