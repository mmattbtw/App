import { BitField } from '@typings/src/BitField';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { defaultIfEmpty, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { UserService } from 'src/app/service/user.service';
import { RoleStructure } from 'src/app/util/role.structure';

export class UserStructure {
	debugID = Math.random().toString(36).substring(7);
	id = '';

	protected pushed = false;
	protected data = new BehaviorSubject<Partial<DataStructure.TwitchUser> | null>(null).pipe(
		filter(v => v !== null)
	) as BehaviorSubject<Partial<DataStructure.TwitchUser> | null>;
	protected snapshot: Partial<DataStructure.TwitchUser> | null = null;

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

		this.pushed = true;
		this.data.next(data);
		this.snapshot = data;

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
		return this.data$(this.getRole().pipe(
			take(1),
			switchMap(role => role.getAllowed()),
			map(allowed => BitField.HasBits64(allowed, DataStructure.Role.Permission[flag]) || BitField.HasBits64(allowed, DataStructure.Role.Permission.ADMINISTRATOR)),
			defaultIfEmpty(false)
		), false);
	}

	getSnapshot(): Partial<DataStructure.TwitchUser> | null {
		return this.snapshot;
	}

	protected data$<T, D>(withSource: Observable<T>, value: D): Observable<T> | Observable<D> {
		return !this.pushed ? of(value) : withSource;
	}
}
