import { CLIENT_ID } from './spotify-credentials';

export enum Endpoint {
  tracks = 'https://api.spotify.com/v1/me/tracks?limit=50',
  playlists = 'https://api.spotify.com/v1/me/playlists?limit=50',
  artists = 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
  albums = 'https://api.spotify.com/v1/me/albums?limit=50'
}

export interface SpotifyUser {
  display_name: string,
  external_urls: any,
  followers: {href: string, total: number},
  id: string,
  images: {height: number, width:number, url: string }[],
  type: string,
  uri: string
}

export class SpotifyService {

  public ACCESS_TOKEN: string;

  public get(url: string) {
    return fetch(url, {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer ' + this.ACCESS_TOKEN
      })
    }).then(async response => {

      switch (response.status) {

        case 429: { // Rate limit hit await time specified in header and retry
          const delay = response.headers.get('Retry-After');
          console.warn(`Spotify API rate limit reached, will wait ${delay} seconds before attempting more requests`);
          await this.networkTimeout((+delay + 0.5) * 1000) // + 0.5 to pad the time slightly before another request.
          return this.get(url);
        }

        default: {
          return response;
        }

      }

    })
  }


  /**
   * Resolve a promise after x number of ms passed.
   */
  private networkTimeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper function to get all paginated Spotify items. Returns a promise when all items recieved
   *
   */
  public getAllPaginatedItems(requestUrl: Endpoint, callback: Function = undefined): Promise<any[]> {
    let items = [];
    let itemsRemaining = true;
    let url = requestUrl;
    return new Promise(async (resolve) => {
      while (itemsRemaining) {
        await this.get(url)
          .then(response => response.json())
          .then(response => {

            // Some endpoints nest the 'paginated' object, bring it up a level.
            const responseKeys = Object.keys(response);
            if (responseKeys.length === 1) {
              response = response[responseKeys[0]];
            }

            callback ? callback(response) : null;
            items = items.concat(response.items);
            url = response.next;
            itemsRemaining = Boolean(response.next);
          })
      }
      resolve(items);
    })
  }


  public validateAccessToken(hash: string): Promise<SpotifyUser> {
    return new Promise((resolve, reject) => {
      try {

        const regex = RegExp('access_token=(.[^&]*)', 'gm');
        const result = regex.exec(hash);
        this.ACCESS_TOKEN = result[1];

        this.getUserProfile()
          .then(response => {
            if (response.status !== 200) {
              reject(response);
            }
            return resolve(response.json());
          })
          .catch(err => reject(err))

      } catch (err) {
        reject(err);
      }
    })
  }

  public authorizeUser(returnUrl: string, showDialog = false) {
    const redirect_uri = encodeURIComponent(returnUrl);
    const scopes = encodeURIComponent('user-library-read playlist-read-private user-follow-read');
    window.location.replace(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${redirect_uri}&scope=${scopes}&show_dialog=${showDialog}`)
  }

  public getUserProfile() {
    return this.get('https://api.spotify.com/v1/me');
  }

}
