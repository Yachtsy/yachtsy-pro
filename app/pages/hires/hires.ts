import {NavController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {MessagesPage} from '../messages/messages';
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/hires/hires.html',
  providers: [FirebaseService]

})
export class HiresPage {

  constructor(public nav: NavController, public fbserv: FirebaseService, private ngZone: NgZone) {

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

        this.hires = [];

        if (snapshot.exists()) {
          var requestData = snapshot.val();
          console.log('request data', requestData);

          Object.keys(requestData).map((key) => {

            requestData[key]['id'] = key;

            var hiring = requestData[key].hiring;

            if (hiring.isHired && !requestData[key].cleared && hiring.suppliers[this.user.uid]) {
              this.ngZone.run(() => {
                this.hires.push(requestData[key]);
              });
            }

          });
        }
        console.log('hires are:', this.hires);

      });
  }

  click(item) {
    console.log('hire clicked', item);

    this.nav.push(MessagesPage, {
      requestId: item.id,
      userId: item.uid
    });

  }

}
