import {NavController, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {QuoteDetailPage} from '../quote-detail/quote-detail';
import {FirebaseService} from '../../components/firebaseService';


@Component({
  templateUrl: 'build/pages/hires/hires.html',
  providers: [FirebaseService]

})
export class HiresPage {

  constructor(
    public nav: NavController,
    public modalCtrl: ModalController,
    public fbserv: FirebaseService,
    private ngZone: NgZone) {

  }

  db
  hires
  user
  request

  clearRequest($event, request) {
    request.cleared = true;
    $event.stopPropagation()
    console.log($event);
    console.log('clear requests', request);
    this.fbserv.clearRequest(request.id);
  }


  ngOnInit() {
    console.log('ngOnInit - requests');

    this.user = firebase.auth().currentUser;

    firebase.database().ref('users/' + this.user.uid + '/matchedRequests')
      .on('value', (snapshot) => {

        let hires = [];

        if (snapshot.exists()) {
          var requestData = snapshot.val();
          console.log('request data', requestData);

          Object.keys(requestData).map((key) => {

            requestData[key]['id'] = key;

            var hiring = requestData[key].hiring;

            if (hiring.isHired && !requestData[key].cleared && hiring.suppliers[this.user.uid]) {
              hires.push(requestData[key]);
            }

          });
        }
        
        this.ngZone.run(() => {
          this.hires = hires;
          console.log('hires are:', this.hires);
        });

      });
  }

  click(item) {
    console.log('hire clicked', item);

    let modal = this.modalCtrl.create(QuoteDetailPage, { requestId: item.id, isHired: true });
    modal.present();

    // this.nav.push(MessagesPage, {
    //   requestId: item.id,
    //   userId: item.uid
    // });

  }

}
