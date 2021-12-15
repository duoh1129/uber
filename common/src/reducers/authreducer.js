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

const INITIAL_STATE = {
    info: null,
    loading: false,
    error: {
        flag: false,
        msg: null
    },
    verificationId:null,
    refererInfo: null
}

export const authreducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER:
            return {
                ...state,
                loading: true
            };
        case FETCH_USER_SUCCESS:
            return {
                ...state,
                info: action.payload,
                loading: false,
                error: {
                    flag: false,
                    msg: null
                },
                verificationId:null,
                refererInfo:null
            };
        case USER_NOT_REGISTERED:
            return {
                ...state,
                info: action.payload,
                verificationId:null,
                loading: false
            };
        case USER_REGISTER:
            return {
                ...state,
                loading:true
            };
        case USER_REGISTER_SUCCESS:
            return {
                ...state,
                info: { ...state.info, profile: action.payload },
                loading: false,
                refererInfo:null
            };
        case USER_REGISTER_FAILED:
            return {
                ...state,
                error: {
                    flag: true,
                    msg: action.payload
                },
                loading: false
            };
        case FETCH_USER_FAILED:
            return {
                ...state,
                loading: false,
                error: {
                    flag: true,
                    msg: action.payload
                },
                info: null
            };
        case USER_EMAIL_SIGNUP:
            return {
                ...state,
                loading:true
            };
        case USER_EMAIL_SIGNUP_FAILED:
            return {
                ...state,
                error: {
                    flag: true,
                    msg: action.payload
                },
                loading:false
            };
        case USER_SIGN_IN:
            return {
                ...state,
                loading: true
            };
        case USER_SIGN_IN_FAILED:
            return {
                ...state,
                info: null,
                loading: false,
                error: {
                    flag: true,
                    msg: action.payload
                }
            };
        case USER_SIGN_OUT:
            return INITIAL_STATE;
        case USER_DELETED:
            return INITIAL_STATE;
        case UPDATE_USER_PROFILE:
            return {
                ...state,
                info: {...state.info, profile:action.payload},
            };
        case CLEAR_LOGIN_ERROR:
            return {
                ...state,
                verificationId:null,
                error: {
                    flag: false,
                    msg: null
                },
                loading:false,
                userType:null,
                refererInfo:null
            };
        case REQUEST_OTP:
            return {
                ...state,
                loading: true
            };
        case REQUEST_OTP_SUCCESS:
            return {
                ...state,
                loading: false,
                verificationId:action.payload
            };
        case REQUEST_OTP_FAILED:
            return {
                ...state,
                loading: false,
                verificationId:null,
                error: {
                    flag: true,
                    msg: action.payload
                },
            };
        case SEND_RESET_EMAIL:
            return {
                ...state,
                loading: true
            };
        case SEND_RESET_EMAIL_SUCCESS:
            return {
                ...state,
                error: {
                    flag: true,
                    msg: action.payload
                },
                loading:false
            };
        case SEND_RESET_EMAIL_FAILED:
            return {
                ...state,
                loading: false,
                error: {
                    flag: true,
                    msg: action.payload
                },
            };
        case VALIDATE_REFERER:
            return {
                ...state,
                loading:true,
            }
        case VALIDATE_REFERER_SUCCESS:
            return {
                ...state,
                refererInfo: action.payload,
                loading: false
            };
        case VALIDATE_REFERER_FAILED:
            return {
                ...state,
                error: {
                    flag: true,
                    msg: action.payload
                },
                loading: false
            };

        default:
            return state;
    }
};