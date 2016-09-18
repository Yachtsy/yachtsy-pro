import {NavController, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {RequestDetailPage} from '../request-detail/request-detail'
import {FirebaseService} from '../../components/firebaseService';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/requests/requests.html',
})
export class RequestsPage {


  public requests;

  constructor(
    public nav: NavController,
    private ngZone: NgZone,
    public modalCtrl: ModalController,
    public fbserv: FirebaseService ) {
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
        var curTime = new Date().getTime();
        //console.log(requestData);
        var newRequests = [];
        Object.keys(requestData).map((key) => {

          var currentRequest = requestData[key];
          if (!(currentRequest.quote || currentRequest.hired || currentRequest.cancelled)) {
            currentRequest['id'] = key;
            currentRequest['pasttime'] = GlobalService.getPastTimeString(curTime - currentRequest.date) + ' ago';
            newRequests.push(currentRequest);
          }
        });
        this.ngZone.run(() => {
          for (var i = 0; i < newRequests.length; i++) {
            for (var j = i + 1; j < newRequests.length; j++) {
              if (newRequests[i].date < newRequests[j].date) {
                var tmp = {};
                Object.assign(tmp, newRequests[i]);
                newRequests[i] = newRequests[j];
                newRequests[j] = tmp;
              }
            }
          }

          this.requests = newRequests;
        });

      }

    });
  }

  click(item) {
    
    console.log('item clicked', item);
    if (!item.read){
      console.log('marking request read');
      this.fbserv.supplierMarkRequestRead(item.id);
    }

    let modal = this.modalCtrl.create(RequestDetailPage, { requestId: item.id });
    modal.present();

    // this.nav.push(RequestDetailPage, {
    //   requestId: item.id
    // });
  }

}
