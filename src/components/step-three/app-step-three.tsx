import { Component, Prop, State } from "@stencil/core";
import { SpotifyService, SpotifyUser } from '../../services';
import { RouterHistory } from "@stencil/router";
import idb from 'idb';
import { TransferInfo, DBTableSchema } from "../step-two/app-step-two.models";

@Component({
  tag: 'app-step-three',
  styleUrl: 'app-step-three.scss'
})
export class AppStepThree {

  @Prop() history: RouterHistory;
  @Prop() spotifyService: SpotifyService;

  @State() transferInfo: TransferInfo;
  @State() userProfile: SpotifyUser;

  getStateFromUrl(hash: string): string{
    const regex = RegExp('state=(.[^&]*)', 'gm');
    const result = regex.exec(hash);
    return result[1];
  }

  async loadTransferInformationFromDB(transferId: string): Promise<TransferInfo> {
    try {
      const db = await idb.open('smdb', 1);
      const transaction = db.transaction(DBTableSchema.transferInfo.tableName, 'readonly');
      const store = transaction.objectStore(DBTableSchema.transferInfo.tableName);
      return await store.get(transferId);
    } catch (err) {
      throw new Error(err);
    }
  }

  async componentWillLoad() {

    const { hash } = this.history.location;

    await this.spotifyService.validateAccessToken(hash)
    .then((userProfile) => this.userProfile = userProfile)
    .catch(() => this.history.push('/'));

    this.transferInfo = await this.loadTransferInformationFromDB(this.getStateFromUrl(hash));

    console.log(this.transferInfo);
    console.log(this.userProfile);

  }

  render() {

    if(this.transferInfo.from.id === this.userProfile.id){
      console.error('Cannot transfer to same account');
      return (
        <section class="page">
          <h1>Cannot transfer to same user account</h1>
          <button class="button" onClick={() => this.spotifyService.authorizeUser(
          'http://localhost:3333/step-three',
          true,
          this.transferInfo.transferId,
          ['user-library-modify']
        )}>Click here to try again</button>
        </section>
      )
    }

    return (
      <section class="page">
        <h1>Building your Spotify Library</h1>
        <app-active-user-card label="transferring from" user={this.transferInfo.from}></app-active-user-card>
        <app-active-user-card label="transferring to" user={this.userProfile}></app-active-user-card>
      </section>





    )
  }


}
