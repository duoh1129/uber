import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILED,
  USER_SIGN_IN,
  USER_SIGN_IN_FAILED,
  USER_SIGN_OUT,
  CLEAR_LOGIN_ERROR,
  UPDATE_USER_PROFILE,
  USER_NOT_REGISTERED,
  USER_REGISTER,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAILED,
  USER_EMAIL_SIGNUP,
  USER_EMAIL_SIGNUP_FAILED,
  SEND_RESET_EMAIL,
  SEND_RESET_EMAIL_SUCCESS,
  SEND_RESET_EMAIL_FAILED,
  USER_DELETED,
  REQUEST_OTP,
  REQUEST_OTP_SUCCESS,
  REQUEST_OTP_FAILED,
  VALIDATE_REFERER,
  VALIDATE_REFERER_SUCCESS,
  VALIDATE_REFERER_FAILED
} from "../store/types";

import { language } from 'config';

export const fetchUser = () => (dispatch) => (firebase) => {

  const   {
    auth,
    singleUserRef,
    settingsRef
  } = firebase;

  dispatch({
    type: FETCH_USER,
    payload: null
  });
  auth.onAuthStateChanged(user => {
    if (user) {
      singleUserRef(user.uid).once("value", snapshot => {
        if (snapshot.val()) {
          user.profile = snapshot.val();
          if (user.profile.approved) {
            dispatch({
              type: FETCH_USER_SUCCESS,
              payload: user
            });
          } else {
            auth.signOut();
            dispatch({
              type: USER_SIGN_IN_FAILED,
              payload: { code: language.auth_error, message: language.require_approval }
            });
          }
        } else {
          settingsRef.once("value", settingdata => {
            let settings = settingdata.val();
            if ((user.providerData[0].providerId === "password" && settings.email_verify && user.emailVerified) || !settings.email_verify || user.providerData[0].providerId !== "password") {
              dispatch({
                type: USER_NOT_REGISTERED,
                payload: user
              });
            }
            else {
              user.sendEmailVerification();
              auth.signOut();
              dispatch({
                type: USER_SIGN_IN_FAILED,
                payload: { code: language.auth_error, message: language.email_verify_message }
              });
            }
          });
        }
      });
    } else {
      dispatch({
        type: FETCH_USER_FAILED,
        payload: { code: language.auth_error, message: language.not_logged_in }
      });
    }
  });
};

export const validateReferer = (regData) => (dispatch) => (firebase) => {

  const {
    referralRef,
    refererIdRef,
  } = firebase;

  dispatch({
    type: VALIDATE_REFERER,
    payload: null
  });
  refererIdRef(regData.refererId).once("value", (snapshot) => {
    ;
    if (snapshot.val()) {
      let users = snapshot.val();
      for (let key in users) {
        let referer = users[key];
        if (referer) {
          referralRef.once("value", (snapshot2) => {
            if (snapshot2.val()) {
              let amount = snapshot2.val();
              dispatch({
                type: VALIDATE_REFERER_SUCCESS,
                payload: {
                  refererUid: key,
                  amount: parseFloat(amount),
                  walletBalance: parseFloat(referer.walletBalance) + parseFloat(amount),
                  regData: regData
                }
              });
            }
          });
        }
      }
    } else {
      dispatch({
        type: VALIDATE_REFERER_FAILED,
        payload: language.referer_not_found
      });
    }
  });
}


export const addProfile = (userDetails) => (dispatch) => (firebase) => {

  const   {
    auth,
    singleUserRef,
    usersRef,
    settingsRef,
    walletHistoryRef,
    driverDocsRef
  } = firebase;

  dispatch({
    type: USER_REGISTER,
    payload: userDetails
  });

  let regData = {
    firstName: userDetails.firstName,
    lastName: userDetails.lastName,
    mobile: userDetails.mobile,
    email: userDetails.email,
    usertype: userDetails.usertype,
    createdAt: new Date().toISOString(),
    referralId: userDetails.firstName.toLowerCase() + Math.floor(1000 + Math.random() * 9000).toString(),
    approved: true,
    walletBalance: 0
  };

  if (userDetails.refererInfo) {
    regData.refererId = userDetails.refererId;
    singleUserRef(userDetails.refererInfo.refererUid).child('walletBalance').set(userDetails.refererInfo.walletBalance);
    let details = {
      type: 'Credit',
      amount: userDetails.refererInfo.amount,
      date: new Date().toString(),
      txRef: regData.referralId
    }
    walletHistoryRef(userDetails.refererInfo.refererUid).push(details);
  }

  if (userDetails.usertype === 'driver') {
    regData.vehicleNumber = userDetails.vehicleNumber;
    regData.vehicleModel = userDetails.vehicleModel;

    regData.carType = userDetails.carType;
    regData.bankCode = userDetails.bankCode;
    regData.bankName = userDetails.bankName;
    regData.bankAccount = userDetails.bankAccount;
    regData.queue = false;
    regData.driverActiveStatus = true;
    settingsRef.once("value", settingdata => {
      let settings = settingdata.val();
      if (settings.driver_approval) {
        regData.approved = false;
      }
      let timestamp = new Date().getTime();
      driverDocsRef(auth.currentUser.uid, timestamp).put(userDetails.licenseImage).then(() => {
        return driverDocsRef(auth.currentUser.uid, timestamp).getDownloadURL()
      }).then((url) => {
        regData.licenseImage = url;
        usersRef.child(auth.currentUser.uid).set(regData)
          .then(() => {
            dispatch({
              type: USER_REGISTER_SUCCESS,
              payload: regData
            });
          })
          .catch(error => {
            dispatch({
              type: USER_REGISTER_FAILED,
              payload: error.code + ": " + error.message
            });
          });
      }).catch((error) => {
        dispatch({
          type: USER_REGISTER_FAILED,
          payload: error.code + ": " + error.message
        });
      })
    });
  } else {
    usersRef.child(auth.currentUser.uid).set(regData)
      .then(() => {
        dispatch({
          type: USER_REGISTER_SUCCESS,
          payload: regData
        });
      })
      .catch(error => {
        dispatch({
          type: USER_REGISTER_FAILED,
          payload: error.code + ": " + error.message
        });
      });
  }
};

export const emailSignUp = (email, password) => (dispatch) => (firebase) => {

  const   {
    auth,
  } = firebase;

  dispatch({
    type: USER_EMAIL_SIGNUP,
    payload: null
  });
  auth.createUserWithEmailAndPassword(email, password).catch(function (error) {
    dispatch({
      type: USER_EMAIL_SIGNUP_FAILED,
      payload: error
    });
  });
};

export const requestPhoneOtpDevice = (phoneNumber, appVerifier) => (dispatch) => async (firebase) => {
  const   {
    phoneProvider
  } = firebase;
  dispatch({
    type: REQUEST_OTP,
    payload: null
  });
  try {
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      appVerifier
    );
    dispatch({
      type: REQUEST_OTP_SUCCESS,
      payload: verificationId
    });
  }
  catch (error) {
    dispatch({
      type: REQUEST_OTP_FAILED,
      payload: error
    });
  };
}

export const mobileSignIn = (verficationId, code) => (dispatch) => (firebase) => {
  const {
    auth,
    mobileAuthCredential,
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  auth.signInWithCredential(mobileAuthCredential(verficationId, code))
    .then((user) => {
      //OnAuthStateChange takes care of Navigation
    }).catch(error => {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
};


export const signIn = (email, password) => (dispatch) => (firebase) => {

  const   {
    auth
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
    auth
      .signInWithEmailAndPassword(email, password)
      .then(res => {
        //OnAuthStateChange takes care of Navigation
      })
      .catch(error => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error
        });
      });
};

export const facebookSignIn = (token) => (dispatch) => (firebase) => {

  const   {
    auth,
    facebookProvider,
    facebookCredential,
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  if (token) {
    const credential = facebookCredential(token);
    auth.signInWithCredential(credential)
      .then((user) => {
        //OnAuthStateChange takes care of Navigation
      }).catch(error => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error
        });
      }
      );
  } else {
    auth.signInWithPopup(facebookProvider).then(function (result) {
      var token = result.credential.accessToken;
      const credential = facebookCredential(token);
      auth.signInWithCredential(credential)
        .then((user) => {
          //OnAuthStateChange takes care of Navigation
        }).catch(error => {
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: error
          });
        }
        );
    }).catch(function (error) {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
  }
};

export const appleSignIn = (credentialData) => (dispatch) => (firebase) => {

  const   {
    auth,
    appleProvider,
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  if (credentialData) {
    const credential = appleProvider.credential(credentialData);
    auth.signInWithCredential(credential)
      .then((user) => {
        //OnAuthStateChange takes care of Navigation
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error
        });
      });
  } else {
    auth.signInWithPopup(appleProvider).then(function (result) {
      auth.signInWithCredential(result.credential)
        .then((user) => {
          //OnAuthStateChange takes care of Navigation
        }).catch(error => {
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: error
          });
        }
        );
    }).catch(function (error) {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
  }
};

export const signOut = () => (dispatch) => (firebase) => {

  const   {
    auth,
  } = firebase;

  auth
    .signOut()
    .then(() => {
      dispatch({
        type: USER_SIGN_OUT,
        payload: null
      });
    })
    .catch(error => {

    });
};

export const deleteUser = (uid) => (dispatch) => (firebase) => {

  const   {
    auth,
    singleUserRef
  } = firebase;

  singleUserRef(uid).remove().then(() => {
    auth.signOut();
    auth.currentUser.delete();
    dispatch({
      type: USER_DELETED,
      payload: null
    });
  });
};

export const updateProfile = (userAuthData, updateData) => (dispatch) => (firebase) => {

  const   {
    singleUserRef,
  } = firebase;

  let profile = userAuthData.profile;
  profile = { ...profile, ...updateData }
  dispatch({
    type: UPDATE_USER_PROFILE,
    payload: profile
  });
  singleUserRef(userAuthData.uid).update(updateData);
};


export const updateProfileImage = (userAuthData, imageBlob) => (dispatch) => (firebase) => {

  const   {
    singleUserRef,
    profileImageRef,
  } = firebase;

  profileImageRef(userAuthData.uid).put(imageBlob).then(() => {
    imageBlob.close()
    return profileImageRef(userAuthData.uid).getDownloadURL()
  }).then((url) => {
    let profile = userAuthData.profile;
    profile.profile_image = url;
    singleUserRef(userAuthData.uid).update({
      profile_image: url
    });
    dispatch({
      type: UPDATE_USER_PROFILE,
      payload: profile
    });
  })
};

export const updatePushToken = (userAuthData, token, platform) => (dispatch) => (firebase) => {

  const   {
    singleUserRef,
  } = firebase;

  let profile = userAuthData.profile;
  profile.pushToken = token;
  profile.userPlatform = platform;
  dispatch({
    type: UPDATE_USER_PROFILE,
    payload: profile
  });
  singleUserRef(userAuthData.uid).update({
    pushToken: token,
    userPlatform: platform
  });
};

export const clearLoginError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_LOGIN_ERROR,
    payload: null
  });
};

export const sendResetMail = (email) => (dispatch) => (firebase) => {

  const   {
    auth,
  } = firebase;

  dispatch({
    type: SEND_RESET_EMAIL,
    payload: email
  });
  auth.sendPasswordResetEmail(email).then(function () {
    dispatch({
      type: SEND_RESET_EMAIL_SUCCESS,
      payload: {
        code: language.success,
        message: language.reset_pass_msg
      }
    });
  }).catch(function (error) {
    dispatch({
      type: SEND_RESET_EMAIL_FAILED,
      payload: error
    });
  });
};
