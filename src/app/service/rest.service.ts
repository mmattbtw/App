import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/DataStructure';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class RestService {
	private BASE = environment.apiUrl;

	constructor(
		private httpService: HttpClient,
		private clientService: ClientService
	) { }

	// tslint:disable:typedef
	get Auth() {
		return {
			GetURL: () => this.createRequest<RestService.Result.GetURLResult>('get', '/auth', { auth: false })
		};
	}

	get Users() {
		return {
			GetCurrent: () => this.createRequest<DataStructure.TwitchUser>('get', '/users/@me', { auth: true })
		};
	}
	// tslint:enable:typedef

	private createRequest<T>(method: RestService.Method, route: string, options?: Partial<RestService.CreateRequestOptions>): Observable<HttpResponse<T>> {
		return this.httpService[method](this.BASE + route, {
			observe: 'response',
			headers: {
				Authorization: options?.auth ? `Bearer ${this.clientService.getToken()}` : '',
				...(options?.headers ?? {})
			}
		}).pipe(map(x => x as HttpResponse<T>));
	}
}

export namespace RestService {
	export type Method = 'get' | 'patch' | 'post' | 'put';

	export interface CreateRequestOptions {
		headers: HttpHeaders;
		auth: boolean;
	}

	export namespace Result {
		/** GET /auth  */
		export interface GetURLResult {
			url?: string;
		}
	}
}
