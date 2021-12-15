import {
    FETCH_ABOUT_US,
    FETCH_ABOUT_US_SUCCESS,
    FETCH_ABOUT_US_FAILED,
  } from "../store/types";
  
  const INITIAL_STATE = {
    info:  null,
    loading: false,
    error: {
      flag: false,
      msg: null
    }
  }
  
  export const aboutusreducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case FETCH_ABOUT_US:
        return {
          ...state,
          loading: true
        };
      case FETCH_ABOUT_US_SUCCESS:
        return {
          ...state,
          info: action.payload,
          loading: false
        };
      case FETCH_ABOUT_US_FAILED:
        return {
          ...state,
          loading: false,
          error: {
            flag: true,
            msg: action.payload
          }
        };
      default:
        return state;
    }
  };