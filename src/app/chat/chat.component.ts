import { ChangeDetectorRef, Component, DoCheck, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContent') messageInput: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLDivElement>;
  connection: signalR.HubConnection;

  messages: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone) {}

  ngOnInit(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44396/chat')
      .build();

    this.ngZone.runOutsideAngular(() => {
      this.connection.on('ReceiveMessage', message => {
        this.ngZone.run(() => {
          console.log('hagara');
          this.messages.push(message);
          console.log('Messages: ', this.messages);
          setTimeout(() => this.messagesContainer.nativeElement.scrollBy(0, 99999));
        });
      });
      this.connection.start().then(() => console.log('Connection with chat server established.'));
    })
  }

  sendMessage(messageContent: string): void {
    this.connection.invoke('SendMessage', messageContent);
    this.messageInput.nativeElement.value = '';
  }

  sendDetailedMessage(): void {
    this.connection.invoke('SendDetailedMessage', {
      sender: 'Mesud',
      body: 'Some message body'
    });
    this.messageInput.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    this.connection.stop().then(() =>
      console.log("Connection to Chat server STOPPED.")
    );
  }
}
