

import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { noop, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
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
		this.cache.set('@me', clientService);
	}

	static Get(): UserService {
		return UserService.inst;
	}

	new(data: DataStructure.TwitchUser): UserStructure {
		const id = !!data._id ? String(data._id) : null;
		const user = new UserStructure();
		user.pushData(data);

		user.getRole().pipe(
			take(1),
			tap(role => !!role ? this.cacheRole(role) : noop())
		).subscribe();

		(!!id && !this.cache.has(id)) ? this.cache.set(id, user) : noop();
		return user;
	}

	cacheRole(data: DataStructure.Role): RoleStructure {
		const id = !!data.id ? String(data.id) : null;
		const role = new RoleStructure().pushData(data);

		(!!id && this.roles.has(id) ? this.roles.set(id, role) : noop());
		return role;
	}

	getOne(idOrUsername: string, ignoreCache = false): Observable<UserStructure> {
		const cachedUser = this.cache.get(idOrUsername)
			|| (Array.from(this.cache.values()).find(u => idOrUsername.toLowerCase() === u.getSnapshot()?.login))
			|| ((idOrUsername === String(this.clientService.getSnapshot()?._id) || idOrUsername.toLowerCase() === this.clientService.getSnapshot()?.login)
				? this.cache.get('@me') : null);
		if (!!cachedUser && !ignoreCache) return of(cachedUser);

		return this.restService.v2.GetUser(idOrUsername).pipe(
			switchMap(res => !!res.user ? of(this.new(res.user)) : throwError(Error('Empty response content')))
		);
	}
}
