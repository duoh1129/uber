import {
  FETCH_CANCEL_REASONS,
  FETCH_CANCEL_REASONS_SUCCESS,
  FETCH_CANCEL_REASONS_FAILED,
} from "../store/types";

const INITIAL_STATE = {
  reasons: [],
  loading: false,
  error: {
    flag: false,
    msg: null
  }
}

export const cancelreasonreducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_CANCEL_REASONS:
      return {
        ...state,
        loading: true
      };
    case FETCH_CANCEL_REASONS_SUCCESS:
      return {
        ...state,
        reasons: action.payload,
        loading: false
      };
    case FETCH_CANCEL_REASONS_FAILED:
      return {
        ...state,
        reasons: [],
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