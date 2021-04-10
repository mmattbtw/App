import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeAll, tap } from 'rxjs/operators';


export class UserStructure {
	protected data = new BehaviorSubject<Partial<DataStructure.TwitchUser> | null>(null);
	protected snapshot: Partial<DataStructure.TwitchUser> | null = null;

	/**
	 * Push data onto this user.
	 *
	 * @param data Twitch User data
	 */
	pushData(data: Partial<DataStructure.TwitchUser> | null): UserStructure {
		this.data.next(data);
		this.snapshot = data;

		return this;
	}

	getID(): Observable<string | null> {
		return this.data.pipe(
			map(data => !!data?._id ? String(data._id) : null)
		);
	}

	/**
	 * Get the username of the client user
	 */
	getUsername(): Observable<string | null> {
		return this.data.pipe(
			map(data => data?.display_name ?? null)
		);
	}

	/**
	 * Get an URL to the avatar of the client user
	 */
	getAvatarURL(): Observable<string | null> {
		return this.data.pipe(
			map(data => data?.profile_image_url ?? null)
		);
	}

	/**
	 * Get the user's rank
	 *
	 * @deprecated no longer returned in v2, use role
	 */
	getRank(): Observable<Constants.Users.Rank> {
		return this.data.pipe(
			map(data => data?.rank ?? Constants.Users.Rank.DEFAULT)
		);
	}

	getRole(): Observable<DataStructure.Role | null> {
		return this.data.pipe(
			map(data => data?.role ?? null)
		);
	}

	getRoleColor(): Observable<string | null> {
		return this.getRole().pipe(
			tap(x => console.log('role', x)),
			map(role => `#${role?.color.toString(16)}` ?? null)
		);
	}

	/**
	 * Get the user's channel emotes
	 */
	getEmotes(): Observable<string[]> {
		return this.data.pipe(
			map(data => data?.emotes as string[] ?? [])
		);
	}

	getSnapshot(): Partial<DataStructure.TwitchUser> | null {
		return this.snapshot;
	}
}
