import {NavController, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {RequestDetailPage} from '../request-detail/request-detail'
import {FirebaseService} from '../../components/firebaseService';

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
            currentRequest['pasttime'] = this.getPastTimeString(curTime - currentRequest.date) + ' ago';
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


    }
    );
  }

  getPastTimeString(duration) {
    var dur = (duration - duration % 1000) / 1000;
    var ss, mm, hh, dd, oo, yy;

    ss = dur % 60; dur = (dur - ss) / 60;
    mm = dur % 60; dur = (dur - mm) / 60;
    hh = dur % 24; dur = (dur - hh) / 24;
    dd = dur % 30; dur = (dur - dd) / 30;
    oo = dur % 12; yy = (dur - oo) / 12;

    if (yy > 0)
      return yy + 'y';
    else if (oo > 0)
      return oo + 'm';
    else if (dd > 0)
      return dd + 'd';
    else if (hh > 0)
      return hh + 'h';
    else if (mm > 0)
      return mm + 'm';
    else if (ss > 0)
      return ss + 's';
    else
      return 'now';
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
