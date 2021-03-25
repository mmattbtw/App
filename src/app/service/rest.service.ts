import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { iif, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class RestService {
	private BASE = '';
	private CDN_BASE = environment.cdnUrl;

	constructor(
		@Inject(PLATFORM_ID) platformId: any,
		private httpService: HttpClient,
		public clientService: ClientService
	) {
		this.BASE = environment.platformApiUrl(platformId);
		console.log('Based', this.BASE);
		// Sign in the user?
		if (isPlatformBrowser(platformId)) {
			const token = clientService.localStorage.getItem('access_token');
			of(token).pipe(
				filter(x => typeof x === 'string'),
				tap(tok => clientService.setToken(tok)),
				switchMap(() => this.Users.Get('@me')),
				RestService.onlyResponse(),
				switchMap(res => !!res.body?._id ? of(res) : throwError('Unknown Account')),
				tap(res => clientService.pushData(res.body))
			).subscribe({
				error: err => {
					clientService.localStorage.removeItem('access_token');
				}
			});
		}
	}

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
			Get: (id: string, includeActivity?: boolean) =>
				this.createRequest<DataStructure.Emote>('get', `/emotes/${id}${includeActivity ? '?include_activity=true' : ''}`, { auth: true }),
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

	get Discord() {
		return {
			Widget: (guildID = '817075418054000661') => this.createRequest<RestService.Result.GetDiscordWidget>('get', `https://discord.com/api/guilds/${guildID}/widget.json`)
		};
	}

	get CDN() {
		return {
			Emote: (id: string, size: number) => `${this.CDN_BASE}/emote/${id}/${size}x`
		};
	}
	// tslint:enable:typedef

	private createRequest<T>(method: RestService.Method, route: string, options?: Partial<RestService.CreateRequestOptions>): Observable<HttpResponse<T> | HttpProgressEvent> {
		const uri = (route.startsWith('http') ? '' :  this.BASE) + route;
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

		export interface GetDiscordWidget {
			id: string;
			name: string;
			instant_invite: string;
			channels: {
				id: string;
				name: string;
				position: number;
			}[];
			members: {
				id: string;
				username: string;
				discriminator: string;
				status: string;
				avatar_url: string;
			}[];
			presence_count: number;
		}
	}
}
