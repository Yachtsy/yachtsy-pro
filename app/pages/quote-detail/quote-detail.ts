import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/quote-detail/quote-detail.html',
})
export class QuoteDetailPage {

  requestId

  constructor(public nav: NavController, public navParams: NavParams) {
    this.requestId = navParams.get('requestId');
    console.log('navigated to quote details', this.requestId);
  }

  request
  messages = [];
  section = 'quote';
  requestBody
  db
  
  ngOnInit() {

    console.log('ngOnInit - requests');
    var user = firebase.auth().currentUser;

    this.db = firebase.database().ref('users/' + user.uid + '/matchedRequests/' + this.requestId);
    
    this.db.on('value', (snapshot) => {
      if (snapshot.exists()) {
        this.request = snapshot.val();
        this.request['id'] = snapshot.key;
        console.log('quote details for request', this.request);
        this.requestBody = JSON.parse(this.request.body);
        console.log("the request body is", this.requestBody);
      }
    });
    

  }
}
