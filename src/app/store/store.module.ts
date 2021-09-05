import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { StoreCallbackComponent } from 'src/app/store/callback/store-callback.component';
import { StoreRoutingModule } from 'src/app/store/store-routing.module';
import { StoreSubscribeCancelDialogComponent } from 'src/app/store/store-subscribe/cancel-prompt.component';
import { StoreSubscribeGiftDialogComponent } from 'src/app/store/store-subscribe/gift-prompt.component';
import { StoreSubscribeComponent } from 'src/app/store/store-subscribe/store-subscribe.component';
import { StoreSubscribeButtonComponent } from 'src/app/store/store-subscribe/subscribe-button.component';
import { StoreSubscribePromotionComponent } from 'src/app/store/store-subscribe/subscribe-promotion.component';
import { UtilModule } from 'src/app/util/util.module';

import { StoreComponent } from './store.component';

@NgModule({
	imports: [
		CommonModule,
		StoreRoutingModule,
		MaterialModule,
		ReactiveFormsModule,
		UtilModule
	],
	exports: [],
	declarations: [
		StoreComponent,
		StoreSubscribeComponent,
		StoreSubscribePromotionComponent,
		StoreSubscribeButtonComponent,
		StoreSubscribeCancelDialogComponent,
		StoreSubscribeGiftDialogComponent,
		StoreCallbackComponent
	],
	providers: [],
})
export class StoreModule { }
