
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/app/service/logger.service';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class WebSocketService {
	constructor(
		private logger: LoggerService
	) { }

	/**
	 * Create a single purpose connection to the websocket.
	 *
	 * A WebSocket connection will be created, then an event will be sent;
	 * the connection remains active until the server closes it.
	 */
	createSinglePurposeConnection<T>(eventName: string, payload?: any): Observable<WebSocketService.SinglePurposePacket<T>> {
		return new Observable<WebSocketService.SinglePurposePacket<T>>(observer => {
			const ws = new WebSocket(environment.wsUrl); // Establish websocket connection

			ws.onopen = () => {
				this.logger.info(`<WS> Connected to ${environment.wsUrl}`);

				ws.onmessage = ev => { // Listen for messages
					let data: WebSocketService.SinglePurposePacket<T> | undefined;
					try { // Parse JSON
						data = JSON.parse(ev.data) as WebSocketService.SinglePurposePacket<T>;
					} catch (err) { observer.error(err); }
					if (!data) return undefined;

					// Emit the packet
					observer.next(data);

					return undefined;
				};

				// Listen for closure
				ws.onclose = ev => {
					console.log('close, done', ev.code, ev.code === 1000)
					if (ev.code === 1000)
						observer.complete();
					else
						observer.error(new WebSocketService.NonCompleteClosureError(ev.code, ev.reason));
				};

				// Send the event, requesting the server to begin sending us data
				ws.send(JSON.stringify({ type: eventName, payload }));
			};
		});
	}

}

export namespace WebSocketService {
	export interface SinglePurposePacket<T> {
		type: string;
		payload: T;
	}

	export interface Closure {
		closure: true;
		code: number;
		message: string;
	}

	export class NonCompleteClosureError extends Error {
		name = this.constructor.name;

		constructor(public code: number, public reason: string) {
			super();

			this.message = `${code} ${reason}`;
		}
	}
}
