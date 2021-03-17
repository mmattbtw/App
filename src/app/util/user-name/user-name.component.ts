import { Component, Input, OnInit } from '@angular/core';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
import { UserStructure } from 'src/app/util/user.structure';


@Component({
	selector: 'app-user-name',
	templateUrl: './user-name.component.html',
	styleUrls: ['./user-name.component.scss']
})
export class UserNameComponent implements OnInit {
	@Input() user: UserStructure | undefined | null;
	@Input() showAvatar = true;
	@Input() avatarBorder = true;
	@Input() showUsername: boolean | null = true;
	@Input() clickable = true;

	/** [avatar size, font size]  */
	@Input() size: [number, number] = [2, .75];

	constructor(
		public clientService: ClientService,
		public themingService: ThemingService
	) {}

	/**
	 * Get the user targeted in this component. If it was not specified, default to client user
	 */
	get target(): UserStructure {
		return this.user ?? this.clientService;
	}

	ngOnInit(): void {
	}

}
