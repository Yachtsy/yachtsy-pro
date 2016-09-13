import {NavController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {RequestDetailPage} from '../request-detail/request-detail'

@Component({
  templateUrl: 'build/pages/requests/requests.html',
})
export class RequestsPage {


  public requests;

  constructor(public nav: NavController, private ngZone: NgZone) {
    console.log('tabs requests page');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy - requests');
  }

  ionViewLoaded(){
    
  }

  ngOnInit() {
    console.log('ngOnInit - requests');

    var user = firebase.auth().currentUser;

    let ref = firebase.database().ref('users/' + user.uid + '/matchedRequests');

    ref.orderByChild('passed').equalTo(false).on('value', (snapshot) => {

      this.requests = [];

      if (snapshot.exists()) {
        var requestData = snapshot.val();

        //console.log(requestData);
        var newRequests = [];
        Object.keys(requestData).map((key) => {

          var currentRequest = requestData[key];
          if (!(currentRequest.quote || currentRequest.hired || currentRequest.cancelled)) {
            currentRequest['id'] = key;
            newRequests.push(currentRequest);
          }
        });
        this.ngZone.run(() => {
          this.requests = newRequests;
        });

      }


    }
    );
  }


  click(item) {
    console.log('click');
    this.nav.push(RequestDetailPage, {
      requestId: item.id
    });
  }

}
