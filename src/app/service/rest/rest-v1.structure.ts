import { DataStructure } from '@typings/typings/DataStructure';
import { RestService } from 'src/app/service/rest.service';

export class RestV1 {
	constructor(private restService: RestService) {

	}
	// tslint:disable:typedef
	get Users() {
		return {
			Get: (id: '@me' | string) => this.restService.createRequest<DataStructure.TwitchUser>('get', `/users/${id}`, { auth: id === '@me' })
		};
	}

	get Channels() {
		return {
			AddEmote: (emoteId: string, userId = '@me') => this.restService.createRequest<DataStructure.TwitchUser>('put', `/channels/${userId}/emotes/${emoteId}`, { auth: true }),
			RemoveEmote: (emoteId: string, userId = '@me') => this.restService.createRequest<DataStructure.TwitchUser>('delete', `/channels/${userId}/emotes/${emoteId}`, { auth: true }),
		};
	}

	get Emotes() {
		return {
			List: (page = 1, pageSize = 16, query?: string) =>
				this.restService.createRequest<
					{ emotes: DataStructure.Emote[]; total_estimated_size: number; }
				>('get', `/emotes?page=${page}&pageSize=${pageSize}${query ? `&${query}` : ''}`, { auth: true }),
			Get: (id: string, includeActivity?: boolean) =>
				this.restService.createRequest<DataStructure.Emote>('get', `/emotes/${id}${includeActivity ? '?include_activity=true' : ''}`, { auth: true }),
			Upload: (data: FormData, length: number) => this.restService.createRequest<DataStructure.Emote>('post', '/emotes', {
				body: data,
				auth: true
			}),
			Edit: (id: string, body: any, reason?: string) => this.restService.createRequest<DataStructure.Emote>('patch', `/emotes/${id}`, {
				auth: true,
				body,
				headers: { 'X-Action-Reason': reason ?? 'no reason' }
			}),
			Delete: (id: string, reason?: string) => this.restService.createRequest<void>('delete', `/emotes/${id}`, {
				auth: true,
				headers: { 'X-Action-Reason': reason ?? 'no reason' }
			}),
			GetChannels: (emoteId: string) => this.restService.createRequest<{ count: number; users: DataStructure.TwitchUser[] }>('get', `/emotes/${emoteId}/channels`)
		};
	}

	get Auth() {
		return {
			GetURL: () => this.restService.createRequest<RestService.Result.GetURLResult>('get', '/auth', { auth: false })
		};
	}
}
