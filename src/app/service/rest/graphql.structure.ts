import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';

export class GraphQL {
	constructor(private restService: RestService) { }

	public query<T>(options: GraphQLService.QueryOptions & GraphQLService.WithVar): Observable<T | null> {
		return this.restService.createRequest<GraphQLService.QueryResult<T>>('post', '/gql', {
			body: {
				query: options.query.replace(/\s{2,}/g, ''),
				variables: options.variables
			},
			auth: options.auth
		}, 'v2').pipe(
			RestService.onlyResponse(),
			map(x => x.body?.data ?? null),
		);
	}
}

export namespace GraphQLService {
	export interface QueryOptions {
		query: string;
		auth?: boolean;
		variables?: { [key: string]: any };
	}
	export interface QueryResult<T> {
		data: T;
	}

	export interface MutationOptions {
		mutation: string;
	}

	export type WithVar = { [key: string]: any; };
}
