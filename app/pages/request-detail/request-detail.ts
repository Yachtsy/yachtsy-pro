import {Component, NgZone, ViewChild, ElementRef} from '@angular/core';
import {Modal, NavController, NavParams, AlertController, ModalController, LoadingController, ViewController, Platform} from 'ionic-angular';
import {QuoteModal} from './quote-modal'
import {FirebaseService} from '../../components/firebaseService';
import {GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@Component({
  templateUrl: 'build/pages/request-detail/request-detail.html',
  providers: [FirebaseService],
})
export class RequestDetailPage {

  @ViewChild('map') mapElement: ElementRef;

  requestId
  requestBody
  request
  db
  requests
  userName = ""
  placeInfo
  map: any;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private platform: Platform,
    private zone: NgZone,
    public fbserv: FirebaseService) {

    this.requestId = this.navParams.get('requestId');
    console.log(' the request id is', this.requestId);

  }

  ngOnInit() {

    console.log('ngOnInit - request details');

    var user = firebase.auth().currentUser;

    this.db = firebase.database().ref('users/' + user.uid + '/matchedRequests/' + this.requestId);

    this.db.on('value', (snapshot) => {

      this.requests = [];

      if (snapshot.exists()) {
        var requestData = snapshot.val();
        console.log('requestdata', requestData);
        this.request = snapshot.val();
        this.request['id'] = snapshot.key;
        this.requestBody = JSON.parse(this.request.body);

        if (typeof this.requestBody[0].ans[0].lat !== 'undefined') {
          this.placeInfo = {
            lat:    this.requestBody[0].ans[0].lat,
            lng:    this.requestBody[0].ans[0].lng,
            place:  this.requestBody[0].ans[0].placeName
          };
          this.requestBody.splice(0, 1);

          var jobType = [{
            qu:   'Job Type',
            ans:  [this.request.categoryName]
          }];
          this.requestBody = jobType.concat(this.requestBody);
        }
        else {
          this.placeInfo = {
            lat:    38.9072,
            lng:    -77.0369,
            place:  'Washington'
          };
        }
        this.createMap();

        console.log("the request body is", this.requestBody);

        var user_db = firebase.database().ref('users/' + requestData.uid);
        user_db.on('value', (snapshot) => {
          if (snapshot.exists()) {
            var profile = snapshot.val();
            this.userName = profile.name;
          }
        });
      }

    });

  }

  createMap() {
    console.log("position = " + this.placeInfo.lat + " : " + this.placeInfo.lng);
    let latLng = new google.maps.LatLng(this.placeInfo.lat, this.placeInfo.lng);
 
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);    
  }

  quote() {
    let modal = this.modalCtrl.create(QuoteModal, { request: this.request });
    modal.present();
  }

  pass() {
    let confirm = this.alertCtrl.create({
      title: 'Pass Request',
      message: 'Do you want to pass on this request?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Pass',
          handler: () => {
            console.log('Pass clicked');

            let loading = this.loadingCtrl.create({
              content: 'Passing request',
              dismissOnPageChange: true
            });

            loading.present();

            this.fbserv.passRequest(this.requestId, this.request.uid)
            .then(()=>{
              loading.dismiss().then(() => {
                this.viewCtrl.dismiss();
              });
            });
          }
        }
      ]
    });
    confirm.present();

  }

  back() {
    this.viewCtrl.dismiss();
  }

  // private map: GoogleMap;
  // createMap() {
  //   GoogleMap.isAvailable().then(() => {

  //     this.map = new GoogleMap('map_canvas');

  //     // this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
  //     //   () => this.onMapReady(),
  //     //   () => alert("Error: onMapReady")
  //     // );

  //     // this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
  //     //   (data: any) => {
  //     //     alert("GoogleMap.onMapReady(): ");
  //     //   },
  //     //   () => alert("Error: GoogleMapsEvent.MAP_READY")
  //     // );

  //     this.map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
  //       console.log("GoogleMap.onMapReady(): " + JSON.stringify(data));

  //       this.zone.run(() => {
  //         let myPosition = new GoogleMapsLatLng(38.9072, -77.0369);
  //         console.log("My position is", myPosition);
  //         this.map.animateCamera({ target: myPosition, zoom: 10 });
  //       });

  //     });
  //   });
  // }

}
