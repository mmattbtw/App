import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/DataStructure';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
}
