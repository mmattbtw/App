import { DataStructure } from '@typings/typings/DataStructure';
import { UserStructure } from 'src/app/util/user.structure';

export class AuditLogEntry {
	actionUser: UserStructure | null = null;

	constructor(public data: DataStructure.AuditLog.Entry) {}

	setActionUser(user: UserStructure): this {
		this.actionUser = user;

		return this;
	}
}
