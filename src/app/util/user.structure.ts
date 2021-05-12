import { BitField } from '@typings/src/BitField';
import { DataStructure } from '@typings/typings/DataStructure';
import { Observable, of } from 'rxjs';
import { defaultIfEmpty, map, switchMap, take, tap } from 'rxjs/operators';
import { Structure } from 'src/app/util/abstract.structure';
import { RoleStructure } from 'src/app/util/role.structure';

export class UserStructure extends Structure<'user'> {
	debugID = Math.random().toString(36).substring(7);
	id = '';

	/**
	 * Push data onto this user.
	 *
	 * @param data Twitch User data
	 */
	pushData(data: DataStructure.TwitchUser | null): UserStructure {
		if (!data) {
			return this;
		}

		if (typeof data.id === 'string') {
			this.id = data.id;
		}
		if (!!data.role) {
			this.dataService.add('role', data.role);
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
		return this.dataOnce().pipe(
			map(data => !!data?.id ? String(data.id) : DataStructure.NullObjectId)
		);
	}

	/**
	 * Get the username of the client user
	 */
	getUsername(): Observable<string | null> {
		return this.dataOnce().pipe(
			map(data => data?.display_name ?? null)
		);
	}

	/**
	 * Get an URL to the avatar of the client user
	 */
	getAvatarURL(): Observable<string | null> {
		return this.dataOnce().pipe(
			map(data => data?.profile_image_url ?? null)
		);
	}

	getRole(): Observable<RoleStructure> {
		return this.dataOnce().pipe(
			map(data => data?.role),
			map(role => !!role ? this.dataService.add('role', role)[0] : UserStructure.DefaultRole)
		);
	}

	getColor(): Observable<string> {
		return this.getRole().pipe(
			switchMap(role => role.getHexColor())
		);
	}

	/**
	 * Get the user's channel emotes
	 */
	getEmotes(): Observable<string[]> {
		return this.dataOnce().pipe(
			map(data => data?.emote_ids as string[] ?? [])
		);
	}

	hasPermission(flag: keyof typeof DataStructure.Role.Permission): Observable<boolean> {
		return this.data$(this.getRole().pipe(
			switchMap(role => role.getAllowed()),
			map(allowed => BitField.HasBits64(allowed, DataStructure.Role.Permission[flag]) || BitField.HasBits64(allowed, DataStructure.Role.Permission.ADMINISTRATOR)),
			defaultIfEmpty(false)
		), false);
	}

	getSnapshot(): Partial<DataStructure.TwitchUser> | null {
		return this.snapshot;
	}

	// tslint:disable-next-line:typedef
	protected dataOnce() {
		return this.data.asObservable().pipe(
			take(1)
		);
	}

	protected data$<T, D>(withSource: Observable<T>, value: D): Observable<T> | Observable<D> {
		return !this.pushed ? of(value) : withSource;
	}
}

export namespace UserStructure {
	export const DefaultRole = new RoleStructure();
	DefaultRole.pushData({
		name: 'Default',
		id: 'DEFAULT',
		allowed: BigInt(523),
		denied: BigInt(0),
		color: 0
	});
}
