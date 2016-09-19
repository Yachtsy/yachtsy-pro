import {Component} from '@angular/core';

@Component({
    selector: 'chat-bubble',
    inputs: ['msg: message'],
    template:
    `
  <div class="chatBubble">
    <!--<img class="profile-pic {{msg.position}}" src="{{msg.img}}">-->
    <div class="chat-bubble {{msg.position}}">
      <div class="message">{{msg.body}}</div>
      <div class="message-detail">
          <!--<span style="font-weight:bold;">{{msg.uid}} </span>,-->
          <span>{{msg.pasttime}}</span>
      </div>
    </div>
  </div>
  `
})
export class ChatBubble {

    msg: any;

    constructor() {
        this.msg = {
            content: 'Am I dreaming?',
            position: 'left',
            time: '12/3/2016',
            senderName: 'Gregory'
        }
    }
}