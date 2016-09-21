import {NavController, NavParams, AlertController, LoadingController, Platform} from 'ionic-angular';
import {Injectable} from '@angular/core';
import {ControlGroup, FormBuilder} from '@angular/common';
import {Http} from '@angular/http';
import {CreateProfilePage} from '../create-profile/create-profile'
import {Component} from '@angular/core';
import {ElementRef, ViewChild} from '@angular/core';
import {GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';


@Component({
  templateUrl: 'build/pages/signup/signup.html',
})

export class SignupPage {

  categoryGroups
  categoryGroupKeys
  answers = {}

  hideSignupIntro: boolean = false;
  hideCategoryGroup: boolean = true;
  hideCategory: boolean = true;
  stepIndex = 0;
  questions
  fromValue: string;
  googleApiKey = "AIzaSyB2-pd_C9vShNuBpWzTBHzTtY6cinsYWM0";


  //userData
  firstName
  lastName
  email
  telephone
  userInfoForm

  @ViewChild('myAutocomplete') myAutocomplete: any;

  constructor(public nav: NavController,
    public navParams: NavParams,
    public http: Http,
    public formBuilder: FormBuilder,
    private platform: Platform,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController) {

    this.fromValue = '';
    //this.userData = null;

    this.questions = [
      { requiresAnswer: false, label: "Start by telling us a few details." },
      { requiresAnswer: true, label: "Which kind of services do you provide?", name: 'CategoryGroup' },
      { requiresAnswer: true, label: "Select which categories you can provide.", name: 'CategoryList' },
      { requiresAnswer: true, label: "Do any provide any of the following related services?", name: 'RelatedServices' },
      { requiresAnswer: true, label: "Where can you provide the servies?", name: 'LocationPreferences' },
      { requiresAnswer: true, label: "How far are you willing to travel?", name: 'TravelPreferences' },
      { requiresAnswer: true, label: "Please enter your contact information", name: 'ContactInfo' },
      { requiresAnswer: false, label: "Signup Complete!" }
    ];

    this.userInfoForm = formBuilder.group({
      'firstName': 'Alex',
      'lastName': 'Mady',
      'email': 'alexmady@gmail.com',
      'telephone': '0123456789'
    });


  }

  clearFrom() {
    console.log('clearing form focus');
    this.fromValue = '';
  }

  //private map: GoogleMap;

  // createMap() {
  //   this.platform.ready().then(() => {
  //     try {
  //       this.map = new GoogleMap('map_canvas' /*, {'backgroundColor': 'red'}*/);

  //       return GoogleMap.isAvailable().then(() => {

  //         return this.map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {



  //           this.map.getMyLocation().then((location) => {
  //             console.log("latitude:" + location.latLng.lat, "longitude:" + location.latLng.lng);
  //             let myPosition = new GoogleMapsLatLng(location.latLng.lat, location.latLng.lng);
  //             //console.log("My position is", myPosition);
  //             this.map.animateCamera({ target: myPosition, zoom: 10, duration: 1000 });
  //             this.map.setClickable(false);
  //             //loading.dismiss();
  //           });
  //           //alert("GoogleMap.onMapReady(): " + JSON.stringify(data));

  //         });
  //       });
  //     } catch (error) {
  //       //loading.dismiss();
  //     }
  //   });
  // }


  doAlert(title, subtitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }


  setupProfile() {

    if (this.user && this.user.emailVerified) {

      firebase.database().ref('supplierProfileCreate').once('value',
        (snapshot) => {
          if (snapshot.exists()) {
            console.log('got supplierProfileCreate', snapshot.val())
            this.nav.push(CreateProfilePage, {
              pages: snapshot.val().pages,
              formPageIndex: 0,
              answers: {}
            })
          } else {
            this.doAlert('ERROR!', 'Could not create profile.');
          }
        });
    } else {
      this.doAlert('Email not verified!', 'Please verify your email before continuing!');
    }
  }

  userEmailRef

  // profile creation submit
  onSubmit(formData) {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();


    // TODO validation
    // submit the form and if successful go to next.
    console.log('Form submitted is ', formData);
    this.answers[this.currentQuestion] = formData;

    // log in anonymously, creating a profile for the userid
    // maintain a emailid to userid mapping
    // check if the email that the user has specified is already in use

    var email = formData.email;
    console.log('users email for signup is:', email);

    firebase.auth().createUserWithEmailAndPassword(email, email)
      .then((user) => {

        // user is signed in on successful creation of account
        console.log('user', user);

        user.sendEmailVerification()
          .then(() => {

            console.log('email verification has been sent');

            // create the user's area
            var supplierInfo = {
              profileSetupStage: 0,
              categoryGroup: this.answers['CategoryGroup'],
              interestedCategories: this.answers['CategoryList'],
              firstName: formData.firstName,
              lastName: formData.lastName,
              locationInfo: this.answers['LocationPreferences'],
              email: formData.email,
              telephone: formData.telephone,
            };


            var op = {
              userId: user.uid,
              operationType: 'createSupplier',
              payload: supplierInfo,
              clientOpId: Math.floor(Math.random() * 100000000) + ''

            };

            firebase.database().ref('queue/tasks').push(op)
              .then((data) => {
                console.log('created supplier', data);

                loading.dismiss().then(() => {
                  firebase.database().ref('supplierProfileCreate').once('value',
                    (snapshot) => {
                      if (snapshot.exists()) {
                        this.nav.setRoot(CreateProfilePage, {
                          pages: snapshot.val().pages,
                          formPageIndex: 0,
                          answers: {}
                        }, { animate: true, direction: 'forward' });
                      }
                    });
                })
              }).catch((error) => {
                loading.dismiss();
                console.error(error);
              });

          }).catch((error: any) => {

            loading.dismiss().then(() => {
              console.error(error);

              let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: error.message,
                buttons: ['OK']
              });

              alert.present();
            });


          });

      }).catch((error: any) => {
        loading.dismiss().then(() => {
          console.error(error);

          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: error.message,
            buttons: ['OK']
          });

          alert.present();
        });

      });

  }


  lng
  lat
  placeName
  travelPref
  relatedServices
  //GOOGLE_MAP_TIMEOUT = 1000;


  ngAfterViewInit() {

    if (this.stepIndex === 4) {

      console.log('step index is 4 - do the map autocomplete places hting');


      // setTimeout(() => {
      //   this.createMap();
      // }, this.GOOGLE_MAP_TIMEOUT);

      //let input_from = (<HTMLInputElement>document.getElementById('autocomplete'));
      //.getElementsByTagName('input')[0];

      //console.log('the input:', input_from);

      let options = {
        types: [],
        //componentRestrictions: { country: 'uk' }
      };

      //var inputEl = this.myAutocomplete._native._elementRef.nativeElement;
      //console.log('autocomplete element is', inputEl);
      console.log('autocomplete element is', this.myAutocomplete.nativeElement);
      let autocomplete1 = new google.maps.places.Autocomplete(this.myAutocomplete.nativeElement, options);

      // add the first listener
      let self = this;
      google.maps.event.addListener(autocomplete1, 'place_changed', () => {

        console.log('place changed callback');
        let place = autocomplete1.getPlace();

        //this.fromValue = place.name;

        let geometry = place.geometry;
        if ((geometry) !== undefined) {

          console.log(place.name);

          console.log(geometry.location.lng());
          this.lng = geometry.location.lng();
          this.lat = geometry.location.lat();
          this.placeName = place.name;

          console.log(geometry.location.lat());

          // try {

          //   let myPosition = new GoogleMapsLatLng(this.lat, this.lng);
          //   console.log("My position is", myPosition);
          //   //this.map.animateCamera({ target: myPosition, zoom: 12, });
          //   this.map.setCenter(myPosition);
          //   this.map.addMarker({ position: myPosition });
          //   this.map.setClickable(true);

          // } catch (error) {

          // }


        };
      });
    }
  }

  user

  ngOnInit() {

    this.user = firebase.auth().currentUser;

    if (this.user) {
      firebase.database().ref('users/' + this.user.uid + '/emailVerified')
        .on('value', (snapshot) => {
          if (snapshot.exists()) {
            var verified = snapshot.val();
            if (verified) {
              this.user.reload().then(() => {
                console.log('user reloaded');
              })
            }
          }
        });
    }

    var stepIndex = this.navParams.get('stepIndex');
    if (stepIndex) {
      this.stepIndex = stepIndex;
    }

    var answers = this.navParams.get('answers');
    if (answers) {
      this.answers = answers;
    }

    this.categoryGroups = this.navParams.get('categoryGroups');
    this.relatedServices = this.navParams.get('relatedServices');
    if (!this.relatedServices) {
      this.relatedServices = [];
    }

    //console.log('category gorups are ', this.categoryGroups);
    if (this.categoryGroups) {
      this.categoryGroupKeys = Object.keys(this.categoryGroups).filter((groupKey) => {
        return this.categoryGroups[groupKey].enabled;
      });
    }


    //console.log('category groups:');
    //console.log(this.categoryGroups);

    if (this.questions[this.stepIndex].requiresAnswer) {
      this.currentQuestion = this.questions[this.stepIndex].name;
      //console.log('setting current questsion', this.currentQuestion, this.stepIndex);
      this.answers[this.currentQuestion] = {};
    }

    // if (this.stepIndex === 6) {
    //   firebase.auth().onAuthStateChanged(function (user) {
    //     if (user) {
    //       console.log('auth state changed', user);
    //     } else {
    //       console.log('USER LOGGED OUT');
    //     }
    //   });
    // }
  }

  currentQuestion




  doNext(skip) {

    let stepIndex = this.stepIndex + 1 + skip

    this.nav.push(SignupPage, {
      stepIndex: stepIndex,
      categoryGroups: this.categoryGroups,
      answers: this.answers,
      relatedServices: this.relatedServices
    }).then(() => {
      // console.log('****** step index used', stepIndex)
      // if (stepIndex === 4) {
      //   console.log('extra maps stuff going on &&&*&*&*&*&*&*&*&*&*&*&*');
      //   var els = document.getElementsByClassName("signup-page show-page")
      //   console.log('ELEMENTS:', els);
      //   if (els) {
      //     els[2].classList.add('hideme');
      //   }
      // }
    });
  }

  ionViewWillEnter() {
    // console.log(' step index is ' + this.stepIndex)
    // if (this.stepIndex === 2) {
    //   console.log('remove the hide me if its there')
    //   var els = document.getElementsByClassName("signup-page show-page")
    //   console.log('ELEMENTS:', els);
    //   if (els) {
    //     if (els[2].classList.contains('hideme')) {
    //       els[2].classList.remove('hideme');
    //     }
    //   }
    // }
  }

  // <ion-option value="10">Up to 10 miles</ion-option>
  //           <ion-option value="20"></ion-option>
  //           <ion-option value="30">Up to 30 miles</ion-option>
  //           <ion-option value="50">Up to 50 miles</ion-option>
  //           <ion-option value="75">Up to 75 miles</ion-option>
  //           <ion-option value="100">100 miles or more</ion-option>

  distancePrefs = [
    "Up to 20 miles",
    "Up to 30 miles",
    "Up to 50 miles",
    "Up to 75 miles",
    "100 miles or more"
  ];

  next(item) {

    console.log('STEP INDEX: ', this.stepIndex);

    if (!this.questions[this.stepIndex].requiresAnswer) {
      this.doNext(0);
    } else {

      if (this.stepIndex === 2 || this.stepIndex === 3) {

        // if we are selecting/deselecting something

        console.log('item? ', item);

        if (item) {
          console.log('setting answer:', this.answers);

          if (this.answers[this.currentQuestion][item.id]) {
            delete this.answers[this.currentQuestion][item.id];
          } else {
            this.answers[this.currentQuestion][item.id] = true;
          }

          console.log('answers set:', this.answers);
        } else {

          if (this.stepIndex === 2) {

            // check if there are any relatedCategories for the selected categories

            let db = firebase.database().ref('categories');
            this.relatedServices = [];

            db.once('value', (snapshot) => {

              var selectedCategoryIds = Object.keys(this.answers[this.questions[2].name]);

              console.log('selected categories are:', selectedCategoryIds);

              let categoriesData = snapshot.val();

              selectedCategoryIds.map((catKey) => {

                let relatedCategories = categoriesData[catKey].relatedCategories;

                console.log('relatedCategories are ', relatedCategories);

                if (relatedCategories) {
                  for (var i = 0; i < relatedCategories.length; i++) {

                    let relatedCategoryId = relatedCategories[i];
                    let relatedCategory = categoriesData[relatedCategoryId];

                    if (relatedCategory) {
                      relatedCategory.id = relatedCategoryId;
                      this.relatedServices.push(relatedCategory);
                    }
                  }
                }
              });

              console.log(snapshot.val());
              console.log('related services are: ', this.relatedServices);

              if (this.relatedServices.length === 0) {

                // skip the related services questsion
                this.doNext(1);

              } else {
                // go to the next question (the related servies question)
                this.doNext(0);
              }
            });
          } else if (this.stepIndex === 3){
            this.doNext(0);
          }
        }

      } else if (this.stepIndex === 4) {

        console.log('travel preferences');
        console.log('saving location: ', this.lng, this.lat);
        //console.log('travel pref', this.travelPref);
        var locationPreferences = {
          lat: this.lat,
          lng: this.lng,
          //          distance: this.travelPref,
          placeName: this.placeName

        };
        this.answers[this.currentQuestion] = locationPreferences;
        console.log(this.answers);
        this.doNext(0);

      } else {

        console.log(item);
        console.log('answers');
        this.answers[this.currentQuestion] = item;
        console.log(this.answers);
        this.doNext(0);
      }
    }
  }

}
