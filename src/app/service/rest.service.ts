import { HttpClient, HttpHeaders, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { iif, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class RestService {
	private BASE = environment.apiUrl;
	private CDN_BASE = environment.cdnUrl;

	constructor(
		private httpService: HttpClient,
		public clientService: ClientService
	) { }

	// tslint:disable:typedef
	get Auth() {
		return {
			GetURL: () => this.createRequest<RestService.Result.GetURLResult>('get', '/auth', { auth: false })
		};
	}

	get Users() {
		return {
			Get: (id: '@me' | string) => this.createRequest<DataStructure.TwitchUser>('get', `/users/${id}`, { auth: id === '@me' })
		};
	}

	get Channels() {
		return {
			AddEmote: (emoteId: string, userId = '@me') => this.createRequest<DataStructure.TwitchUser>('put', `/channels/${userId}/emotes/${emoteId}`, { auth: true }),
			RemoveEmote: (emoteId: string, userId = '@me') => this.createRequest<DataStructure.TwitchUser>('delete', `/channels/${userId}/emotes/${emoteId}`, { auth: true }),
		};
	}

	get Emotes() {
		return {
			List: (page = 1, pageSize = 16, query?: string) =>
				this.createRequest<
					{ emotes: DataStructure.Emote[]; total_estimated_size: number; }
				>('get', `/emotes?page=${page}&pageSize=${pageSize}${query ? `&${query}` : ''}`, { auth: true }),
			Get: (id: string) => this.createRequest<DataStructure.Emote>('get', `/emotes/${id}`, { auth: true }),
			Upload: (data: FormData, length: number) => this.createRequest<DataStructure.Emote>('post', '/emotes', {
				body: data,
				auth: true
			}),
			Edit: (id: string, body: any, reason?: string) => this.createRequest<DataStructure.Emote>('patch', `/emotes/${id}`, {
				auth: true,
				body,
				headers: { 'X-Action-Reason': reason ?? 'no reason' }
			}),
			Delete: (id: string, reason?: string) => this.createRequest<void>('delete', `/emotes/${id}`, {
				auth: true,
				headers: { 'X-Action-Reason': reason ?? 'no reason' }
			}),
			GetChannels: (emoteId: string) => this.createRequest<{ count: number; users: DataStructure.TwitchUser[] }>('get', `/emotes/${emoteId}/channels`)
		};
	}

	get CDN() {
		return {
			Emote: (id: string, size: number) => `${this.CDN_BASE}/emote/${id}/${size}x`
		};
	}
	// tslint:enable:typedef

	private createRequest<T>(method: RestService.Method, route: string, options?: Partial<RestService.CreateRequestOptions>): Observable<HttpResponse<T> | HttpProgressEvent> {
		const uri = this.BASE + route;
		const opt = {
			observe: 'events',
			headers: {
				...(options?.headers ?? {}),
				Authorization: (options?.auth && this.clientService.getToken()?.length > 0) ? `Bearer ${this.clientService.getToken()}` : ''
			},
			reportProgress: true
		} as any;

		return of(method).pipe(
			switchMap(m => iif(() => (m === 'get') || (m === 'delete'),
				this.httpService[m](uri, opt),
				this.httpService[m as RestService.BodyMethod](uri, options?.body ?? {}, opt)
			))
		).pipe(map((x: any) => x as (HttpResponse<T> | HttpProgressEvent)));
	}
}

export namespace RestService {
	export type Method = 'get' | 'patch' | 'post' | 'put' | 'delete';
	export type BodyMethod = 'patch' | 'post' | 'put';

	export const onlyResponse = () => <T>(source: Observable<HttpResponse<T> | HttpProgressEvent>) => source.pipe(
		filter(x => x instanceof HttpResponse)
	) as Observable<HttpResponse<T>>;

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
