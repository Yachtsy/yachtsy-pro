import {NavController, NavParams, AlertController, LoadingController, Platform} from 'ionic-angular';
import {Injectable, ViewChild, ElementRef, NgZone} from '@angular/core';
import {ControlGroup, FormBuilder} from '@angular/common';
import {Http} from '@angular/http';
import {CreateProfilePage} from '../create-profile/create-profile'
import {Component} from '@angular/core';
import GlobalService = require('../../components/globalService');
import {Keyboard, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';


@Component({
  templateUrl: 'build/pages/signup/signup.html',
})

export class SignupPage {

  @ViewChild('map') mapElement: ElementRef;

  categoryGroups
  categorySelectedGroups
  categoryGroupKeys
  answers = {}
  map: any;

  hideSignupIntro: boolean = false;
  hideCategoryGroup: boolean = true;
  hideCategory: boolean = true;
  stepIndex = 0;
  questions
  fromValue: string;
  googleApiKey = "AIzaSyB2-pd_C9vShNuBpWzTBHzTtY6cinsYWM0";

  userInfoForm
  isResultHidden = true;
  locationTimer

  @ViewChild('myAutocomplete') myAutocomplete: any;

  constructor(public nav: NavController,
    public navParams: NavParams,
    public http: Http,
    public formBuilder: FormBuilder,
    private ngZone: NgZone,
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
      { requiresAnswer: true, label: "Where can you provide the services?", name: 'LocationPreferences' },
      { requiresAnswer: true, label: "How far are you willing to travel?", name: 'TravelPreferences' },
      { requiresAnswer: true, label: "Please enter your contact information", name: 'ContactInfo' },
      { requiresAnswer: false, label: "Signup Complete!" }
    ];

    this.userInfoForm = formBuilder.group({
      'firstName': '',
      'lastName': '',
      'email': '',
      'password': '',
      'telephone': ''
    });

    this.lat = 38.9072;
    this.lng = -77.0369;
    this.placeName = 'Washington';
  }

  ionViewWillEnter() {
    if (Keyboard) {
      console.log('keyboard accessory bar is enabled');
      Keyboard.hideKeyboardAccessoryBar(false);
    }

    if (this.stepIndex === 4) {
      this.isResultHidden = true;

      this.locationTimer = setInterval(() => {
          var i = 0;
          var popup_list = document.getElementsByClassName('pac-container');

          var isResultHidden = true;
          if (!popup_list)
              isResultHidden = true;
          else {
              for (i = 0; i < popup_list.length; i++) {
                  var popup: any;
                  popup = popup_list[i];
                  if (popup && popup.style.display !== 'none') {
                      isResultHidden = false;
                      break;
                  }
              }
              if (i >= popup_list.length)
                  isResultHidden = true;
          }

          if (isResultHidden !== this.isResultHidden) {
            console.log('Result Hidden: ' + isResultHidden);
            this.ngZone.run(() => {
              this.isResultHidden = isResultHidden;
            });
          }
      }, 100);
    }
  }

  ionViewWillLeave() {
    if (this.stepIndex === 4 &&  this.locationTimer)
        clearInterval(this.locationTimer);    
  }

  clearFrom() {
    console.log('clearing form focus');
    this.fromValue = '';
  }

  createMap() {
    if (this.map)
      return;

    console.log("position = " + this.lat + " : " + this.lng);
    let latLng = new google.maps.LatLng(this.lat, this.lng);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  updateMapPosition() {
    if (!this.map)
      this.createMap();
    else {
      this.map.setCenter(new google.maps.LatLng(this.lat, this.lng));
    }
  }

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

      firebase.database().ref('supplierProfileCreateNew').once('value',
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
    var password = formData.password;
    console.log('users password for signup is:', password);
    
    console.log('push token for signup is:', GlobalService.pushToken);

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user) => {

        // user is signed in on successful creation of account
        console.log('user', user);

        user.sendEmailVerification()
          .then(() => {

            console.log('email verification has been sent');

            var interestedCategories = {};

            if (this.answers['CategoryList']) {
              Object.keys(this.answers['CategoryList']).map((key => {
                interestedCategories[key] = this.answers['CategoryList'][key];
              }));
            }

            if (this.answers['RelatedServices']) {
              Object.keys(this.answers['RelatedServices']).map((key => {
                interestedCategories[key] = this.answers['RelatedServices'][key];
              }));
            }

            // create the user's area
            var supplierInfo = {
              profileSetupStage: 0,
              categoryGroup: this.answers['CategoryGroup'],
              interestedCategories: interestedCategories,
              firstName: formData.firstName,
              lastName: formData.lastName,
              locationInfo: this.answers['LocationPreferences'],
              email: formData.email,
              // password: formData.password,
              telephone: formData.telephone,
              pushToken: GlobalService.pushToken
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
                  firebase.database().ref('supplierProfileCreateNew').once('value',
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

      this.isResultHidden = true;

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

      this.createMap();

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

          this.updateMapPosition();

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
  answersLength

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

    this.answersLength = 0;

    this.categoryGroups = this.navParams.get('categoryGroups');
    this.relatedServices = this.navParams.get('relatedServices');
    if (!this.relatedServices) {
      this.relatedServices = [];
    }

    if (this.stepIndex === 2) {
      this.categorySelectedGroups = [];
      for (var id in this.answers[this.questions[1].name]) {
        var list = this.categoryGroups[this.answers[this.questions[1].name][id]].categories;
        this.categorySelectedGroups = this.categorySelectedGroups.concat(list);
      }
    }

    if (this.categoryGroups) {
      var groupKeys = [];
      groupKeys = Object.keys(this.categoryGroups).filter((groupKey) => {
        return this.categoryGroups[groupKey].enabled;
      });

      this.categoryGroupKeys = [];
      for (var i = 0; i < groupKeys.length; i++) {
        this.categoryGroupKeys.push({
          id:     i,
          name:   groupKeys[i]
        });
      }
    }

    if (this.questions[this.stepIndex].requiresAnswer) {
      this.currentQuestion = this.questions[this.stepIndex].name;
      //console.log('setting current questsion', this.currentQuestion, this.stepIndex);
      this.answers[this.currentQuestion] = {};
    }

  }

  currentQuestion

  back() {
    this.nav.pop();
  }

  doNext(skip) {

    let stepIndex = this.stepIndex + 1 + skip

    this.nav.push(SignupPage, {
      stepIndex: stepIndex,
      categoryGroups: this.categoryGroups,
      answers: this.answers,
      relatedServices: this.relatedServices
    });

  }

  distancePrefs = [
    { value: 20, text: "Up to 20 miles" },
    { value: 50, text: "Up to 50 miles" },
    { value: 75, text: "Up to 75 miles" },
    { value: 100, text: "Up to 100 miles" },
    { value: 999999999, text: "More than 100 miles" }
  ];

  next(item) {

    console.log('STEP INDEX: ', this.stepIndex);

    if (!this.questions[this.stepIndex].requiresAnswer) {
      this.doNext(0);
    } else {

      if (this.stepIndex <= 3) {

        // if we are selecting/deselecting something

        console.log('item? ', item);

        if (item) {
          console.log('setting answer:', this.answers);

          if (this.answers[this.currentQuestion][item.id]) {
            delete this.answers[this.currentQuestion][item.id];
          } else {
            if (this.stepIndex === 1)
              this.answers[this.currentQuestion][item.id] = item.name;
            else
              this.answers[this.currentQuestion][item.id] = true;
          }

          console.log('answers set:', this.answers);
          this.answersLength = Object.keys(this.answers[this.currentQuestion]).length;

          // if (this.stepIndex === 1) {
          //   this.doNext(0);
          // }

        } else {

          if (this.stepIndex === 1) {
            this.doNext(0);
          }
          else if (this.stepIndex === 2) {

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

                    // check if new service is already existing on list.
                    if (relatedCategory) {
                      for (var j = 0; j < this.relatedServices.length; j++) {
                        if (this.relatedServices[j].id === relatedCategoryId)
                          break;
                      }
                      if (j >= this.relatedServices.length) {
                        relatedCategory.id = relatedCategoryId;
                        this.relatedServices.push(relatedCategory);
                      }
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
          } else if (this.stepIndex === 3) {
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
          distance: this.travelPref,
          placeName: this.placeName
        };

        this.answers[this.currentQuestion] = locationPreferences;
        console.log(this.answers);
        this.doNext(1);

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
