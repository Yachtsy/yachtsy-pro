import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";


//import * as firebase from "firebase";
// declare var firebase: any;

@Injectable()
export class FirebaseService {

    authCallback: any;

    constructor() {
        // Initialize Firebase
        // var config = {
        //     apiKey: "AIzaSyB2-pd_C9vShNuBpWzTBHzTtY6cinsYWM0",
        //     authDomain: "yachtsy.firebaseapp.com",
        //     databaseURL: "https://yachtsy.firebaseio.com",
        //     storageBucket: "project-1051109791616102915.appspot.com",

        // };
        // firebase.initializeApp(config);
    }




    // onAuthStateChanged(_function) {
    //     return firebase.auth().onAuthStateChanged((_currentUser) => {
    //         if (_currentUser) {
    //             console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.provider);
    //             _function(_currentUser);
    //         } else {
    //             console.log("User is logged out");
    //             _function(null)
    //         }
    //     })
    // }

    currentUser() {
        return firebase.auth().currentUser
    }

    logout() {
        return firebase.auth().signOut()
    }


    doOperation(operation, payload) {

        var clientId = Math.floor(Math.random() * 10000000) + '';

        var uid = firebase.auth().currentUser.uid;
        var op = {
            userId: uid,
            operationType: operation,
            payload: payload,
            clientOpId: clientId
        };

        return firebase.database().ref('queue/tasks').push(op)
            .then((data: any) => {

                var ref = firebase.database().ref().child('users').child(uid)
                    .child('notifications').child(clientId);

                return new Promise((resolve, reject) => {

                    ref.on('value', (notificationSnap) => {

                        if (notificationSnap.exists()) {

                            ref.off();
                            var notification = notificationSnap.val();
                            //console.log('GOT NOTIFICATION: ', notification);
                            if (!notification.error) {
                                data['clientId'] = clientId;
                                resolve(data);
                            } else {
                                console.log(notification.message);
                                reject(new Error(notification.stack));
                            }
                        } /*else {
                        console.log('NOTIFICATION **** does not exist');
                    }*/
                    });

                });
            });
    }

    setCategoryPreferences(categoryPreferences) {
        return this.doOperation('setCategoryPreferences', categoryPreferences);
    }

    markComplete(requestId) {
        return this.doOperation('supplierRequestComplete', { requestId: requestId });
    }

    clearRequest(requestId){
        return this.doOperation('clearRequest',  { requestId: requestId })
    }

    passRequest(requestId, userId) {
        let payload = {
            requestId: requestId,
            userId: userId
        }
        return this.doOperation('passRequest', payload);
    }

    createEmailUser(credentials) {

        return new Observable(observer => {
            firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
                .then((authData) => {
                    console.log("User created successfully with payload-", authData);
                    observer.next(authData)
                }).catch((_error) => {
                    console.log("Login Failed!", _error);
                    observer.error(_error)
                })
        });
    }
    login(credentials) {
        var that = this

        return new Observable(observer => {
            firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
                .then(function (authData) {
                    console.log("Authenticated successfully with payload-", authData);
                    observer.next(authData)
                }).catch(function (_error) {
                    console.log("Login Failed!", _error);
                    observer.error(_error)
                })
        });
    }

    uploadPhotoFromFile(_imageData, _progress) {


        return new Observable(observer => {
            var _time = new Date().getTime()
            var fileRef = firebase.storage().ref('images/sample-' + _time + '.jpg')
            var uploadTask = fileRef.put(_imageData['blob']);

            uploadTask.on('state_changed', function (snapshot) {
                console.log('state_changed', snapshot);
                _progress && _progress(snapshot)
            }, function (error) {
                console.log(JSON.stringify(error));
                observer.error(error)
            }, function () {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                var downloadURL = uploadTask.snapshot.downloadURL;

                // Metadata now contains the metadata for file
                fileRef.getMetadata().then(function (_metadata) {

                    // save a reference to the image for listing purposes
                    var ref = firebase.database().ref('images');
                    ref.push({
                        'imageURL': downloadURL,
                        'thumb': _imageData['thumb'],
                        'owner': firebase.auth().currentUser.uid,
                        'when': new Date().getTime(),
                        //'meta': _metadata
                    });
                    observer.next(uploadTask)
                }).catch(function (error) {
                    // Uh-oh, an error occurred!
                    observer.error(error)
                });

            });
        });
    }

    getUserProfile(userId) {
        var ref = firebase.database().ref().child('users').child(userId);

        return new Observable(observer => {
            ref.once('value').then(
                (snapshot) => {

                    observer.next(snapshot.val())
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    getDataObs() {
        var ref = firebase.database().ref('images')
        var that = this

        return new Observable(observer => {
            ref.on('value',
                (snapshot) => {
                    var arr = []

                    // snapshot.forEach(function (childSnapshot) {
                    //     var data = childSnapshot.val()
                    //     data['id'] = childSnapshot.key
                    //     arr.push(data);
                    // });
                    observer.next(arr)
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }
}