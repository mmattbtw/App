import { Injectable } from '@angular/core';
import { BitField } from '@typings/src/BitField';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, EMPTY, Observable, throwError } from 'rxjs';
import { filter, map, mapTo, mergeAll, take, tap } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';
import { UserStructure } from 'src/app/util/user.structure';



@Injectable({ providedIn: 'root'})
export class EmoteStructure {
	private id: string | undefined;
	private data = new BehaviorSubject<DataStructure.Emote | (null | undefined)>(undefined);
	constructor(
		private restService: RestService
	) {}

	/**
	 * Add data to this emote
	 */
	pushData(data: DataStructure.Emote | (null | undefined)): EmoteStructure {
		this.id = String(data?.id);
		this.data.next(data);

		return this;
	}

	getID(): string | undefined { return this.id; }

	getName(): Observable<string | undefined> {
		return this.data.pipe(
			map(d => d?.name)
		);
	}

	getOwnerID(): Observable<string | undefined> {
		return this.data.pipe(
			map(d => !!d?.owner ? String(d.owner) : undefined)
		);
	}

	getOwnerName(): Observable<string | undefined> {
		return this.data.pipe(
			map(d => d?.owner?.display_name)
		);
	}

	getOwner(): Observable<UserStructure | undefined> {
		return this.data.pipe(
			map(d => !!d?.owner ? new UserStructure().pushData(d.owner) : undefined)
		);
	}

	getChannels(): Observable<Partial<DataStructure.TwitchUser>[] | undefined> {
		return this.data.pipe(
			map(d => d?.channels)
		);
	}

	getURL(size = 3): Observable<string | undefined> {
		return this.data.pipe(
			map(d => this.restService.CDN.Emote(String(d?.id), size))
		);
	}

	getTags(): Observable<string[] | undefined> {
		return this.data.pipe(
			map(d => d?.tags)
		);
	}

	getStatus(): Observable<Constants.Emotes.Status | undefined> {
		return this.data.pipe(
			map(d => d?.status)
		);
	}

	getStatusName(): Observable<(keyof typeof Constants.Emotes.Status) | undefined> {
		return this.getStatus().pipe(
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
		return this.data.pipe(
			take(1),
			map(emote => (emote?.audit_entries ?? []) as DataStructure.AuditLog.Entry[]),
			mergeAll(),
			filter(entry => typeof entry !== 'string')
		);
	}

	getAuditActivityString(): Observable<string> {
		return this.data.pipe(
			take(1),
			map(emote => (emote?.audit_entries as unknown as string[] ?? []) as string[]),
			mergeAll(),
			filter(entry => typeof entry === 'string')
		);
	}

	/**
	 * Whether a given user can edit this emote
	 */
	canEdit(userID: string, rank?: number): Observable<boolean> {
		return this.data.pipe(
			map(d => String(d?.owner)),
			map(ownerID => userID === ownerID || (rank ?? 0) >= Constants.Users.Rank.MODERATOR)
		);
	}

	/**
	 * Edit this emote with new data, creating a mutation request to the API
	 *
	 * @param data the new emote data
	 * @param reason the reason for the action, which will be added with the audit log entry
	 */
	edit(data: Partial<DataStructure.Emote>, reason?: string): Observable<EmoteStructure> {
		return this.restService.v2.EditEmote({ id: this.id as string, ...data }, reason).pipe(
			tap(res => this.data.next({  ...this.data.getValue(), ...res.emote })),
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
			map(d => BitField.HasBits(d?.visibility ?? 0, DataStructure.Emote.Visibility[flag]))
		);
	}

	getVisibility(): number {
		return this.data.getValue()?.visibility ?? 0;
	}

	getCreatedAt(): Observable<Date | null> {
		return this.data.pipe(
			map(d => !!d?.created_at ? new Date(d.created_at) : null)
		);
	}

	/**
	 * Add this emote to the client user's channel
	 */
	addToChannel(): Observable<void> {
		if (!this.id) return EMPTY;

		return this.restService.v1.Channels.AddEmote(this.id).pipe(
			RestService.onlyResponse(),
			tap(res => this.restService.clientService.pushData(res.body)),
			mapTo(undefined)
		);
	}

	/**
	 * Remove this emote from the client user's channel
	 */
	removeFromChannel(): Observable<void> {
		if (!this.id) return EMPTY;

		return this.restService.v1.Channels.RemoveEmote(this.id).pipe(
			RestService.onlyResponse(),
			tap(res => this.restService.clientService.pushData(res.body)),
			mapTo(undefined)
		);
	}

	/**
	 * Whether or not the emote is added to the client user's channel
	 */
	isChannel(): Observable<boolean> {
		return this.restService.clientService.getEmotes().pipe(
			take(1),
			map(a => !!this.id && a.includes(this.id))
		);
	}

	/**
	 * Delete this emote
	 */
	delete(reason?: string): Observable<void> {
		if (!this.id) return throwError(Error('Cannot delete unknown emote'));

		return this.restService.v1.Emotes.Delete(this.id, reason).pipe(
			RestService.onlyResponse(),
			mapTo(undefined)
		);
	}

	getSnapshot(): DataStructure.Emote | null | undefined {
		return this.data.getValue();
	}
}
