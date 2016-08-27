import {NavController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {QuoteDetailPage} from '../quote-detail/quote-detail';
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/quotes/quotes.html',
  providers: [FirebaseService]
})
export class QuotesPage {
  constructor(
    public nav: NavController,
    private ngZone: NgZone,
    public fbserv: FirebaseService
  ) {

  }

  db
  requests

  clearRequest($event, request) {
    request.cleared = true;
    $event.stopPropagation()
    console.log($event);
    console.log('clear requests', request);
    this.fbserv.clearRequest(request.id);
  }

  ngOnInit() {

    console.log('ngOnInit - quotes');

    var user = firebase.auth().currentUser;

    this.db = firebase.database().ref('users/' + user.uid + '/matchedRequests');

    this.db.on('value', (snapshot) => {

      if (snapshot.exists()) {
        var requestData = snapshot.val();
        this.requests = [];

        console.log('quotes data ', requestData);

        Object.keys(requestData).map((key) => {
          
          let req = requestData[key];
          let requestHiredByThisSupplier = req.hiring.isHired && req.hiring.suppliers[user.uid]

          if (req.quote && !requestHiredByThisSupplier && !req.cleared) {
            req['id'] = key;

            this.ngZone.run(() => {

              this.requests.push(req);
              console.log('quotes adding ', req);
            });

          }
        });

      }
    });
  }

  click(item) {

    this.nav.push(QuoteDetailPage, {
      requestId: item.id
    });

  }

}
