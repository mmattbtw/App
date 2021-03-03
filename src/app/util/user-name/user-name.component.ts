import { Component, Input, OnInit } from '@angular/core';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';


@Component({
  selector: 'app-user-name',
  templateUrl: './user-name.component.html',
  styleUrls: ['./user-name.component.scss']
})
export class UserNameComponent implements OnInit {
  @Input() showAvatar = 0;


  constructor(
    public clientService: ClientService,
    public themingService: ThemingService
    ) { 
    

  }

  ngOnInit(): void {
  }

}
