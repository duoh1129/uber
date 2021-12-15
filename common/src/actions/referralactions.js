import {
  FETCH_REFERRAL_BONUS,
  FETCH_REFERRAL_BONUS_SUCCESS,
  FETCH_REFERRAL_BONUS_FAILED,
  EDIT_REFERRAL_BONUS,
  CLEAR_REFERRAL_ERROR
} from "../store/types";

export const fetchBonus = () => (dispatch) => (firebase) => {

  const {
    referralRef
  } = firebase;

  dispatch({
    type: FETCH_REFERRAL_BONUS,
    payload: null
  });
  referralRef.on("value", snapshot => {
    if (snapshot.val()) {
      dispatch({
        type: FETCH_REFERRAL_BONUS_SUCCESS,
        payload: snapshot.val()
      });
    } else {
      dispatch({
        type: FETCH_REFERRAL_BONUS_FAILED,
        payload: "No bonus available."
      });
    }
  });
};

export const editBonus = (bonus, method) => (dispatch) => (firebase) => {

  const {
    referralRef
  } = firebase;

  dispatch({
    type: EDIT_REFERRAL_BONUS,
    payload: method
  });
  referralRef.set(bonus);
}

export const clearReferralError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_REFERRAL_ERROR,
    payload: null
  });
};