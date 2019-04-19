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

  public async request(requestInfo: {url: string, method?: any, headers?: Headers, body?: any}) : Promise<Response>{

    const method = requestInfo.method || 'url';
    const headers = requestInfo.headers || new Headers();
    headers.append('Authorization', `Bearer $${this.ACCESS_TOKEN}`);
    const body  = requestInfo.body || {};

    try {
      const response = await fetch(requestInfo.url, {
        method,
        headers,
        body: JSON.stringify(body)
      })
      return this.handleRequestRateLimiting(response, this.request.bind(this, {url: requestInfo.url, method, headers, body}));
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  public async get(url: string): Promise<Response> {
    return this.request({url, method: 'GET'});

    // try {
    //   const response = await fetch(url, {
    //     method: 'GET',
    //     headers: new Headers({'Authorization': 'Bearer ' + this.ACCESS_TOKEN}),
    //   });
    //   return this.handleRequestRateLimiting(response, this.get.bind(this, url));
    // } catch (error) {
    //   console.error(error);
    //   return error;
    // }
  }

  public async put(url: string, body: Object): Promise<Response> {
    return this.request({url, method: 'PUT', body});

    // try {
    //   const response = await fetch(url, {
    //     method: 'PUT',
    //     headers: new Headers({'Authorization': 'Bearer ' + this.ACCESS_TOKEN}),
    //     body: JSON.stringify(body)
    //   })
    //   return this.handleRequestRateLimiting(response, this.put.bind(this, url, body));
    // } catch(error) {
    //   console.error(error);
    //   return error;
    // }
  }

  /**
   * Resolve a promise after x number of ms passed.
   */
  private networkTimeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
  * Check if a request has hit the Spotify API rate limit, if so delay the request.
  */
  private async handleRequestRateLimiting(response: Response, retryFunction: Function,) {
    switch (response.status) {
      case 429: { // Rate limit hit await time specified in header and retry
        const delay = response.headers.get('Retry-After');
        console.warn(`Spotify API rate limit reached, will wait ${delay} seconds before attempting more requests`);
        await this.networkTimeout((+delay + 0.5) * 1000) // + 0.5 to pad the time slightly before another request.
        return retryFunction();
      }
      default: {
        return response;
      }
    }
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

  public authorizeUser(returnUrl: string, showDialog = false, state = '', scopes: string[]) {
    const redirect_uri = encodeURIComponent(returnUrl);
    const scopesString = encodeURIComponent(scopes.join(' '));
    window.location.replace(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${redirect_uri}&scope=${scopesString}&show_dialog=${showDialog}&state=${state}`)
  }

  public getUserProfile() {
    return this.get('https://api.spotify.com/v1/me');
  }

}
