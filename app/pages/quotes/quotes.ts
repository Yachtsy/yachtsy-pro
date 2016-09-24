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
  isWhatsNext = false
  whatsNextName = ''

  clearRequest($event, request) {
    request.cleared = true;
    $event.stopPropagation()
    console.log($event);
    console.log('clear requests', request);
    this.fbserv.clearRequest(request.id);
  }

  ngOnInit() {
    this.requests = GlobalService.matchedQuotes;
  }

  ionViewWillEnter() {
    this.isWhatsNext = GlobalService.isWhatsNext;
    this.whatsNextName = GlobalService.whatsNextName;

    var curTime = new Date().getTime();
    for (var i = 0; i < this.requests.length; i++) {
      this.requests.data[i].pasttime = GlobalService.getPastTimeString(curTime - this.requests.data[i].quote.timestamp) + ' ago';
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
    GlobalService.isWhatsNext = false;
    GlobalService.whatsNextName = '';
  }

}
