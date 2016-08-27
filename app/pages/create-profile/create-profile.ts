import {NavController, NavParams} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {Camera} from 'ionic-native';
import {TabsPage} from '../tabs/tabs';
//import {FormBuilder, Control, ControlGroup, Validators, FORM_DIRECTIVES} from '@angular/common';
import { REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: 'build/pages/create-profile/create-profile.html',
})
export class CreateProfilePage {

  public base64Image: string;
  public pages
  public formPageIndex = -1
  public currentPage
  public answers = {};

  public changedFormFields = {};

  public profileForm: FormGroup;

  constructor(public nav: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private ngZone: NgZone) {

    this.pages = this.navParams.get("pages");
    this.formPageIndex = this.navParams.get("formPageIndex");
    this.answers = this.navParams.get("answers");
    this.currentPage = this.pages[this.formPageIndex];

    if (this.currentPage.type === 'input' || this.currentPage.type === 'select') {
      if (!this.answers[this.currentPage.name]) {
        this.answers[this.currentPage.name] = {};
      }
    }


  }

  ngOnInit() {
    if (this.currentPage.type === 'input') {

      var formFields = {};
      this.currentPage.body.items.map((item) => {
        formFields[item.name] = ['test1234', Validators.compose([Validators.required, Validators.minLength(5)])]
        this.changedFormFields[item.name] = false;
      });
      this.profileForm = this.formBuilder.group(formFields);
    }
  }

  elementChanged(name) {
    this.changedFormFields[name] = true;
  }

  public submitAttempt = false;

  submitForm() {

    this.submitAttempt = true;

    if (this.profileForm.valid) {
      console.log('success -> form valid ', this.profileForm.value);

      Object.keys(this.profileForm.value).map((key) => {
        this.answers[this.currentPage.name][key] = this.profileForm.value[key];
      })
      console.log(this.answers);
      this.next();
    }
  }

  next() {
    this.nav.push(CreateProfilePage, {
      formPageIndex: this.formPageIndex + 1,
      pages: this.pages,
      answers: this.answers
    });
  }

  clicked(item) {

    if (this.currentPage.type === 'select') {
      if (this.answers[this.currentPage.name][item.name]) {
        delete this.answers[this.currentPage.name][item.name];
      } else {
        this.answers[this.currentPage.name][item.name] = {
          selected: true,
          label: item.label
        };
      }
    }

    console.log(this.answers);

  }

  takePicture() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      // imageData is a base64 encoded string
      console.log('image taken');
      this.base64Image = "data:image/jpeg;base64," + imageData;

      console.log('writing image to answers:', this.base64Image);

      this.answers[this.currentPage.name]['photo'] = this.base64Image;


    }, (err) => {
      console.log(err);
    });
  }

  save() {

    console.log(' trying to save profile data: ', this.answers);

    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/profile').set(this.answers)
      .then(() => {
        console.log('profile was successfully saved');

        this.ngZone.run(() => {
          this.nav.push(TabsPage);
        });
        
      })
  }

}
