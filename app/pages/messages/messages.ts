import {Component, ViewChild, NgZone} from '@angular/core';
import {NavController, NavParams, LoadingController} from 'ionic-angular';
import {ChatBubble} from '../../components/chat-bubble/chat-bubble'
import {ElasticTextarea} from '../../components/elastic-textarea'
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/messages/messages.html',
  directives: [ChatBubble, ElasticTextarea],
  providers: [FirebaseService],
  queries: {
    txtChat: new ViewChild('txtChat'),
  }
})
export class MessagesPage {

  userId
  requestId

  @ViewChild('content') content: any;

  constructor(public nav: NavController,
    public navParams: NavParams,
    public fbserv: FirebaseService,
    private loadingCtrl: LoadingController,
    private ngZone: NgZone) {


  }

  public request: any;

  messages = [];


  markComplete() {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.fbserv.markComplete(this.requestId)
      .then(function () {
        loading.dismiss();
      });

  }

  ngOnInit() {

    console.log('ngOnInit - messages');

    var user = firebase.auth().currentUser;

    this.requestId = this.navParams.get('requestId');
    this.userId = this.navParams.get('userId');


    firebase.database().ref().child('users').child(user.uid).child('matchedRequests').child(this.requestId)
      .on('value', (snapshot) => {

        console.log('the request:', snapshot.val());
        this.request = snapshot.val();

      });


    firebase.database().ref('messages/' + this.requestId + '/' + this.userId + '/'
      + user.uid)
      .on('value', (snapshot) => {

        if (snapshot.exists()) {

          let msgData = snapshot.val();

          console.log('message data is', msgData);

          this.ngZone.run(() => {
            this.messages = Object.keys(msgData)
              .map((key) => {

                msgData[key].position = 'right';
                if (user.uid === msgData[key].uid) {
                  msgData[key].position = 'left';
                }

                return msgData[key];
              });
          });


          setTimeout(() => {
            this.content.scrollToBottom(300);
          }, 0);

          console.log('messages for this quote', this.messages);
        }
      });
  }




  message
  sendMessage() {

    var user = firebase.auth().currentUser;
    var messagePath = 'messages/' + this.requestId + '/' + this.userId + '/' + user.uid;


    var timestamp = {};
    timestamp['.sv'] = 'timestamp';

    var message = {
      uid: user.uid,
      body: this.message,
      timestamp: timestamp
    };

    firebase.database().ref(messagePath).push(message).then(() => {
      this.message = '';
      this.content.scrollToBottom(300);
    });


  }

}
