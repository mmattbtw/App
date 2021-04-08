import { DataStructure } from '@typings/typings/DataStructure';
import { RestService } from 'src/app/service/rest.service';
import { GraphQL } from 'src/app/service/rest/graphql.structure';

export class RestV2 {
	gql = new GraphQL(this.restService);

	constructor(private restService: RestService) {

	}
	// tslint:disable:typedef

	GetUser(id: string) {
		return this.gql.query<{ user: DataStructure.TwitchUser }>({
			query: `
				{
					user(id: "${id}") {
						...FullUser
					}
				}

				fragment FullUser on User {
					${Object.keys(RestV2.FullUser).join(', ')},
					role {
						id, name, color, allowed, denied
					}
				}
			`,
			variables: {},
			auth: true
		});
	}

	GetEmotes(query: string, page = 1, pageSize = 16) {
		return this.gql.query<{ search_emotes: DataStructure.Emote[] }>({
			query: `
				{
					search_emotes(query: "${query}", page: ${page}, pageSize: ${pageSize}) {
						_id,
						name
					}
				}
			`
		});
	}

	// tslint:enable:typedef

	GetAuthURL(): string {
		return `${this.restService.BASE}/v2/auth`;
	}
}

export namespace RestV2 {
	type KeysEnum<T> = { [P in keyof Required<T>]: true };
	export const FullUser = {
		_id: true, email: true, rank: true,
		editor_ids: true, display_name: true,
		broadcaster_type: true, profile_image_url: true
	} as KeysEnum<DataStructure.TwitchUser>;
}
