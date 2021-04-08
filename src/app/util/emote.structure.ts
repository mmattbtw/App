import { Injectable } from '@angular/core';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, EMPTY, Observable, throwError } from 'rxjs';
import { map, mapTo, mergeAll, take, tap } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';



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
		this.id = String(data?._id);
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
			map(d => d?.owner_name)
		);
	}

	getURL(size = 3): Observable<string | undefined> {
		return this.data.pipe(
			map(d => this.restService.CDN.Emote(String(d?._id), size))
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
		return this.data.pipe(
			map(d => d?.private ?? false)
		);
	}

	/**
	 * Whether or not the emote is global
	 */
	isGlobal(): Observable<boolean> {
		return this.data.pipe(
			map(d => d?.global ?? false)
		);
	}

	getAuditActivity(): Observable<DataStructure.AuditLog.Entry> {
		return this.data.pipe(
			take(1),
			map(emote => emote?.audit_entries ?? []),
			mergeAll()
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

	edit(body: any, reason?: string): Observable<EmoteStructure> {
		return this.restService.v1.Emotes.Edit(String(this.id), body, reason).pipe(
			RestService.onlyResponse(),
			tap(res => this.data.next(res.body)),
			mapTo(this)
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

		console.log('reasson', reason);
		return this.restService.v1.Emotes.Delete(this.id, reason).pipe(
			RestService.onlyResponse(),
			mapTo(undefined)
		);
	}

	getSnapshot(): DataStructure.Emote | null | undefined {
		return this.data.getValue();
	}
}
