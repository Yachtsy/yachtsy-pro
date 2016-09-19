import {Component, NgZone, ViewChild, ElementRef} from '@angular/core';
import {NavParams, Content, NavController, ViewController, LoadingController} from 'ionic-angular';
import {ChatBubble} from '../../components/chat-bubble/chat-bubble';
import {Keyboard, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';
import {FirebaseService} from '../../components/firebaseService';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/quote-detail/quote-detail.html',
  directives: [ChatBubble]
})
export class QuoteDetailPage {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild(Content) content: Content;

  requestId

  constructor(
    public nav: NavController,
    private viewCtrl: ViewController,
    private ngZone: NgZone,
    public fbserv: FirebaseService,
    private loadingCtrl: LoadingController,
    public navParams: NavParams) {
    
    this.requestId = navParams.get('requestId');
    this.isHired = navParams.get('isHired');
    console.log('navigated to quote details', this.requestId);
  }

  request
  messages = [];
  section = 'quote';
  requestBody
  db
  userName = ""
  placeInfo
  map: any;
  contentsBottom = 0;
  footerBottom = 0;
  curTab = 0;
  isHired = false;
  
  ngOnInit() {

    console.log('ngOnInit - requests');
    var user = firebase.auth().currentUser;

    this.db = firebase.database().ref('users/' + user.uid + '/matchedRequests/' + this.requestId);
    
    this.db.on('value', (snapshot) => {
      if (snapshot.exists()) {
        this.request = snapshot.val();
        this.request['id'] = snapshot.key;
        console.log('quote details for request', this.request);
        this.requestBody = JSON.parse(this.request.body);

        if (typeof this.requestBody[0].ans[0] !== 'undefined' && typeof this.requestBody[0].ans[0].lat !== 'undefined') {
          this.placeInfo = {
            lat:    this.requestBody[0].ans[0].lat,
            lng:    this.requestBody[0].ans[0].lng,
            place:  this.requestBody[0].ans[0].placeName
          };
          this.requestBody.splice(0, 1);

          var jobType = [{
            qu:   'Job Type',
            ans:  [this.request.categoryName]
          }];
          this.requestBody = jobType.concat(this.requestBody);
        }
        else {
          this.placeInfo = {
            lat:    38.9072,
            lng:    -77.0369,
            place:  'Washington'
          };
        }
        console.log("the request body is", this.requestBody);

        this.createMap();
        this.loadProfile();
        this.loadMessages();

      }
    });

    console.log('init positions')
    let scrollContent = (<HTMLInputElement>document.querySelector('.quote-detail scroll-content'));
    scrollContent.style.marginBottom = 88 + 'px';
    this.contentsBottom = 88;
    this.footerBottom = 0;

    window.addEventListener('native.keyboardshow', (e) => {

        console.log('keyboard show')
        this.ngZone.run(() => {
            let scrollContent = (<HTMLInputElement>document.querySelector('.quote-detail scroll-content'));
            scrollContent.style.marginBottom = (e['keyboardHeight'] + 88) + 'px';
            this.contentsBottom = e['keyboardHeight'] + 88;
            this.footerBottom = e['keyboardHeight'];

            setTimeout(() => {
                if (this.content)
                    this.content.scrollToBottom(300);
            }, 100);
        });

    });

    window.addEventListener('native.keyboardhide', (e) => {

        console.log('keyboard hide')
        this.ngZone.run(() => {
            console.log('initialising postions')
            let scrollContent = (<HTMLInputElement>document.querySelector('.quote-detail scroll-content'));
            scrollContent.style.marginBottom = 88 + 'px';
            this.contentsBottom = 88;
            this.footerBottom = 0;
        });
    });
    
  }

  loadProfile() {
    var user_db = firebase.database().ref('users/' + this.request.uid);
    user_db.on('value', (snapshot) => {
      if (snapshot.exists()) {
        var profile = snapshot.val();
        this.userName = profile.name;
      }
    });
  }

  loadMessages() {
    var user = firebase.auth().currentUser;

    firebase.database().ref('messages/' + this.request.id + '/' + this.request.uid + '/'
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
            this.updateTime();
          });

          setTimeout(() => {
            this.content.scrollToBottom(300);
          }, 0);

          console.log('messages for this quote', this.messages);
        }
      });

  }

  ionViewWillEnter() {
    this.updateTime();
  }

  updateTime() {
    var curTime = new Date().getTime();
    for (var i = 0; i < this.messages.length; i++) {
      this.messages[i].pasttime = GlobalService.getPastTimeString(curTime - this.messages[i].timestamp) + ' ago';
    }    
  }

  createMap() {
    console.log("position = " + this.placeInfo.lat + " : " + this.placeInfo.lng);
    let latLng = new google.maps.LatLng(this.placeInfo.lat, this.placeInfo.lng);
 
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);    
  }

  back() {
    this.viewCtrl.dismiss();
  }

  more() {

  }

  clickToggle(idx) {
    console.log('click toggle tab: ' + idx);
    this.curTab = idx;
    if (idx === 0) {
      let scrollContent = (<HTMLInputElement>document.querySelector('.quote-detail scroll-content'));
      scrollContent.style.marginBottom = 88 + 'px';
      this.contentsBottom = 88;
      this.footerBottom = 0;
    }
    else if (idx === 1) {
      let scrollContent = (<HTMLInputElement>document.querySelector('.quote-detail scroll-content'));
      scrollContent.style.marginBottom = 0 + 'px';
      this.contentsBottom = 0;
      this.footerBottom = 0;
    }

    if (typeof Keyboard !== 'undefined')
      Keyboard.close();
  }

  message
  sendMessage($event) {

    if (!this.message || !this.isHired) {
        return;
    }
    console.log('about to send message: ' + this.message);

    var user = firebase.auth().currentUser;
    var messagePath = 'messages/' + this.request.id + '/' + this.request.uid + '/' + user.uid;

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

  attachMessage($event) {

  }

  mark() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.fbserv.markComplete(this.requestId)
      .then(function () {
        loading.dismiss();
      });    
  }

}
