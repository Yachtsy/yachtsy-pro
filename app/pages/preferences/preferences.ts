import {NavController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/preferences/preferences.html',
  //providers: [FirebaseService]
})
export class PreferencesPage {


  constructor(
    public nav: NavController,
    public fbserv: FirebaseService,
    private ngZone: NgZone
  ) {

  }

  profile

  updateItem(item) {

    console.log('updating category preferences:', this.categoryValues);

    var prefs = {};

    for (var i = 0; i < this.categoryValues.length; i++) {
      var catVal = this.categoryValues[i];
      prefs[catVal.categoryId] = catVal.enabled;
    }

    console.log('PROFILE Interested categories:', this.profile.interestedCategories);
    console.log('NEW Interested categories:', prefs);


    var diff = JSON.stringify(this.profile.interestedCategories) !== JSON.stringify(prefs);

    if (diff) {
      this.fbserv.setCategoryPreferences(prefs)
        .then(() => {
          this.update();
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }

  update() {
    var user = firebase.auth().currentUser;
    console.log('UPDATING USER');

    this.categoryValues = [];
    this.categories = [];

    firebase.database().ref('users/' + user.uid)
      .once('value', (snapshot) => {


        console.log('categories def is', this.categoriesDef);

        this.profile = snapshot.val();
        console.log('interested categories', this.profile.interestedCategories);

        Object.keys(this.categoriesDef).map(
          (key) => {

            let item = {
              name: this.categoriesDef[key].name,
              value: false
            };

            console.log('checking key:', key);

            var pref = {
              categoryId: key,
              enabled: true
            }

            if (this.profile.interestedCategories[Number(key)]) {
              this.categoryValues.push(pref);
            } else {
              pref.enabled = false;
              this.categoryValues.push(pref);
            }

            this.ngZone.run(() => {
              this.categories.push(item);
            });

          });
        console.log(this.categoryValues)

      });
  }


  categoriesDef

  ngOnInit() {

    let ref = firebase.database().ref().child('categories');

    ref.on('value', (categorySnapshot) => {

      if (categorySnapshot.exists()) {

        ref.off();
        this.categoriesDef = categorySnapshot.val();
        console.log('categoriesDef:', this.categoriesDef);
        this.update();


      }
    });


  }

  categoryValues = [];
  categories = [];




}
