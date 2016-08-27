import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {QuotesPage} from '../quotes/quotes';
import {TabsPage} from '../tabs/tabs';

declare var firebase: any;

@Component({
  templateUrl: 'build/pages/request-detail/quote-modal.html',
})
export class QuoteModal {

  price
  request
  message

  constructor(private viewCtrl: ViewController, public navParams: NavParams, public nav: NavController) {

    console.log('nav params for quote modal', this.navParams);
    this.request = this.navParams.get('request');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  sendQuote() {

    console.log('sending a quote for price: ', this.price);

    let user = firebase.auth().currentUser;

    var op = {
      requestId: this.request.id,
      userId: this.request.uid,
      supplierId: user.uid,
      quote: {
        price: this.price,
        initialMessage: this.message
      },
      supplierNickName: user.email
    };

    var clientOpId = Math.floor(Math.random() * 100000000) + '';

    let operation = {
      userId: user.uid,
      operationType: 'newBid',
      payload: op,
      clientOpId: clientOpId
    };

    console.log('pushing quote:', operation);

    firebase.database().ref('queue/tasks').push(operation)
      .then(() => {
        this.close();
        this.nav.setRoot(TabsPage, {
          tabIndex: 1,
          request: this.request
        }, { animate: true /*, direction: 'forward'*/ })
      });
        // *****************************************
        // *****************************************
        // *****************************************
        // *****************************************
        // *****************************************

        // here we should subscribe to the clientOpId and not do anthing until 
        // we have an update on that as we are not supporting simultaneous updates (i.e. we are not
        // transactionally updating the credits / allowed credits of the pro)
        // to credits which has the potential to occur if the pro submits to bid in quick 
        // succession and they are processed simultaneously by by queue workers. 

      //   var bidNotificationRef = firebase.database().ref().child(user.uid).child('notifications').child(clientOpId);
      //   bidNotificationRef.on('value', 
      //     (snapshot) => {

      //       console.log('snap back');

      //       if (snapshot.exists) {
      //         bidNotificationRef.off();
      //         var notification = snapshot.val();

      //         if (notification.message === 'success') {

      //           this.close();

      //           this.nav.setRoot(TabsPage, {
      //             tabIndex: 1,
      //             request: this.request
      //           }, { animate: true /*, direction: 'forward'*/ })
      //         } else {
      //           // ***** TODO 
      //           // show user a error message as to why new bid failed. 
      //           // e.g. credits.
      //         }
      //       }
      //     });
      // }).catch((error) => {
      //   console.error(error);
      // });
  }

}