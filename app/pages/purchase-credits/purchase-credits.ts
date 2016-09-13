import {Component, NgZone} from '@angular/core';
import {Modal, NavController, NavParams, ModalController, LoadingController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {InAppPurchase} from 'ionic-native'

@Component({
    templateUrl: 'build/pages/purchase-credits/purchase-credits.html',
})
export class PurchaseCreditsPage {

    constructor(
        public nav: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        private ngZone: NgZone,
        public fbserv: FirebaseService) {


    }

    products
    user
    credits

    ngOnInit() {

        this.user = firebase.auth().currentUser;
        var ref = firebase.database().ref().child('users').child(this.user.uid);

        ref.on('value', (snapshot) => {
            this.ngZone.run(() => {
                let profile = snapshot.val();
                this.credits = profile.credits.balance;
                console.log('CREDITS UPDATE:', this.credits);
            });
        })

        let loader = this.loadingCtrl.create({
            content: "Loading products...",
        });
        loader.present();

        this.fbserv.getProducts()
            .then((prodSnap) => {

                if (prodSnap.exists()) {
                    var prods = prodSnap.val();
                    console.log(prodSnap.val());

                    var prodIds = Object.keys(prods).map((key) => {
                        var prod = prods[key];
                        return prod;
                    })

                    InAppPurchase.getProducts(prodIds)
                        .then((prods) => {

                            this.ngZone.run(() => {
                                console.log('products are ', prods);
                                this.products = prods;

                                Object.keys(this.products).map((key) => {
                                    console.log(this.products[key]);
                                });

                            });
                        }).then(()=> {
                            loader.dismiss();
                        });

                } else {
                    console.error('NO PRODUCTS FOUND');
                }

            });
    }




    buyCredits(productId) {

        let loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        loader.present();

        InAppPurchase.buy(productId)

            .then((data: any) => {
                console.log(JSON.stringify(data));
                console.log('consuming transactionId: ' + data.transactionId);

                InAppPurchase.consume(data.type, data.receipt, data.signature)
                    .then(() => {
                        console.log('consume done!');
                    });

                this.fbserv.validateReceipt(data.receipt)
                    .then(() => {
                        console.log('receipt was validated');
                        loader.dismiss();
                    }).catch((error) => {
                        loader.dismiss();
                        console.error('error validating receipt');
                        console.error(error);
                    });
            })


    }

}
