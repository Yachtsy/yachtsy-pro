import {Component, NgZone} from '@angular/core';
import {AlertController, Modal, NavParams, NavController, ViewController, LoadingController} from 'ionic-angular';
import {QuotesPage} from '../quotes/quotes';
import {TabsPage} from '../tabs/tabs';
import {FirebaseService} from '../../components/firebaseService';
import {Keyboard, InAppPurchase} from 'ionic-native';
import GlobalService = require('../../components/globalService');


@Component({
  templateUrl: 'build/pages/request-detail/quote-modal.html',
})
export class QuoteModal {

  price
  request
  message
  contentsBottom
  footerBottom

  creditsRequiredForCategory

  constructor(private viewCtrl: ViewController,
    public navParams: NavParams,
    public nav: NavController,
    public FBService: FirebaseService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private ngZone: NgZone) {

    console.log('nav params for quote modal', this.navParams);
    this.request = this.navParams.get('request');

    this.FBService.getCreditsRequiredForCategory()
      .then((snapshot) => {
        this.creditsRequiredForCategory = snapshot.val();
      });
  }

  back() {
    this.viewCtrl.dismiss();
  }

  freeCreditsMode: boolean;

  ngOnInit() {
    firebase.database().ref().child('config').child('freeCreditsMode')
      .on('value', (snap) => {
        if (snap.exists()) {
          this.freeCreditsMode = snap.val();
        }
      });

    this.contentsBottom = 44;
    this.footerBottom = 0;

    window.addEventListener('native.keyboardshow', (e) => {

      console.log('keyboard show')
      this.ngZone.run(() => {
        let scrollContent = (<HTMLInputElement>document.querySelector('.quote-modal-content scroll-content'));
        scrollContent.style.marginBottom = (e['keyboardHeight'] + 44) + 'px';
        this.contentsBottom = e['keyboardHeight'] + 44;
        this.footerBottom = e['keyboardHeight'];
      });

    });

    window.addEventListener('native.keyboardhide', (e) => {

        console.log('keyboard hide')
        this.ngZone.run(() => {
          console.log('initialising postions')
          let scrollContent = (<HTMLInputElement>document.querySelector('.quote-modal-content scroll-content'));
          scrollContent.style.marginBottom = 44 + 'px';
          this.contentsBottom = 44;
          this.footerBottom = 0;
        });

    });

  }

  confirm = this.alertCtrl.create({
    title: 'Please buy some credits.',
    message: 'You need to buy some credits in order to be able send a quote.',
    buttons: [
      {
        text: 'Cancel',
        handler: () => {
          console.log('cancelled contact');
        }
      },
      {
        text: 'Buy Credits',
        handler: () => {
          console.log('want to buy credits');

          let loading = this.loadingCtrl.create({
            content: 'Loading...',
            duration: 60 * 1000
          });

          loading.present();



          //credits
          let prod1 = "com.yachtsy.yachtsypro.1credit";
          //let prod3 = "com.yachtsy.yachtsypro.3credits";
          //let prod5 = "com.yachtsy.yachtsypro.5credits";

          //let products = InAppPurchase.getProducts([prod1, prod3, prod5])
          InAppPurchase.getProducts([prod1])
            .then((prods) => {

              console.log('producats are:', prods);

              InAppPurchase.buy(prod1)

                .then((data: any) => {
                  console.log(JSON.stringify(data));
                  console.log('consuming transactionId: ' + data.transactionId);

                  InAppPurchase.consume(data.type, data.receipt, data.signature)
                    .then(() => {
                      console.log('consume done!');

                    });

                  this.FBService.validateReceipt(data.receipt)
                    .then(() => {

                      console.log('receipt was validated');

                      this.FBService.getCreditBalance()
                        .subscribe((credits) => {

                          loading.dismiss();

                          console.log('New credit balance is: ' + credits);

                          if (credits < this.creditsRequiredForCategory) {

                            console.log('credit balance is too low to send quote.')

                          } else {

                            console.log('now got enough credits - will send quote');
                            this.sendQuote();
                          }

                        });

                    }).catch((error) => {
                      loading.dismiss();
                      console.error('error validating receipt');
                      console.error(error);
                    });
                })
            })
        }
      }
    ]
  });


  sendQuote() {
    console.log('sending a quote for price: ', this.price);

    let user = firebase.auth().currentUser;

    var op = {
      requestId: this.request.id,
      supplierId: user.uid,
      quote: {
        price: this.price,
        initialMessage: this.message
      },
      supplierNickName: user.email
    };
    console.log('sending the quote...');

    this.FBService.sendQuote(this.request.id, this.price, this.message)
      .then((data) => {

        console.log('result from sending quote:', data)
        this.ngZone.run(() => {
          this.back();
          GlobalService.isWhatsNext = true;
          this.nav.setRoot(TabsPage, {
            tabIndex: 1,
            request: this.request
          }, { animate: true /*, direction: 'forward'*/ });
        });
      });

  }

  beforeSendQuote() {

    if (this.freeCreditsMode) {

      this.sendQuote();

    } else {

      this.FBService.getCreditBalance()
        .subscribe((credits) => {

          console.log('checking credits before quote', credits);

          // do not even try to send the quote if we know we dont have any credits
          if (credits < this.creditsRequiredForCategory) {

            this.confirm.present();

          } else {
            this.sendQuote();
          }
        });
    }

  }

}