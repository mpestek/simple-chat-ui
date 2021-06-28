import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DetailedMessage } from './detailed-message.dto';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContent') messageInput: ElementRef<HTMLInputElement>;
  @ViewChild('nicknameInput') nicknameInput: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLDivElement>;
  connection: signalR.HubConnection;

  messages: DetailedMessage[] = [];

  constructor(
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44396/chat')
      .build();

    this.ngZone.runOutsideAngular(() => {
      this.connection.on('ReceiveDetailedMessage', message => {
        this.ngZone.run(() => {
          this.messages.push(message);
          console.log('Message: ', message);
          setTimeout(() => this.messagesContainer.nativeElement.scrollBy(0, 99999));
        });
      });
      this.connection.start().then(() =>
        console.log('Connection with chat server ESTABLISHED.')
      );
    })
  }

  sendMessage(messageContent: string): void {
    this.connection.invoke('SendDetailedMessage', {
      sender: this.nicknameInput.nativeElement.value,
      body: this.messageInput.nativeElement.value
    });
    this.messageInput.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    this.connection.stop().then(() =>
      console.log("Connection to Chat server STOPPED.")
    );
  }
}
