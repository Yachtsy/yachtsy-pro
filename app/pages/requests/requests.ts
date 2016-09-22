import {NavController, LoadingController, ToastController, ModalController, Modal} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {RequestDetailPage} from '../request-detail/request-detail'
import {FirebaseService} from '../../components/firebaseService';
import {TabsPage} from '../tabs/tabs';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/requests/requests.html',
})
export class RequestsPage {


  public requests: any;

  constructor(
    public nav: NavController,
    private ngZone: NgZone,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public fbserv: FirebaseService ) {
    console.log('tabs requests page');
  }

  ngOnInit(){
    this.requests = GlobalService.matchedRequests;
  }

  ngOnDestroy() {
    console.log('ngOnDestroy - requests');
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter - requests');

    var curTime = new Date().getTime();
    for (var i = 0; i < this.requests.data.length; i++)
      this.requests.data[i].pasttime = GlobalService.getPastTimeString(curTime - this.requests.data[i].date) + ' ago';
  }

  click(item) {
    
    console.log('item clicked', item);
    if (!item.read){
      console.log('marking request read');
      this.fbserv.supplierMarkRequestRead(item.id);
    }

    GlobalService.isWhatsNext = false;
    GlobalService.isPassed = false;

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
        else if (GlobalService.isPassed) {
          let toast = this.toastCtrl.create({
            message:    "You've passed on that request",
            duration:   3000,
            position:   'bottom'
          });
          toast.present();          
        }
      }, 100);
    });

    // this.nav.push(RequestDetailPage, {
    //   requestId: item.id
    // });
  }

}
