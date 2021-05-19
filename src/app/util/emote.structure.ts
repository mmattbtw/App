import { BitField } from '@typings/src/BitField';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { EMPTY, iif, Observable, of, throwError } from 'rxjs';
import { filter, map, mapTo, mergeAll, switchMap, take, tap, toArray } from 'rxjs/operators';
import { AppInjector } from 'src/app/service/app.injector';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { Structure } from 'src/app/util/abstract.structure';
import { UserStructure } from 'src/app/util/user.structure';

export class EmoteStructure extends Structure<'emote'> {
	private id = '';
	restService: RestService;

	constructor(dataService: DataService) {
		super(dataService);

		this.restService = AppInjector.get(RestService);
	}

	/**
	 * Add data to this emote
	 */
	pushData(data: DataStructure.Emote): EmoteStructure {
		this.id = String(data?.id);
		this.data.next(data);

		if (!!data?.owner) {
			this.dataService.add('user', data.owner);
		}
		if (Array.isArray(data?.channels)) {
			this.dataService.add('user', ...data.channels as DataStructure.TwitchUser[]);
		}

		return this;
	}

	mergeData(data: Partial<DataStructure.Emote>): EmoteStructure {
		const d = { ...this.getSnapshot(), ...data } as DataStructure.Emote;

		return this.pushData(d);
	}

	getID(): string { return this.id; }

	getName(): Observable<string | undefined> {
		return this.dataOnce().pipe(
			take(1),
			map(d => d?.name)
		);
	}

	getOwnerID(): Observable<string | undefined> {
		return this.dataOnce().pipe(
			take(1),
			map(d => !!d?.owner ? String(d.owner) : undefined)
		);
	}

	getOwnerName(): Observable<string> {
		return this.dataOnce().pipe(
			take(1),
			map(d => d?.owner?.display_name ?? '')
		);
	}

	getOwner(): Observable<UserStructure | undefined> {
		return this.dataOnce().pipe(
			take(1),
			map(d => !!d?.owner ? this.dataService.get('user', d.owner as DataStructure.TwitchUser)[0] : undefined)
		);
	}

	getChannels(): Observable<UserStructure[]> {
		return this.dataOnce().pipe(
			take(1),
			map(d => {
				const users = [] as UserStructure[];
				for (const ch of d?.channels ?? []) {
					const found = this.dataService.get('user', ch);
					users.push(...found);
				}

				return users;
			})
		);
	}

	getURL(size = 3): Observable<string | undefined> {
		return this.dataOnce().pipe(
			take(1),
			map(d => this.restService.CDN.Emote(String(d?.id), size))
		);
	}

	getTags(): Observable<string[] | undefined> {
		return this.dataOnce().pipe(
			take(1),
			map(d => d?.tags)
		);
	}

	getStatus(): Observable<Constants.Emotes.Status | undefined> {
		return this.dataOnce().pipe(
			take(1),
			map(d => d?.status)
		);
	}

	getStatusName(): Observable<(keyof typeof Constants.Emotes.Status) | undefined> {
		return this.getStatus().pipe(
			take(1),
			map(status => !!status ? Constants.Emotes.Status[status] as (keyof typeof Constants.Emotes.Status) : undefined)
		);
	}

	/**
	 * Whether or not the emote is private
	 */
	isPrivate(): Observable<boolean> {
		return this.hasVisibility('PRIVATE');
	}

	/**
	 * Whether or not the emote is global
	 */
	isGlobal(): Observable<boolean> {
		return this.hasVisibility('GLOBAL');
	}

	getAuditActivity(): Observable<DataStructure.AuditLog.Entry> {
		return this.dataOnce().pipe(
			take(1),
			map(emote => (emote?.audit_entries ?? []) as DataStructure.AuditLog.Entry[]),
			mergeAll(),
			filter(entry => typeof entry !== 'string')
		);
	}

	getAuditActivityString(): Observable<string> {
		return this.dataOnce().pipe(
			take(1),
			map(emote => (emote?.audit_entries as unknown as string[] ?? []) as string[]),
			mergeAll(),
			filter(entry => typeof entry === 'string')
		);
	}

	/**
	 * Whether a given user can edit this emote
	 */
	canEdit(user: UserStructure): Observable<boolean> {
		return this.getOwner().pipe(
			take(1),
			map(owner => (!!owner?.id && !!user?.id) ? owner.id === user.id : false),
			switchMap(ok => iif(() => ok,
				of(true),
				user.hasPermission('EDIT_EMOTE_ALL')
			))
		);
	}

	/**
	 * Edit this emote with new data, creating a mutation request to the API
	 *
	 * @param data the new emote data
	 * @param reason the reason for the action, which will be added with the audit log entry
	 */
	edit(data: Partial<DataStructure.Emote>, reason?: string, extraFields?: string[]): Observable<EmoteStructure> {
		return this.restService.v2.EditEmote({ id: this.id as string, ...data }, reason, extraFields).pipe(
			tap(res => this.mergeData(res.emote)),
			mapTo(this)
		);
	}

	/**
	 * Check whether the emote has a visibility flag
	 *
	 * @param flag the bit flag to test for
	 */
	hasVisibility(flag: keyof typeof DataStructure.Emote.Visibility): Observable<boolean> {
		return this.data.pipe(
			take(1),
			map(d => BitField.HasBits(d?.visibility ?? 0, DataStructure.Emote.Visibility[flag]))
		);
	}

	getVisibility(): number {
		return this.data.getValue()?.visibility ?? 0;
	}

	getVisibilities(): (keyof typeof DataStructure.Emote.Visibility)[] {
		const result = [] as (keyof typeof DataStructure.Emote.Visibility)[];

		const current = this.getVisibility();
		for (const v of Object.keys(DataStructure.Emote.Visibility)) {
			if (typeof v === 'number') continue;
			const sum = Number(DataStructure.Emote.Visibility[v as unknown as DataStructure.Emote.Visibility]);
			if (isNaN(sum)) continue;

			if (BitField.HasBits(current, sum)) {
				result.push(v as unknown as keyof typeof DataStructure.Emote.Visibility);
			}
		}
		return result;
	}

	getCreatedAt(): Observable<Date | null> {
		return this.data.pipe(
			take(1),
			map(d => !!d?.created_at ? new Date(d.created_at) : null)
		);
	}

	/**
	 * Add this emote to the client user's channel
	 */
	addToChannel(user: UserStructure, reason?: string): Observable<void> {
		if (!this.id) return EMPTY;

		return this.restService.v2.AddChannelEmote(this.id, user.id, reason).pipe(
			tap(res => {
				const newIDs = res.user.emote_ids as string[];
				user.pushData({ id: user.id, emote_ids: newIDs } as DataStructure.TwitchUser);
			}),
			mapTo(undefined)
		);
	}

	/**
	 * Remove this emote from the client user's channel
	 */
	removeFromChannel(user: UserStructure, reason?: string): Observable<void> {
		if (!this.id) return EMPTY;

		return this.restService.v2.RemoveChannelEmote(this.id, user.id, reason).pipe(
			tap(res => {
				const newIDs = res.user.emote_ids;
				user.pushData({ id: user.id, emote_ids: newIDs } as DataStructure.TwitchUser);
			}),
			mapTo(undefined)
		);
	}

	/**
	 * Whether or not the emote is added to the client user's channel
	 */
	isChannel(): Observable<boolean> {
		return this.restService.clientService.getActorUser().pipe(
			switchMap(usr => usr.hasEmote(this.id)),
			take(1)
		);
	}

	/**
	 * Delete this emote
	 */
	delete(reason?: string): Observable<void> {
		if (!this.id) return throwError(Error('Cannot delete unknown emote'));

		return this.restService.v2.DeleteEmote(this.id, reason).pipe(
			mapTo(undefined)
		);
	}

	// tslint:disable-next-line:typedef
	protected dataOnce() {
		return this.data.asObservable().pipe(
			take(1)
		);
	}

	getSnapshot(): DataStructure.Emote | null | undefined {
		return this.data.getValue();
	}
}
