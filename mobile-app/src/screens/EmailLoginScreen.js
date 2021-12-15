import React, { useState, useRef, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    Image,
    ActivityIndicator
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { language } from 'config';
import { TouchableOpacity } from "react-native-gesture-handler";
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';

export default function EmailLoginScreen(props) {
    const { api } = useContext(FirebaseContext);
    const {
        emailSignUp,
        signIn,
        sendResetMail,
        clearLoginError
    } = api;
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [state, setState] = useState({
        loading:false,
        email: '',
        password: '',
        confirmpassword: '',
        customStyleIndex: 0
    });
    const emailInput = useRef(null);
    const passInput = useRef(null);
    const confirmPassInput = useRef(null);
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
    }, [auth.info,auth.error,auth.error.msg]);



    validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email);
        if (!emailValid) {
            emailInput.current.focus();
            setState({...state,loading: false});
            Alert.alert(language.alert, language.valid_email_check);
        }
        return emailValid;
    }

    onAction = async () => {
        setState({...state,loading: true});
        const { email, password, confirmpassword, customStyleIndex } = state;
        if (customStyleIndex == 0) {
            if (validateEmail(email)) {
                if (password != '') {
                    pageActive.current = true;
                    dispatch(signIn(email, password));
                    setState({
                        ...state,
                        email: '',
                        password: '',
                        confirmpassword: ''
                    });
                    setState({...state,loading: false});
                    emailInput.current.focus();
                } else {
                    passInput.current.focus();
                    setState({...state,loading: false});
                    Alert.alert(language.alert, language.password_blank_messege);
                }
            }
        } else {
            if (validateEmail(email) && validatePassword(password, 'alphanumeric')) {
                if (password == confirmpassword) {
                    pageActive.current = true;
                    dispatch(emailSignUp(email, password));
                    setState({
                        ...state,
                        loading:false,
                        email: '',
                        password: '',
                        confirmpassword: ''
                    });
                    emailInput.current.focus();
                } else {
                    confirmPassInput.current.focus();
                    setState({...state,loading: false});
                    Alert.alert(language.alert, language.confrim_password_not_match_err);
                }
            }
        }
    }

    Forgot_Password = async (email) => {
        if (validateEmail(email)) {
            Alert.alert(
                language.forgot_password_link,
                language.forgot_password_confirm,
                [
                    { text: language.cancel, onPress: () => { }, style: 'cancel', },
                    {
                        text: language.ok,
                        onPress: () => {
                            pageActive.current = true;
                            dispatch(sendResetMail(email));
                        },
                    }
                ],
                { cancelable: true },
            )
        }
    }

    validatePassword = (password, complexity) => {
        const regx1 = /^([a-zA-Z0-9@*#]{8,15})$/
        const regx2 = /(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/
        if (complexity == 'any') {
            var passwordValid = password.length >= 1;
            if (!passwordValid) {
                passInput.current.focus();
                setState({...state,loading: false});
                Alert.alert(language.alert,language.password_blank_messege);
            }
        }
        else if (complexity == 'alphanumeric') {
            var passwordValid = regx1.test(password);
            if (!passwordValid) {
                passInput.current.focus();
                setState({...state,loading: false});
                Alert.alert(language.alert,language.password_alphaNumeric_check);

            }
        }
        else if (complexity == 'complex') {
            var passwordValid = regx2.test(password);
            if (!passwordValid) {
                passInput.current.focus();
                setState({...state,loading: false});
                Alert.alert(language.alert,language.password_complexity_check);
            }
        }
        return passwordValid
    }

    handleCustomIndexSelect = (index) => {
        setState({ ...state, customStyleIndex: index });
    };


    return (
        <KeyboardAvoidingView behavior={"position"} style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/bg.jpg')}
                resizeMode="stretch"
                style={styles.imagebg}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => { props.navigation.navigate('Intro') }}>
                        <Image
                            source={require("../../assets/images/ios-back.png")}
                            resizeMode="contain"
                            style={styles.backButtonImage}
                        ></Image>
                    </TouchableOpacity>
                </View>
                <SegmentedControlTab
                    values={[language.email_login, language.register_email]}
                    selectedIndex={state.customStyleIndex}
                    onTabPress={handleCustomIndexSelect}
                    borderRadius={0}
                    tabsContainerStyle={styles.segmentcontrol}
                    tabStyle={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        borderColor: 'transparent',
                    }}
                    activeTabStyle={{ borderBottomColor: '#212121', backgroundColor: 'transparent', borderBottomWidth: 2, marginTop: 2 }}
                    tabTextStyle={{ color: '#fff', fontWeight: 'bold' }}
                    activeTabTextStyle={{ color: '#212121' }}
                />

                <View style={styles.box1}>
                    <TextInput
                        ref={emailInput}
                        style={styles.textInput}
                        placeholder={language.email_placeholder}
                        onChangeText={(value) => setState({ ...state, email: value })}
                        value={state.email}
                    />
                </View>
                <View style={styles.box2}>
                    <TextInput
                        ref={passInput}
                        style={styles.textInput}
                        placeholder={language.password_placeholder}
                        onChangeText={(value) => setState({ ...state, password: value })}
                        value={state.password}
                        secureTextEntry={true}
                    />
                </View>
                {state.customStyleIndex != 0 ?
                    <View style={styles.box2}>
                        <TextInput
                            ref={confirmPassInput}
                            style={styles.textInput}
                            placeholder={language.confrim_password_placeholder}
                            onChangeText={(value) => setState({ ...state, confirmpassword: value })}
                            value={state.confirmpassword}
                            secureTextEntry={true}
                        />
                    </View>
                    : null}
                <MaterialButtonDark
                    onPress={onAction}
                    style={styles.materialButtonDark}
                >{state.customStyleIndex == 0 ? language.login_button : language.register_link}</MaterialButtonDark>
                {state.customStyleIndex == 0 ?
                    <View style={styles.linkBar}>
                        <TouchableOpacity style={styles.barLinks} onPress={() => Forgot_Password(state.email)}>
                            <Text style={styles.linkText}>{language.forgot_password_link}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                {state.loading?
                    <View style={styles.loading}>
                        <ActivityIndicator color="#000000" size='large' />
                    </View>
                :null}
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom:40
      },
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
    topBar: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: Dimensions.get('window').height * 0.52
    },
    backButton: {
        height: 40,
        width: 40,
        marginTop: 50,
        marginLeft: 35,
        marginTop: 45,
    },
    backButtonImage: {
        height: 40,
        width: 40,
    },
    segmentcontrol: {
        color: "rgba(255,255,255,1)",
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50,
        marginLeft: 35,
        marginRight: 35
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
    },
    box2: {
        height: 35,
        backgroundColor: "rgba(255,255,255,1)",
        marginTop: 12,
        marginLeft: 35,
        marginRight: 35,
        borderWidth: 1,
        borderColor: "#c2bbba",
    },

    textInput: {
        color: "#121212",
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        textAlign: "left",
        marginTop: 8,
        marginLeft: 5
    },
    materialButtonDark: {
        height: 35,
        marginTop: 22,
        marginLeft: 35,
        marginRight: 35
    },
    linkBar: {
        flexDirection: "row",
        marginTop: 30,
        alignSelf: 'center'
    },
    barLinks: {
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    linkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: "Roboto-Bold",
    }
});