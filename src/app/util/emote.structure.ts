import { Injectable } from '@angular/core';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, noop, Observable, throwError } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';
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

	getTags():Observable<string[] | undefined> {
		return this.data.pipe(
			map(d => d?.tags)
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

	/**
	 * Whether a given user can edit this emote
	 */
	canEdit(userID: string, rank?: number): Observable<boolean> {
		return this.data.pipe(
			map(d => String(d?.owner)),
			map(ownerID => userID === ownerID || (rank ?? 0) >= Constants.Users.Rank.MODERATOR)
		);
	}

	edit(body: any): Observable<EmoteStructure> {
		return this.restService.Emotes.Edit(String(this.id), body).pipe(
			RestService.onlyResponse(),
			tap(res => this.data.next(res.body)),
			mapTo(this)
		);
	}

	/**
	 * Delete this emote
	 */
	delete(): Observable<void> {
		if (!this.id) return throwError(Error('Cannot delete unknown emote'));

		return this.restService.Emotes.Delete(this.id).pipe(
			RestService.onlyResponse(),
			mapTo(undefined)
		);
	}
}
