import { RestService } from 'src/app/service/rest.service';


export class EgVault {
	/**
	 * Wrapper for the EgVault API
	 */
	constructor(private restService: RestService) {

	}

	// tslint:disable:typedef
	get Root() {
		return () => this.restService.createRequest<EgVault.Response.Root>('get', '/', {}, 'egvault');
	}

	get Subscriptions() {
		return {
			Get: (userID: string | '@me') => this.restService.createRequest<EgVault.Response.GetSubscription>('get', `/subscriptions/${userID}`, {
				auth: true
			}, 'egvault'),
			Create: (
				paymentMethod: 'paypal' | 'stripe',
				renewInterval: 'monthly' | 'yearly',
				gift?: string
			) => {
				const params = new URLSearchParams();
				params.append('payment_method', paymentMethod);
				params.append('renew_interval', renewInterval);
				if (gift) {
					params.append('gift_for', gift);
				}
				console.log(params.toString(), gift);

				return this.restService.createRequest<EgVault.Response.CreateSubscription>('post', `/subscriptions?${params.toString()}`, {
					auth: true
				}, 'egvault');
			},
			Delete: (hard = false) => this.restService.createRequest<void>('delete', `/subscriptions/@me?hard=${hard}`, {
				auth: true
			}, 'egvault')
		};
	}

	// tslint:enable:typedef
}

export namespace EgVault {
	export namespace Response {
		export interface Root {
			online: boolean;
			uptime: string | Date;
		}

		export interface CreateSubscription {
			url: string;
		}

		export interface GetSubscription {
			subscription: Subscription;
			end_at: Date;
			renew?: boolean;
			gifted_count: number;
		}
	}

	export interface Subscription {
		ID: string;
		subscriber_id: string | null;
		gifter_id?: string;
		entitlements: {
			ROLE: string;
			BADGE: string;
		};
		provider: 'stripe' | 'paypal';
		provider_subscription_id: string;
		active: boolean;
		started_at?: Date;
		ending_at?: Date;
		renew?: boolean;
	}
}
