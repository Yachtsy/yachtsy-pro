import {NavController, NavParams, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {QuoteDetailPage} from '../quote-detail/quote-detail';
import {FirebaseService} from '../../components/firebaseService';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/quotes/quotes.html',
  providers: [FirebaseService]
})

export class QuotesPage {
  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private ngZone: NgZone,
    public fbserv: FirebaseService
  ) {
  }

  db
  requests
  isWhatsNext = true

  clearRequest($event, request) {
    request.cleared = true;
    $event.stopPropagation()
    console.log($event);
    console.log('clear requests', request);
    this.fbserv.clearRequest(request.id);
  }

  ngOnInit() {

    console.log('ngOnInit - quotes');

    this.isWhatsNext = GlobalService.isWhatsNext;
    GlobalService.isWhatsNext = false;

    var user = firebase.auth().currentUser;

    this.db = firebase.database().ref('users/' + user.uid + '/matchedRequests');

    this.db.on('value', (snapshot) => {

      if (snapshot.exists()) {

        var requestData = snapshot.val();
        let requests = [];

        console.log('quotes data ', requestData);

        Object.keys(requestData).map((key) => {

          let req = requestData[key];
          let requestHiredByThisSupplier = req.hiring.isHired && req.hiring.suppliers[user.uid]

          if (req.quote && !requestHiredByThisSupplier && !req.cleared) {
            req['id'] = key;
            requests.push(req);
          }

        });

        var i, j;
        for (i = 0; i < requests.length; i++) {
          for (j = i + 1; j < requests.length; j++) {
            if (requests[i].quote.timestamp < requests[j].quote.timestamp) {
              var tmp = {};
              Object.assign(tmp, requests[i]);
              requests[i] = requests[j];
              requests[j] = tmp;
            }
          }
        }

        this.ngZone.run(() => {
          this.requests = requests;
          this.updateTime();
        });

      }
    });
  }

  ionViewWillEnter() {
    this.updateTime();
  }

  updateTime() {
    var curTime = new Date().getTime();
    for (var i = 0; i < this.requests.length; i++) {
      this.requests[i].pasttime = GlobalService.getPastTimeString(curTime - this.requests[i].quote.timestamp) + ' ago';
    }
  }

  click(item) {
    console.log('quote clicked');
    let modal = this.modalCtrl.create(QuoteDetailPage, { requestId: item.id });
    modal.present();

    // this.nav.push(QuoteDetailPage, {
    //   requestId: item.id
    // });

  }

  done() {
    this.isWhatsNext = false;
  }

}
