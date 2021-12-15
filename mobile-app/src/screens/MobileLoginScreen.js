import React, { useState, useEffect, useRef, useContext } from "react";
import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    TextInput,
    Alert
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { language } from 'config';
import { TouchableOpacity } from "react-native-gesture-handler";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import RNPickerSelect from 'react-native-picker-select';
import { 
    countries, 
    default_country_code,
    FirebaseConfig,
    features
} from 'config';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';

export default function MobileLoginScreen(props) {
    const { api } = useContext(FirebaseContext);
    const {
        requestPhoneOtpDevice,
        mobileSignIn,
        clearLoginError
    } = api;
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            arr.push({ label: countries[i].label + " (+" + countries[i].phone + ")", value: "+" + countries[i].phone, key: countries[i].code });
        }
        return arr;
    }

    const [state, setState] = useState({
        phoneNumber: null,
        verificationId: null,
        verificationCode: null,
        countryCodeList: formatCountries(),
        countryCode: "+" + default_country_code.phone
    });

    const recaptchaVerifier = useRef(null);
    const pageActive = useRef(false);

    useEffect(() => {
        if(auth.info && pageActive.current){
            pageActive.current = false;
            props.navigation.navigate('AuthLoading');
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== language.not_logged_in) {
            pageActive.current = false;
            Alert.alert(language.alert, auth.error.msg.code + ": " + auth.error.msg.message);
            dispatch(clearLoginError());
        }
        if(auth.verificationId){
            pageActive.current = false;
            setState({ ...state, verificationId: auth.verificationId });
        }
    }, [auth.info,auth.error,auth.error.msg,auth.verificationId]);

    onPressLogin = async () => {
        if (state.countryCode && state.countryCode !== language.select_country) {
            if (state.phoneNumber) {
                let formattedNum = state.phoneNumber.replace(/ /g, '');
                formattedNum = state.countryCode + formattedNum.replace(/-/g, '');
                if (formattedNum.length > 8) {
                    pageActive.current = true;
                    dispatch(requestPhoneOtpDevice(formattedNum,recaptchaVerifier.current));
                } else {
                    Alert.alert(language.alert,language.mobile_no_blank_error);
                }
            } else {
                Alert.alert(language.alert,language.mobile_no_blank_error);
            }
        } else {
            Alert.alert(language.alert,language.country_blank_error);
        }
    }

    onSignIn = async () => {
        pageActive.current = true;
        dispatch(mobileSignIn(                
            state.verificationId,
            state.verificationCode
        ));
    }

    CancelLogin = () => {
        setState({
            ...state,
            phoneNumber: null,
            verificationId: null,
            verificationCode: null
        });
    }

    return (
        <KeyboardAvoidingView behavior={"position"} style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/bg.jpg')}
                resizeMode="stretch"
                style={styles.imagebg}
            >
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={FirebaseConfig}
                />
                <TouchableOpacity style={styles.backButton} onPress={() => { props.navigation.navigate('Intro') }}>
                    <Image
                        source={require("../../assets/images/ios-back.png")}
                        resizeMode="contain"
                        style={styles.backButtonImage}
                    ></Image>
                </TouchableOpacity>
                <Text style={styles.logintext}>{language.login_title}</Text>
                <View style={styles.blackline}></View>
                <View style={styles.box1}>
                    <RNPickerSelect
                        placeholder={{ label: language.select_country, value: language.select_country }}
                        value={state.countryCode}
                        useNativeAndroidPickerStyle={true}
                        style={{
                            inputIOS: styles.pickerStyle,
                            inputAndroid: styles.pickerStyle,
                        }}
                        onValueChange={(value) => setState({ ...state, countryCode: value })}
                        items={state.countryCodeList}
                        disabled={!!state.verificationId || !features.AllowCountrySelection ? true : false}
                    />
                </View>
                <View style={styles.box2}>
                    <TextInput
                        style={styles.textInput}
                        placeholder={language.mobile_no_placeholder}
                        onChangeText={(value) => setState({ ...state, phoneNumber: value })}
                        value={state.phoneNumber}
                        editable={!!state.verificationId ? false : true}
                        keyboardType="phone-pad"
                    />
                </View>
                {state.verificationId ? null :
                    <MaterialButtonDark
                        onPress={onPressLogin}
                        style={styles.materialButtonDark}
                    >{language.request_otp}</MaterialButtonDark>
                }
                {!!state.verificationId ?
                    <View style={styles.box2}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={language.otp_here}
                            onChangeText={(value) => setState({ ...state, verificationCode: value })}
                            value={state.verificationCode}
                            ditable={!!state.verificationId}
                            keyboardType="phone-pad"
                            secureTextEntry={true}
                        />
                    </View>
                    : null}
                {!!state.verificationId ?
                    <MaterialButtonDark
                        onPress={onSignIn}
                        style={styles.materialButtonDark}
                    >{language.authorize}</MaterialButtonDark>
                    : null}
                {state.verificationId ?
                    <View style={styles.actionLine}>
                        <TouchableOpacity style={styles.actionItem} onPress={CancelLogin}>
                            <Text style={styles.actionText}>{language.cancel}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    backButton: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: Dimensions.get('window').height * 0.55
    },
    backButtonImage: {
        height: 40,
        width: 40,
        marginTop: 50,
        marginLeft: 35,
        marginTop: 45
    },
    logintext: {
        color: "rgba(255,255,255,1)",
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center"
    },
    blackline: {
        width: 140,
        height: 1,
        backgroundColor: "rgba(0,0,0,1)",
        marginTop: 12,
        alignSelf: "center"
    },
    box1: {
        height: 35,
        backgroundColor: "rgba(255,255,255,1)",
        marginTop: 26,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: "#c2bbba",
        justifyContent: 'center'
    },
    box2: {
        height: 35,
        backgroundColor: "rgba(255,255,255,1)",
        marginTop: 12,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: "#c2bbba",
        justifyContent: 'center'
    },
    pickerStyle: {
        color: "#121212",
        fontFamily: "Roboto-Regular",
        fontSize: 18,
        marginLeft: 5
    },

    textInput: {
        color: "#121212",
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        textAlign: "left",
        marginLeft: 5
    },
    materialButtonDark: {
        height: 35,
        marginTop: 22,
        marginLeft: 35,
        marginRight: 35
    },
    actionLine: {
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    actionItem: {
        height: 20,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontWeight: 'bold'
    }
});
