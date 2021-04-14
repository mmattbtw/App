import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { UserService } from 'src/app/service/user.service';
import { RoleStructure } from 'src/app/util/role.structure';

export class UserStructure {
	debugID = Math.random().toString(36).substring(7);
	id = '';
	protected data = new BehaviorSubject<Partial<DataStructure.TwitchUser> | null>(null).pipe(
		filter(v => v !== null)
	) as BehaviorSubject<Partial<DataStructure.TwitchUser> | null>;
	protected snapshot: Partial<DataStructure.TwitchUser> | null = null;
	permissions = new DataStructure.Role.Permissions(BigInt(0));

	constructor() {}
	/**
	 * Push data onto this user.
	 *
	 * @param data Twitch User data
	 */
	pushData(data: Partial<DataStructure.TwitchUser> | null): UserStructure {
		if (!data) {
			return this;
		}

		if (typeof data.id === 'string') {
			this.id = data.id;
		}
		if (!!data.role) {
			UserService.Get().cacheRole(data.role);
		}

		this.data.next(data);
		this.snapshot = data;
		if (!!data?.role?.allowed) {
			this.permissions.patch(BigInt(data.role.allowed ?? 0) as bigint);
		}

		return this;
	}

	mergeData(data: Partial<DataStructure.TwitchUser>): UserStructure {
		const d = { ...this.getSnapshot(), ...data } as DataStructure.TwitchUser;

		return this.pushData(d);
	}

	getID(): Observable<string> {
		return this.data.asObservable().pipe(
			take(1),
			map(data => !!data?.id ? String(data.id) : DataStructure.NullObjectId)
		);
	}

	/**
	 * Get the username of the client user
	 */
	getUsername(): Observable<string | null> {
		return this.data.asObservable().pipe(
			take(1),
			map(data => data?.display_name ?? null)
		);
	}

	/**
	 * Get an URL to the avatar of the client user
	 */
	getAvatarURL(): Observable<string | null> {
		return this.data.asObservable().pipe(
			take(1),
			map(data => data?.profile_image_url ?? null)
		);
	}

	/**
	 * Get the user's rank
	 *
	 * @deprecated no longer returned in v2, use role
	 */
	getRank(): Observable<Constants.Users.Rank> {
		return this.data.asObservable().pipe(
			take(1),
			map(data => data?.rank ?? Constants.Users.Rank.DEFAULT)
		);
	}

	getRole(): Observable<RoleStructure> {
		return this.data.asObservable().pipe(
			take(1),
			map(data => data?.role ?? { name: 'Default' } as DataStructure.Role),
			map(role => UserService.Get().getRole(role.id))
		);
	}

	/**
	 * Get the user's channel emotes
	 */
	getEmotes(): Observable<string[]> {
		return this.data.asObservable().pipe(
			take(1),
			map(data => data?.emote_ids as string[] ?? [])
		);
	}

	hasPermission(flag: keyof typeof DataStructure.Role.Permission): Observable<boolean> {
		return of(this.permissions.has(flag) || this.permissions.has('ADMINISTRATOR'));
	}

	getSnapshot(): Partial<DataStructure.TwitchUser> | null {
		return this.snapshot;
	}
}
