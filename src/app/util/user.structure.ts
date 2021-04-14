import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class UserStructure {
	debugID = Math.random().toString(36).substring(7);
	id: string | null = null;
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

		if (typeof data._id === 'string') {
			this.id = data._id;
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
			map(data => !!data?._id ? String(data._id) : DataStructure.NullObjectId)
		);
	}

	/**
	 * Get the username of the client user
	 */
	getUsername(): Observable<string | null> {
		return this.data.asObservable().pipe(
			map(data => data?.display_name ?? null)
		);
	}

	/**
	 * Get an URL to the avatar of the client user
	 */
	getAvatarURL(): Observable<string | null> {
		return this.data.asObservable().pipe(
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
			map(data => data?.rank ?? Constants.Users.Rank.DEFAULT)
		);
	}

	getRole(): Observable<DataStructure.Role | null> {
		return this.data.asObservable().pipe(
			map(data => data?.role ?? null)
		);
	}

	getRoleColor(): Observable<string | null> {
		return this.getRole().pipe(
			map(role => `#${role?.color.toString(16)}` ?? null)
		);
	}

	/**
	 * Get the user's channel emotes
	 */
	getEmotes(): Observable<string[]> {
		return this.data.asObservable().pipe(
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
