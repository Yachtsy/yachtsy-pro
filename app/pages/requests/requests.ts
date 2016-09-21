import {NavController, LoadingController, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {RequestDetailPage} from '../request-detail/request-detail'
import {FirebaseService} from '../../components/firebaseService';
import {TabsPage} from '../tabs/tabs';
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
    public loadingCtrl: LoadingController,
    public fbserv: FirebaseService ) {
    console.log('tabs requests page');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy - requests');
  }

  // ionViewLoaded(){
    
  // }

  ionViewLoaded() {
    console.log('ngOnInit - requests');

    var user = firebase.auth().currentUser;

    let ref = firebase.database().ref('users/' + user.uid + '/matchedRequests');

    ref.orderByChild('passed').equalTo(false).on('value', (snapshot) => {

      this.requests = [];

      if (snapshot.exists()) {
        // let loading = this.loadingCtrl.create({
        //   content: 'Loading...'
        // });
        // loading.present();

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

        var i, j;
        for (i = 0; i < newRequests.length; i++) {
          for (j = i + 1; j < newRequests.length; j++) {
            if (newRequests[i].date < newRequests[j].date) {
              var tmp = {};
              Object.assign(tmp, newRequests[i]);
              newRequests[i] = newRequests[j];
              newRequests[j] = tmp;
            }
          }
        }

        this.ngZone.run(() => {
          this.requests = newRequests;
          for (i = 0; i < this.requests.length; i++)
            this.loadProfile(i);
          // loading.dismiss();
        });
      }

    });
  }

  loadProfile(idx) {
    var user_db = firebase.database().ref('users/' + this.requests[idx].uid);
    user_db.on('value', (snapshot) => {
      if (snapshot.exists()) {
        var profile = snapshot.val();
        this.requests[idx].userName = profile.name;
      }
    });
  }

  click(item) {
    
    console.log('item clicked', item);
    if (!item.read){
      console.log('marking request read');
      this.fbserv.supplierMarkRequestRead(item.id);
    }

    GlobalService.isWhatsNext = false;
    let modal = this.modalCtrl.create(RequestDetailPage, { requestId: item.id });
    modal.present();
    modal.onDidDismiss((data) => {
      setTimeout(() => {
        if (GlobalService.isWhatsNext === true) {
          GlobalService.mainTabRef.select(1);
          // this.nav.setRoot(TabsPage, {
          //   tabIndex: 1
          // }, { animate: true /*, direction: 'forward'*/ });
        }
      }, 100);
    });

    // this.nav.push(RequestDetailPage, {
    //   requestId: item.id
    // });
  }

}
