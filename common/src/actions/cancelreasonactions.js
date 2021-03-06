import {
  FETCH_CANCEL_REASONS,
  FETCH_CANCEL_REASONS_SUCCESS,
  FETCH_CANCEL_REASONS_FAILED,
} from "../store/types";

import { language } from 'config';

export const fetchCancelReasons = () => (dispatch) => (firebase) => {

  const {
    cancelreasonRef
  } = firebase;

  dispatch({
    type: FETCH_CANCEL_REASONS,
    payload: null,
  });
  cancelreasonRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      let data = snapshot.val();
      let arr = [];
      for(let i=0;i<data.length;i++){
        arr.push(data[i].label);
      }
      dispatch({
        type: FETCH_CANCEL_REASONS_SUCCESS,
        payload: arr,
      });
    } else {
      dispatch({
        type: FETCH_CANCEL_REASONS_FAILED,
        payload: language.no_cancel_reason,
      });
    }
  });
};

export const fetchCancelReasonsApp = () => (dispatch) => (firebase) => {

  const {
    cancelreasonRef
  } = firebase;
  
  dispatch({
    type: FETCH_CANCEL_REASONS,
    payload: null,
  });
  cancelreasonRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      dispatch({
        type: FETCH_CANCEL_REASONS_SUCCESS,
        payload: snapshot.val()
      });
    } else {
      dispatch({
        type: FETCH_CANCEL_REASONS_FAILED,
        payload: language.no_cancel_reason,
      });
    }
  });
};
