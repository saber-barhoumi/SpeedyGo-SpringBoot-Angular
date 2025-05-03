import { Injectable } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { StompConfig } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client'; // ajoute ça si tu l'as pas déjà
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private rxStompService: RxStompService;

  constructor() {
    const config: StompConfig = {
      // Important : pas de brokerURL quand tu utilises SockJS
      brokerURL: undefined,

      // SockJS factory ici :
      webSocketFactory: () => new SockJS('http://localhost:8084/ws'),

      connectHeaders: {},
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 5000,
      debug: (msg: string): void => {
        console.log(new Date(), msg);
      }
    };

    this.rxStompService = new RxStompService();
    this.rxStompService.configure(config);
    this.rxStompService.activate();
  }

  public watchParcelStatus(parcelId: number): Observable<string> {
    return this.rxStompService.watch(`/topic/parcel/${parcelId}/status`).pipe(
      map(message => JSON.parse(message.body).status)
    );
  }

  public sendTrackingRequest(parcelId: number): void {
    this.rxStompService.publish({
      destination: '/app/track',
      body: parcelId.toString()
    });
  }
}
