import { HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { DataStructure } from '@typings/typings/DataStructure';
import { Observable } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';
import { GQLFragments } from 'src/app/service/rest/gql-fragments.structure';
import { GraphQL } from 'src/app/service/rest/graphql.structure';

export class RestV2 {
	gql = new GraphQL(this.restService);

	constructor(private restService: RestService) {

	}

	GetUser(id: string): Observable<{ user: DataStructure.TwitchUser }> {
		return this.gql.query<{ user: DataStructure.TwitchUser }>({
			query: `
				{
					user(id: "${id}") {
						...FullUser
					}
				}

				${GQLFragments.FullUser(false)}
			`,
			variables: {},
			auth: true
		}).pipe(
			map(res => ({
				user: res?.body?.data.user as DataStructure.TwitchUser
			}))
		);
	}

	SearchEmotes(page = 1, pageSize = 16, options?: Partial<RestV2.GetEmotesOptions>): Observable<{ emotes: DataStructure.Emote[]; total_estimated_size: number; }> {
		return this.gql.query<{ search_emotes: DataStructure.Emote[] }>({
			query: `
				{
					search_emotes(
						query: "${options?.query ?? ''}",
						limit: ${pageSize},
						page: ${page},
						pageSize: ${pageSize}
						${(options?.globalState && `, globalState: "${options.globalState}"`) ?? ''}
						${(options?.sortBy && `, sortBy: "${options.sortBy}"`) ?? ''}
						${typeof options?.sortOrder === 'number' ? `, sortOrder: ${options.sortOrder}` : ''}
					) {
						id,
						visibility,
						owner {
							id,
							display_name,
							role {
								id,
								name,
								color
							}
						}
						name
					}
				}
			`
		}).pipe(
			map(res => ({
				emotes: res?.body?.data.search_emotes ?? [],
				total_estimated_size: Number(res?.headers.get('x-collection-size'))
			}))
		);
	}

	GetEmote(id: string, includeActivity = false, filterFields?: string[]): Observable<{ emote: DataStructure.Emote }> {
		const isFiltered = Array.isArray(filterFields) && filterFields.length > 0;

		return this.gql.query<{ emote: DataStructure.Emote }>({
			query: `
				{
					emote(id: "${id}") {
						${isFiltered
							? (filterFields as string[]).join(', ')
							: '...fullEmote'}
					}
				}

				${isFiltered ? '' : GQLFragments.FullEmote(includeActivity)}
			`
		}).pipe(
			map(res => ({ emote: res?.body?.data.emote as DataStructure.Emote }))
		);
	}

	EditEmote(data: { id: string } & Partial<DataStructure.Emote>, reason?: string, extraFields?: string[]): Observable<{ emote: DataStructure.Emote }> {
		return this.gql.query<{ editEmote: DataStructure.Emote }>({
			query: `
				mutation MutateEmote($em: EmoteInput!, $reason: String!) {
					editEmote(emote: $em, reason: $reason) {
						${Object.keys(data).join(', ')}
						${Array.isArray(extraFields) && extraFields.length > 0
							? ', ' + extraFields.join(', ')
							: ''}
					}
				}
			`,
			variables: {
				em: data,
				reason: reason ?? ''
			},
			auth: true
		}).pipe(
			map(res => ({ emote: res?.body?.data.editEmote as DataStructure.Emote }))
		);
	}

	CreateEmote(data: FormData): Observable<HttpProgressEvent | HttpResponse<DataStructure.Emote>> {
		return this.restService.createRequest('post', '/emotes', {
			body: data,
			auth: true
		}, 'v2');
	}

	DeleteEmote(emoteID: string, reason?: string): Observable<void> {
		return this.gql.query({
			query: `
				mutation DeleteEmote($em: String!, $reason: String!) {
					deleteEmote(id: $em, reason: $reason) {}
				}
			`,
			variables: {
				em: emoteID,
				reason: reason ?? ''
			},
			auth: true
		}).pipe(
			mapTo(undefined)
		);
	}

	AddChannelEmote(emoteID: string, channelID: string, reason = ''): Observable<{ user: DataStructure.TwitchUser }> {
		return this.gql.query<{ addChannelEmote: DataStructure.TwitchUser }>({
			query: `
				mutation AddChannelEmote($ch: String!, $em: String!, $re: String!) {
					addChannelEmote(channel_id: $ch, emote_id: $em, reason: $re) {
						emote_ids
					}
				}
			`,
			variables: {
				ch: channelID,
				em: emoteID,
				re: reason
			},
			auth: true
		}).pipe(
			map(res => ({
				user: res?.body?.data.addChannelEmote as DataStructure.TwitchUser
			}))
		);
	}

	RemoveChannelEmote(emoteID: string, channelID: string, reason = ''): Observable<{ user: DataStructure.TwitchUser }> {
		return this.gql.query<{ removeChannelEmote: DataStructure.TwitchUser }>({
			query: `
				mutation RemoveChannelEmote($ch: String!, $em: String!, $re: String!) {
					removeChannelEmote(channel_id: $ch, emote_id: $em, reason: $re) {
						emote_ids
					}
				}
			`,
			variables: {
				ch: channelID,
				em: emoteID,
				re: reason
			},
			auth: true
		}).pipe(
			map(res => ({
				user: res?.body?.data.removeChannelEmote as DataStructure.TwitchUser
			}))
		);
	}

	GetAuthURL(): string {
		return `${this.restService.BASE.v2}/auth`;
	}
}

export namespace RestV2 {
	type KeysEnum<T> = { [P in keyof Required<T>]: true };
	export const FullUser = {
		id: true, email: true, rank: true,
		editor_ids: true, display_name: true,
		broadcaster_type: true, profile_image_url: true,
		created_at: true
	} as KeysEnum<DataStructure.TwitchUser>;

	export interface GetEmotesOptions {
		query: string;
		channel: string;
		submitter: string;
		globalState: 'only' | 'hide';
		sortBy: 'age' | 'popularity';
		sortOrder: 0 | 1;
	}
}
