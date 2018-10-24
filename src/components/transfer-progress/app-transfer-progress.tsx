import { Component, Prop } from '@stencil/core';

export interface TransferProgress {
  library?: LoadingProgress,
  playlists?: LoadingProgress,
  artists?: LoadingProgress
}

export interface LoadingProgress {
  label?: string,
  itemsDownloaded?: [number, number],
  isComplete?: boolean,
}

@Component({
  tag: 'app-transfer-progress',
  styleUrl: 'app-transfer-progress.scss'
})
export class AppTransferProgress {

  @Prop() transferProgress: TransferProgress;

  render() {
    return (
      <section class="action-card">

        <h1>Downloading...</h1>

        <ul class="progress-list">
          {this.transferProgress && Object.keys(this.transferProgress)
            .map(key => {
              const loadingItem: LoadingProgress = this.transferProgress[key];
              return (
                <li class="progress-list__item">
                  {
                    (loadingItem.isComplete)
                      ? <img class="progress-list__item-status progress-list__item-status-checkmark" src="/assets/images/checkmark.svg" alt="" />
                      : <img class="progress-list__item-status progress-list__item-status-loading" src="/assets/images/oval.svg" alt="" />
                  }
                  <p class="progress-list__item-label">{loadingItem.label}</p>

                  {loadingItem.itemsDownloaded[1] > 0 &&
                    <p class="progress-list__item-downloaded">{loadingItem.itemsDownloaded[0]} / {loadingItem.itemsDownloaded[1]} </p>
                  }
                </li>
              )
            })
          }
        </ul>
      </section>
    )
  }


}
