import {
  FETCH_ABOUT_US,
  FETCH_ABOUT_US_SUCCESS,
  FETCH_ABOUT_US_FAILED,
} from "../store/types";

import { language } from 'config';

export const fetchAboutUs = () => (dispatch) => (firebase) => {

  const {aboutusRef} = firebase;

  dispatch({
    type: FETCH_ABOUT_US,
    payload: null,
  });
  aboutusRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      let data = snapshot.val();
      dispatch({
        type: FETCH_ABOUT_US_SUCCESS,
        payload: data,
      });
    } else {
      dispatch({
        type: FETCH_ABOUT_US_FAILED,
        payload: language.about_us_fetch_failed,
      });
    }
  });
};
