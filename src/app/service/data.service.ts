

import { Injectable } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { Structure as AbstractStructure } from 'src/app/util/abstract.structure';
import { EmoteStructure } from 'src/app/util/emote.structure';
import { RoleStructure } from 'src/app/util/role.structure';
import { UserStructure } from 'src/app/util/user.structure';

@Injectable({ providedIn: 'root' })
export class DataService {
	private store = {
		user: new Map<string, UserStructure>(),
		emote: new Map<string, EmoteStructure>(),
		role: new Map<string, RoleStructure>()
	} as { [key in DataService.StructureType]: Map<string, UserStructure | EmoteStructure | RoleStructure> };

	constructor() { }

	/**
	 * Get a cached structure of specified type with a query
	 *
	 * @param type the structure's type
	 * @param query query to find the structure
	 * @returns an observable which will emit instances of structures matching the query
	 */
	get<T extends DataService.StructureType>(type: T, query: Partial<DataService.StructureData<T>>): DataService.Structure<T>[] {
		const store = this.store[type];
		const structs = [] as DataService.Structure<T>[];

		// Find structure by ID if it is specified
		if (typeof query.id === 'string' && store.has(query.id)) {
			structs.push(store.get(query.id) as DataService.Structure<T>);
			return structs; // We stop here because there can never be a structure of one type with the same ID
		}

		// Search for structures matching query
		const q = {} as any;
		AbstractStructure.toDot(query, q);
		const keys = new Set([...Object.keys(q)]) as unknown as Set<(keyof AbstractStructure.Data)>;
		for (const [_, struct] of store) { // Iterate structures of type*
			const s = {} as any;
			AbstractStructure.toDot(struct.getSnapshot(), s);

			for (const k of keys.values()) { // For each structure iterate over keys
				const snapshot = struct.getSnapshot();
				if (!snapshot) continue;
				if (s[k] === q[k]) {
					structs.push(struct as DataService.Structure<T>);
				}
			}
		}

		return structs;
	}

	/**
	 * Create a new Structure from given data
	 *
	 * @param type the structure's type
	 * @param data the data of this structure
	 * @returns an array of structures created
	 */
	add<T extends DataService.StructureType>(type: T, ...data: DataService.StructureData<T>[]): DataService.Structure<T>[] {
		const store = this.store[type];
		const structs = [] as DataService.Structure<T>[];

		for (const d of data) {
			let struct = store.get(d.id);
			if (!struct) {
				const S = DataService.StructureClass[type];
				struct = new S(this);
			}

			struct.pushData(d as any);
			store.set(d.id, struct);
			structs.push(struct as DataService.Structure<T>);
		}
		return structs;
	}
}

export namespace DataService {
	export type StructureType = 'user' | 'emote' | 'role';

	export type Structure<T extends StructureType> = {
		user: UserStructure;
		emote: EmoteStructure;
		role: RoleStructure;
	}[T];

	export type StructureData<T extends StructureType> = {
		user: DataStructure.TwitchUser;
		emote: DataStructure.Emote;
		role: DataStructure.Role;
	}[T];

	export const StructureClass = {
		user: UserStructure,
		emote: EmoteStructure,
		role: RoleStructure
	};
}
