import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';

export class RoleStructure {
	private id: string | undefined;
	private data = new BehaviorSubject<DataStructure.Role | (null | undefined)>(undefined);

	constructor() {

	}


	/**
	 * Add data to this emote
	 */
	 pushData(data: DataStructure.Role | (null | undefined)): RoleStructure {
		this.id = String(data?.id);
		this.data.next(data);

		return this;
	}

	getSnapshot(): DataStructure.Role | null | undefined {
		return this.data.getValue();
	}
}
