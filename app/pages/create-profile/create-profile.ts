import {NavController, ActionSheetController, NavParams} from 'ionic-angular';
import {Component, NgZone} from '@angular/core';
import {SecurityContext, DomSanitizationService} from '@angular/platform-browser';
import {Keyboard, Camera} from 'ionic-native';
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
  public isWelcome = false;

  public changedFormFields = {};

  public profileForm: FormGroup;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizationService,
    public actionSheetCtrl: ActionSheetController,
    private ngZone: NgZone) {

    this.isWelcome = this.navParams.get("isWelcome");
    this.pages = this.navParams.get("pages");
    this.formPageIndex = this.navParams.get("formPageIndex");
    this.answers = this.navParams.get("answers");
    this.currentPage = this.pages[this.formPageIndex];

    if (this.currentPage.body && this.currentPage.body.items) {
      var items = [];
      for (var i = 0; i < this.currentPage.body.items.length; i++) {
        if (this.currentPage.body.items[i])
          items.push(this.currentPage.body.items[i]);
      }
      this.currentPage.body.items = items;
    }

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

  ionViewWillEnter() {
    if (Keyboard)
      Keyboard.hideKeyboardAccessoryBar(false);
  }

  ionViewWillLeave() {
    if (Keyboard)
      Keyboard.hideKeyboardAccessoryBar(true);
  }

  elementChanged(name) {
    this.changedFormFields[name] = true;
  }

  public submitAttempt = false;

  back() {
    this.nav.pop();
  }

  nextWelcome() {
    this.nav.push(CreateProfilePage, {
      formPageIndex: this.formPageIndex,
      pages: this.pages,
      answers: this.answers
    });
  }

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
    if (typeof Camera === 'undefined') {
      console.log('Camera plugin is not available.');
      return;
    }

    let actionSheet = this.actionSheetCtrl.create({
        buttons: [
            {
                text: 'Take a Photo',
                role: 'destructive',
                handler: () => {
                  this.getPicture(Camera.PictureSourceType.CAMERA);
                }
            }, {
                text: 'Choose from Library',
                role: 'cancel',
                handler: () => {
                  this.getPicture(Camera.PictureSourceType.PHOTOLIBRARY);
                }
            }
        ]
    });
    actionSheet.present();
  }

  getPicture(sourceType) {
    Camera.getPicture({
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: sourceType,
      targetWidth: 256,
      targetHeight: 256,
      correctOrientation: true
    }).then((imageData) => {
      // imageData is a base64 encoded string
      console.log('image taken');
      this.base64Image = "data:image/jpeg;base64," + imageData;

      this.answers[this.currentPage.name] = this.base64Image;
      // console.log(JSON.stringify(this.answers));

    }, (err) => {
      console.log(err);
    });
  }

  getSafeURL(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  save() {

    console.log(' trying to save profile data: ', JSON.stringify(this.answers));

    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/profile').set(this.answers)
      .then(() => {
        console.log('profile was successfully saved');

        this.ngZone.run(() => {
          this.nav.push(TabsPage);
        });
        
      })
  }

}
