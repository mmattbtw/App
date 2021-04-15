import { Component, OnInit } from '@angular/core';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { map, mergeAll, tap, toArray } from 'rxjs/operators';
import { UserService } from 'src/app/service/user.service';
import { WebSocketService } from 'src/app/service/websocket.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-admin-users',
	templateUrl: './admin-users.component.html',
	styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
	users = new BehaviorSubject<UserStructure[]>([]);

	constructor(
		private websocketService: WebSocketService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.websocketService.createSinglePurposeConnection<{ users: DataStructure.TwitchUser[]} >('GetUsers').pipe(
			map(pak => pak.payload.users ?? []),
			mergeAll(),
			map(user => this.userService.new(user)),
			toArray(),
			tap(users => this.users.next(users))
		).subscribe();
	}

}
