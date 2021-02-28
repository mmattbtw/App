import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/DataStructure';
import { iif, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

	get Emotes() {
		return {
			Upload: (data: FormData, length: number) => this.createRequest<DataStructure.Emote>('post', '/emotes', {
				body: data,
				auth: true
			})
		};
	}
	// tslint:enable:typedef

	private createRequest<T>(method: RestService.Method, route: string, options?: Partial<RestService.CreateRequestOptions>): Observable<HttpResponse<T>> {
		const uri = this.BASE + route;
		const opt = {
			observe: 'response',
			headers: {
				Authorization: options?.auth ? `Bearer ${this.clientService.getToken()}` : '',
				...(options?.headers ?? {})
			}
		} as any;

		return of(method).pipe(
			switchMap(m => iif(() => m === 'get',
				this.httpService.get(uri, opt),
				this.httpService[m as RestService.BodyMethod](uri, options?.body ?? {}, opt)
			))
		).pipe(map((x: any) => x as HttpResponse<T>));
	}
}

export namespace RestService {
	export type Method = 'get' | 'patch' | 'post' | 'put';
	export type BodyMethod = 'patch' | 'post' | 'put';

	export interface CreateRequestOptions {
		headers: { [key: string]: string };
		auth: boolean;
		body?: any;
	}

	export namespace Result {
		/** GET /auth  */
		export interface GetURLResult {
			url?: string;
		}
	}
}
