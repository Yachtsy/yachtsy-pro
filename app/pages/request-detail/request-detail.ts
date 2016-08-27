import {Component} from '@angular/core';
import {Modal, NavController, NavParams, ModalController, LoadingController} from 'ionic-angular';
import {QuoteModal} from './quote-modal'
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/request-detail/request-detail.html',
  providers: [FirebaseService],
})
export class RequestDetailPage {

  requestId
  requestBody
  request
  db
  requests

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public fbserv: FirebaseService) {

    this.requestId = this.navParams.get('requestId');
    console.log(' the request id is', this.requestId);

  }

  ngOnInit() {

    console.log('ngOnInit - request details');

    var user = firebase.auth().currentUser;

    this.db = firebase.database().ref('users/' + user.uid + '/matchedRequests/' + this.requestId);

    this.db.on('value', (snapshot) => {

      this.requests = [];

      if (snapshot.exists()) {
        var requestData = snapshot.val();
        console.log('requestdata', requestData);
        this.request = snapshot.val();
        this.request['id'] = snapshot.key;
        this.requestBody = JSON.parse(this.request.body);
        console.log("the request body is", this.requestBody);
      }

    });
  }

  quote() {
    let modal = this.modalCtrl.create(QuoteModal, { request: this.request });
    modal.present();
  }

  pass() {

    let loading = this.loadingCtrl.create({
      content: 'Passing request',
      dismissOnPageChange: true
    });

    loading.present();

    this.fbserv.passRequest(this.requestId, this.request.uid)
    .then(()=>{
      this.nav.pop();

    });

  }

}
