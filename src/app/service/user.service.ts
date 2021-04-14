

import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { noop, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { RoleStructure } from 'src/app/util/role.structure';
import { UserStructure } from 'src/app/util/user.structure';

@Injectable({providedIn: 'root'})
export class UserService {
	private static inst: UserService;
	private roles = new Map<string, RoleStructure>();
	private cache = new Map<string, UserStructure>();

	constructor(
		private restService: RestService,
		private clientService: ClientService
	) {
		UserService.inst = this;

		clientService.isAuthenticated().pipe(
			filter(b => b === true),
			take(1),
			tap(() => console.log('Client Snaapshot', clientService.getSnapshot())),
			tap(() => this.new(clientService.getSnapshot() as DataStructure.TwitchUser))
		).subscribe();
	}

	static Get(): UserService {
		return UserService.inst;
	}

	new(data: DataStructure.TwitchUser): UserStructure {
		const id = !!data.id ? String(data.id) : null;
		if (!id) throw Error('Invalid User ID');

		let user: UserStructure | undefined = this.cache.get(id);
		if (!!user) {
			user.mergeData(data);
		} else if (id === this.clientService.id) {
			user = this.clientService;
		} else {
			user = new UserStructure().pushData(data);
			console.log(`Created New User ${user.id}:${user.getSnapshot()?.login} (DID: ${user.debugID})`);

			this.cache.set(user.id, user);
		}

		return user;
	}

	cacheRole(data: DataStructure.Role): void {
		const id = !!data.id ? String(data.id) : null;
		if (!id) return undefined;

		const role = this.roles.get(id) ?? new RoleStructure();
		role.pushData(data);

		(!!id && !this.roles.has(id) ? this.roles.set(id, role) : noop());
	}

	getRole(id: string): RoleStructure {
		return this.roles.get(id) ?? UserService.DefaultRole;
	}

	getOne(idOrUsername: string, ignoreCache = false): Observable<UserStructure> {
		const cachedUser = this.cache.get(idOrUsername)
			|| (Array.from(this.cache.values()).find(u => idOrUsername.toLowerCase() === u.getSnapshot()?.login))
			|| ((idOrUsername === String(this.clientService.getSnapshot()?.id) || idOrUsername.toLowerCase() === this.clientService.getSnapshot()?.login)
				? this.cache.get('@me') : null);
		if (!!cachedUser && !ignoreCache) return of(cachedUser);

		return this.restService.v2.GetUser(idOrUsername).pipe(
			switchMap(res => !!res.user ? of(this.new(res.user)) : throwError(Error('Empty response content')))
		);
	}
}

export namespace UserService {
	export const DefaultRole = new RoleStructure().pushData({
		id: '#000000000000000000000001',
		name: 'Default',
		color: 0,
		allowed: BigInt(523),
		denied: BigInt(0)
	});
}
