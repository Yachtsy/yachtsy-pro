import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Platform, Loading, ModalController, AlertController} from 'ionic-angular';
import {MenuController, Nav} from 'ionic-angular';
import {StatusBar, Keyboard, Network} from 'ionic-native';
import {IntroPage} from './pages/intro/intro';
import {TabsPage} from './pages/tabs/tabs';
import {SignupOrLoginPage} from './pages/signup-or-login/signup-or-login';
import {CreateProfilePage} from './pages/create-profile/create-profile';
import {SignupPage} from './pages/signup/signup';
import {NgZone} from '@angular/core';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {FirebaseService} from './components/firebaseService'
import {OfflinePage} from './pages/offline/offline'
import {RequestDetailPage} from './pages/request-detail/request-detail';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import GlobalService = require('./components/globalService');

declare var FirebasePlugin;

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // determine the first page based on whether the user is logged in.
  rootPage: any
  pages: Array<{ title: string, component: any }>;
  goneToProfileCreate = false;
  isInitFB = false;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private ngZone: NgZone
  ) {

    this.initializeApp();
  }

  start() {

    console.log('checking user...');
    var user = firebase.auth().currentUser;
    
    if (user) {
      this.getMatchedRequests();

      console.log('checking user profile...');
      firebase.database().ref('users/' + user.uid)
        .once('value').then((snapshot) => {

          console.log('the user is ', user.uid);

          if (snapshot.exists()) {

            var userData = snapshot.val();
            console.log('user', userData);

            if (userData.emailVerified && userData.profile) {
              console.log('going to tabs page now');
              this.ngZone.run(() => {
                this.nav.setRoot(TabsPage, {}, { animate: true, direction: 'forward' })
              });
            } else if (!userData.emailVerified) {
              console.log('user email not verified');
              this.nav.setRoot(SignupPage, {
                stepIndex: 6
              });
            } else if (userData.emailVerified && !userData.profile) {

              console.log('directing user to profile creation');

              firebase.database().ref('supplierProfileCreate').once('value',
                (snapshot) => {
                  if (snapshot.exists()) {
                    this.nav.setRoot(CreateProfilePage, {
                      isWelcome: true,
                      pages: snapshot.val().pages,
                      formPageIndex: 0,
                      answers: {}
                    }, { animate: true, direction: 'forward' });
                  }
                });
            }


          } else {
            console.log('NO USER PROFILE - logging user out');
            //firebase.auth().signOut();
            //this.nav.setRoot(SignupOrLoginPage);
          }
        })
    } else {
      console.log('going to sign up or login page')
      //this.nav.setRoot(SignupOrLoginPage);
    }
  }


  listenForAuthChanges(){

    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        console.log('no user so setting login page');
        this.ngZone.run(() => {
          this.nav.setRoot(SignupOrLoginPage);
        });
      } else {
        this.start();
      }
    });

  }

  getMatchedRequests() {
    var user = firebase.auth().currentUser;
    firebase.database().ref('users/' + user.uid + '/matchedRequests').on('value', (snapshot) => {
      if (snapshot.exists()) {

        var i, j, k;
        var requestData = snapshot.val();
        let matchedRequests = [], matchedQuotes = [], matchedHires = [];
        var curTime = new Date().getTime();

        console.log('request ', requestData);

        var requestUnreadCount = 0;
        var hireUnreadCount = 0;

        Object.keys(requestData).map((key) => {

          let req = requestData[key];
          req['id'] = key;

          if (req.read !== true)
            requestUnreadCount++;
          // if (req.read !== true)
          //   hireUnreadCount++;

          var body = JSON.parse(req.body);
          var desc = "";
          for (j = 0; j < body.length; j++) {
            if (body[j].ans && body[j].ans.length > 0) {
              for (k = 0; k < body[j].ans.length; k++) {
                if (typeof body[j].ans[k] !== 'object') {
                  if (desc === '')
                    desc = body[j].ans[k];
                  else
                    desc += (',' + body[j].ans[k]);
                }
              }
            }
          }
          req.desc = desc;

          if (!req.quote && !req.hired && !req.cancelled && !req.passed) {
            req.pasttime = GlobalService.getPastTimeString(curTime - req.date) + ' ago';
            matchedRequests.push(req);
          }

          if (req.quote && !(req.hiring.isHired && req.hiring.suppliers[user.uid]) && !req.cleared) {
            req.pasttime = GlobalService.getPastTimeString(curTime - req.quote.timestamp) + ' ago';
            matchedQuotes.push(req);
          }

          if (req.hiring.isHired && !req.cleared && req.hiring.suppliers[user.uid])
            matchedHires.push(req);

        });

        for (i = 0; i < matchedRequests.length; i++) {
          for (j = i + 1; j < matchedRequests.length; j++) {
            if (matchedRequests[i].date < matchedRequests[j].date) {
              var tmp = {};
              Object.assign(tmp, matchedRequests[i]);
              matchedRequests[i] = matchedRequests[j];
              matchedRequests[j] = tmp;
            }
          }
        }

        for (i = 0; i < matchedQuotes.length; i++) {
          for (j = i + 1; j < matchedQuotes.length; j++) {
            if (matchedQuotes[i].quote.timestamp < matchedQuotes[j].quote.timestamp) {
              var tmp = {};
              Object.assign(tmp, matchedQuotes[i]);
              matchedQuotes[i] = matchedQuotes[j];
              matchedQuotes[j] = tmp;
            }
          }
        }

        GlobalService.matchedRequests.data  = matchedRequests;
        GlobalService.matchedQuotes.data    = matchedQuotes;
        GlobalService.matchedHires.data     = matchedHires;

        if (requestUnreadCount === 0)
          GlobalService.tabBadgeInfo.requestUnreadCount = '';
        else
          GlobalService.tabBadgeInfo.requestUnreadCount = requestUnreadCount + '';
        if (hireUnreadCount === 0)
          GlobalService.tabBadgeInfo.hireUnreadCount = '';
        else
          GlobalService.tabBadgeInfo.hireUnreadCount = hireUnreadCount + '';

        console.log('request finished.');
      }
      else
        GlobalService.matchedRequests.data = [];

    });
  }

  pushTokenCallCount = 0;
  getPushToken() {
    let self = this;
    FirebasePlugin.getInstanceId(function (token) {
      // save this server-side and use it to push notifications to this device
      console.log('THE PUSH TOKEN IS: ', token);
      GlobalService.pushToken = token;
    }, function (error) {
      console.log((self.pushTokenCallCount + 1) + 'th trying error: ' + error);
      setTimeout(() => {
        self.pushTokenCallCount++;
        if (self.pushTokenCallCount < 30)
          self.getPushToken();
      }, 2000);
    });
  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Keyboard.hideKeyboardAccessoryBar(true);
      Keyboard.disableScroll(true);

      var offline = Observable.fromEvent(document, "offline");
      var online = Observable.fromEvent(document, "online");
      var networkState = Network.connection;

      // console.log('network state: ', networkState);
      if (networkState === 'none') {
        this.ngZone.run(() => {
          this.rootPage = OfflinePage;
        });
      }
      else {
        console.log('online and ready')
        this.isInitFB = true;
        this.listenForAuthChanges();
        this.start();
      }

      offline.subscribe(() => {
        console.log('offline update');
        // this.online = false;

        this.ngZone.run(() => {
          this.rootPage = OfflinePage;
        });
      });

      online.subscribe(() => {
        console.log('online update')
        if (!this.isInitFB) {
          this.isInitFB = true;
          console.log('doing init FB');
          this.listenForAuthChanges();
          this.start();
          var element = document.createElement("script");
          element.src = "http://maps.google.com/maps/api/js?libraries=places&key=AIzaSyB2-pd_C9vShNuBpWzTBHzTtY6cinsYWM0";
          document.body.appendChild(element);
        }
        this.ngZone.run(() => {
          if (firebase.auth().currentUser)
            this.rootPage = TabsPage;
          else
            this.rootPage = SignupOrLoginPage;
        });

      });

      if (typeof FirebasePlugin !== 'undefined') {
        FirebasePlugin.grantPermission();

        this.pushTokenCallCount = 0;
        this.getPushToken();

        FirebasePlugin.onNotificationOpen((notification) => {
          console.log(notification);
          var requestId = '';
          var supplierId = '';
          if (notification.aps) {
            requestId = notification.aps.requestId;
          }

          let alert = this.alertCtrl.create({
            title: 'Yachtsy Pro',
            message: '',
            buttons: [
              {
                text: 'Ignore',
                role: 'cancel',
                handler: () => {
                }
              },
              {
                text: 'View Request',
                handler: () => {
                  let modal = this.modalCtrl.create(RequestDetailPage, { requestId: requestId });
                  modal.present();
                  // nav.push(Messages, { requestId: requestId });
                }
              }
            ]
          });
          alert.present();

        }, function (error) {
          console.log(error);
        });
      } else {
        console.log('FIREBASE PLUGIN NOT DEFINED');
      }

    });
  }

}


var config = {
  prodMode: false,
  backButtonText: '',
  statusbarPadding: true, 
};

ionicBootstrap(MyApp, [disableDeprecatedForms(), provideForms(), FirebaseService], config);