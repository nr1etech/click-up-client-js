import axios, {AxiosInstance} from 'axios';
import {ClickUpClientError} from './errors';
import {User} from './types';

export const API_URL = 'https://api.clickup.com';

export interface ClickUpClientCOnfig {
  readonly client?: AxiosInstance;
  readonly url?: string;
  readonly debug?: boolean;
  readonly authorization?: string;
}

export class ClickUpClient {
  protected client: AxiosInstance;
  protected url: string;
  protected authorization?: string;
  constructor(config?: ClickUpClientCOnfig) {
    this.client = config?.client ?? axios.create();
    this.url = config?.url ?? API_URL;
    this.authorization = config?.authorization;
    if (config?.debug) {
      this.logRequests();
      this.logResponses();
    }
  }

  protected logRequests() {
    this.client.interceptors.request.use(
      config => {
        console.log('Request', JSON.stringify(config, null, 2));
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  protected logResponses() {
    this.client.interceptors.response.use(
      config => {
        console.log('Response', JSON.stringify(config, null, 2));
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  protected getAuthorization(): string {
    if (this.authorization === undefined) {
      throw new ClickUpClientError('authorization is not set');
    }
    return this.authorization;
  }

  getOAuthRedirect(
    clientId: string,
    callbackUri: string,
    state?: string
  ): string {
    return state
      ? `https://app.clickup.com/api?client_id=${clientId}&state=${state}&redirect_uri=${callbackUri}`
      : `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${callbackUri}`;
  }

  async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string
  ): Promise<string> {
    const response = await this.client.post(`${this.url}/api/v2/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    });
    this.authorization = 'Bearer ' + response.data['access_token'];
    return response.data['access_token'];
  }

  setAccessToken(token: string): ClickUpClient {
    this.authorization = 'Bearer ' + token;
    return this;
  }

  setPersonalAccessToken(token: string): ClickUpClient {
    this.authorization = token;
    return this;
  }

  async getUser(): Promise<User> {
    const response = await this.client.get(`${this.url}/api/v2/user`, {
      headers: {
        Authorization: this.getAuthorization(),
      },
    });
    return {
      weekStartDay: response.data['week_start_day'],
      globalFontSupport: response.data['global_font_support'],
      ...response.data,
    };
  }
}
