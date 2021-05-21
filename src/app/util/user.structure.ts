import { BitField } from '@typings/src/BitField';
import { DataStructure } from '@typings/typings/DataStructure';
import { Observable, of } from 'rxjs';
import { defaultIfEmpty, map, mergeAll, switchMap, take, toArray } from 'rxjs/operators';
import { AppInjector } from 'src/app/service/app.injector';
import { RestService } from 'src/app/service/rest.service';
import { Structure } from 'src/app/util/abstract.structure';
import { EmoteStructure } from 'src/app/util/emote.structure';
import { RoleStructure } from 'src/app/util/role.structure';

export class UserStructure extends Structure<'user'> {
	debugID = Math.random().toString(36).substring(7);
	id = '';
	restService: RestService | null = null;

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
		if (Array.isArray(data.owned_emotes)) {
			this.dataService.add('emote', ...data.owned_emotes);
		}
		if (Array.isArray(data.editors)) {
			this.dataService.add('user', ...data.editors);
		}
		const newData = { ...this.data.getValue() } as DataStructure.TwitchUser;
		for (const k of Object.keys(data)) {
			const key = k as keyof DataStructure.TwitchUser;

			(newData as any)[key as any] = data[key];
		}

		this.pushed = true;
		this.snapshot = newData;
		if (!!data.id) {
			this.data.next(newData);
		}

		return this;
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
	getEmoteIDs(): Observable<string[]> {
		return this.dataOnce().pipe(
			map(data => data?.emote_ids as string[] ?? [])
		);
	}

	getOwnedEmotes(): Observable<EmoteStructure[]> {
		return this.dataOnce().pipe(
			map(data => {
				const emotes = [] as EmoteStructure[];
				for (const e of data?.owned_emotes ?? []) {
					const found = this.dataService.get('emote', e);
					emotes.push(...found);
				}

				return emotes;
			})
		);
	}

	hasEmote(id: string): Observable<boolean> {
		return this.dataOnce().pipe(
			map(data => data?.emote_ids?.includes(id) ?? false)
		);
	}

	getEmotes(): Observable<EmoteStructure[]> {
		return this.dataOnce().pipe(
			map(data => data?.emotes ?? []),
			mergeAll(),
			map(e => this.dataService.add('emote', e)[0]),
			toArray()
		);
	}

	getEditors(): Observable<UserStructure[]> {
		return this.dataOnce().pipe(
			map(data => data?.editors ?? []),
			mergeAll(),
			map(u => this.dataService.get('user', u)[0]),
			toArray()
		);
	}

	getEditorIn(): Observable<UserStructure[]> {
		return this.dataOnce().pipe(
			map(data => data?.editor_in ?? []),
			mergeAll(),
			map(u => this.dataService.get('user', u)[0]),
			toArray()
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

	ban(expireAt: Date, reason = ''): Observable<void> {
		return this.getRestService().v2.BanUser(this.id, expireAt, reason);
	}

	getRestService(): RestService {
		if (!this.restService) {
			try {
				this.restService = AppInjector.get(RestService);
			} catch (_) {}
		}

		return this.restService as any;
	}
}

export namespace UserStructure {
	export const DefaultRole = new RoleStructure();
	DefaultRole.pushData({
		name: 'Default',
		id: 'DEFAULT',
		allowed: BigInt(523),
		denied: BigInt(0),
		color: 0,
		position: 0
	});
}
