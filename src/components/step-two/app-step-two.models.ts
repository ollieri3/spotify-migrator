import { SpotifyUser } from "../../services";
import { TransferForm } from "../transfer-form/app-transfer-form.models";


export interface TransferInfo {
  transferId: string,
  from: SpotifyUser,
  transferForm: TransferForm
}

export const DBTableSchema = {
  transferInfo: {
    tableName: 'transferInfo',
    options: { keyPath: 'transferId'}
  },
  library: {
    tableName: 'library',
    options: { autoIncrement: true }
  },
  playlists: {
    tableName: 'playlists',
    options: { autoIncrement: true }
  },
  followedPlaylists: {
    tableName: 'followedPlaylists',
    options: { autoIncrement: true }
  },
  followedArtists: {
    tableName: 'followedArtists',
    options: { autoIncrement: true }
  }
}
