import React, { useState } from 'react';
import { 
    View, 
    Text,
    Dimensions, 
    TouchableOpacity, 
    ScrollView, 
    KeyboardAvoidingView,
    Image, 
    TouchableWithoutFeedback,
    Platform, 
    Alert 
} from 'react-native';
import Background from './Background';
import { Icon, Button, Header, Input } from 'react-native-elements'
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import { language } from 'config';
import RadioForm from 'react-native-simple-radio-button';
import RNPickerSelect from 'react-native-picker-select';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

export default function Registration(props) {

    const INITIAL_STATE = {
        usertype: 'rider',
        firstName: '',
        lastName: '',
        email: props.reqData ? props.reqData.profile.email : '',
        mobile: props.reqData ? props.reqData.profile.mobile : '',
        refererId: '',
        vehicleNumber: '',
        vehicleModel: '',
        carType: props.cars && props.cars.length > 0? props.cars[0].value: '',
        bankAccount: '',
        bankCode: '',
        bankName: '',
        licenseImage:null
    }

    const [state, setState] = useState(INITIAL_STATE);
    const [role, setRole] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);

    const radio_props = [
        { label: language.rider, value: 0 },
        { label: language.driver, value: 1 }
    ];

    CapturePhoto = async () => {
        const { status: cameraStatus } = await Permissions.askAsync(Permissions.CAMERA)
        const { status: cameraRollStatus } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (cameraStatus === 'granted' && cameraRollStatus === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1.0,
                base64:true
            });

            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                setCapturedImage(result.uri);
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        resolve(xhr.response); 
                    };
                    xhr.onerror = function() {
                        Alert.alert(language.alert, language.image_upload_error);
                        setLoader(false);
                    };
                    xhr.responseType = 'blob'; 
                    xhr.open('GET', Platform.OS=='ios'?data:result.uri, true); 
                    xhr.send(null); 
                });
                if(blob){
                    setState({ ...state, licenseImage: blob });
                }
            }
        } else {
            Alert.alert(language.alert,language.camera_permission_error)
        }
    }

    //upload cancel
    cancelPhoto = () => {
        setCapturedImage(null);
    }

    const setUserType = (value) => {
        if(value==0){
            setState({...state, usertype: 'rider' });
        }else{
            setState({...state, usertype: 'driver' });
        }
    }


    //register button press for validation
    onPressRegister = () => {
        const { onPressRegister } = props;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(state.email);
        if(emailValid && 
            state.firstName.length>0 && state.lastName.length >0 && state.mobile.length> 6 &&
                ((state.usertype == 'driver' && state.licenseImage !=null && state.vehicleModel.length>1 && state.vehicleNumber.length > 1) || state.usertype == 'rider')
        ){
            onPressRegister(state);
        }else{
            Alert.alert(language.alert,language.proper_input);
        }
    }


    return (
        <Background>
            <Header
                backgroundColor={colors.TRANSPARENT}
                leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 35, component: TouchableWithoutFeedback, onPress: props.onPressBack }}
                containerStyle={styles.headerContainerStyle}
                innerContainerStyles={styles.headerInnerContainer}
            />
            <ScrollView style={styles.scrollViewStyle}>
                <View style={styles.logo}>
                    <Image source={require('../../assets/images/logo165x90white.png')} />
                </View>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : "padding"} style={styles.form}>
                    <View style={styles.containerStyle}>
                        <Text style={styles.headerStyle}>{language.registration_title}</Text>

                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={30}
                                containerStyle={styles.iconContainer}
                            />
                            <RadioForm
                                radio_props={radio_props}
                                initial={role}
                                formHorizontal={true}
                                labelHorizontal={true}
                                buttonColor={'#fff'}
                                labelColor={'#fff'}
                                style={{marginTop:20,marginLeft:20}}
                                labelStyle ={{marginRight: 40}}
                                selectedButtonColor={'#fff'}
                                selectedLabelColor={'#fff'}
                                onPress={(value) => {
                                    setRole(value);
                                    setUserType(value);
                                }}
                            />
                        </View>
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={30}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.first_name_placeholder}
                                placeholderTextColor={colors.WHITE}
                                value={state.firstName}
                                keyboardType={'email-address'}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, firstName: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>

                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={30}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.last_name_placeholder}
                                placeholderTextColor={colors.WHITE}
                                value={state.lastName}
                                keyboardType={'email-address'}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, lastName: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>


                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='mobile-phone'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={40}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={props.reqData.profile.mobile ? false : true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.mobile_no_placeholder}
                                placeholderTextColor={colors.WHITE}
                                value={state.mobile}
                                keyboardType={'number-pad'}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, mobile: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='envelope-o'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={23}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={props.reqData.profile.email ? false : true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.email_placeholder}
                                placeholderTextColor={colors.WHITE}
                                value={state.email}
                                keyboardType={'email-address'}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, email: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='lock'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={30}
                                containerStyle={styles.iconContainer}
                            />

                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.referrer_id_placeholder}
                                placeholderTextColor={colors.WHITE}
                                value={state.re}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, refererId: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        {state.usertype == 'driver' ? 
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='ios-car'
                                type={'ionicon'}
                                color={colors.WHITE}
                                size={25}
                                containerStyle={styles.iconContainer}
                            />
                            {props.cars?
                                <RNPickerSelect
                                    placeholder={{}}
                                    value={state.carType}
                                    useNativeAndroidPickerStyle={true}
                                    style={{
                                        inputIOS: styles.pickerStyle,
                                        placeholder: {
                                            color: 'white',
                                        },
                                        inputAndroid: styles.pickerStyle,
                                    }}
                                    onValueChange={(value) => setState({ ...state, carType: value })}
                                    items={props.cars}
                                />
                                : null}
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='ios-car'
                                type={'ionicon'}
                                color={colors.WHITE}
                                size={25}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                returnKeyType={'next'}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.vehicle_model_name}
                                placeholderTextColor={colors.WHITE}
                                value={state.vehicleModel}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, vehicleModel: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.vehicle_reg_no}
                                placeholderTextColor={colors.WHITE}
                                value={state.vehicleNumber}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, vehicleNumber: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.bankName}
                                placeholderTextColor={colors.WHITE}
                                value={state.bankName}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, bankName: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.bankCode}
                                placeholderTextColor={colors.WHITE}
                                value={state.bankCode}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, bankCode: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={styles.textInputContainerStyle}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={language.bankAccount}
                                placeholderTextColor={colors.WHITE}
                                value={state.bankAccount}
                                inputStyle={styles.inputTextStyle}
                                onChangeText={(text) => { setState({ ...state, bankAccount: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ?
                            capturedImage?
                                <View style={styles.imagePosition}>
                                    <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                        <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                    </TouchableOpacity>
                                    <Image source={{ uri: capturedImage }} style={styles.photoResult} resizeMode={'cover'} />
                                </View>
                                :
                                <View style={styles.capturePhoto}>
                                    <View>
                                        {
                                            state.imageValid ?
                                                <Text style={styles.capturePhotoTitle}>{language.upload_driving_lisence}</Text>
                                                :
                                                <Text style={styles.errorPhotoTitle}>{language.upload_driving_lisence}</Text>
                                        }

                                    </View>
                                    <View style={styles.capturePicClick}>
                                        <TouchableOpacity style={styles.flexView1} onPress={CapturePhoto}>
                                            <View>
                                                <View style={styles.imageFixStyle}>
                                                    <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={styles.myView}>
                                            <View style={styles.myView1} />
                                        </View>
                                        <View style={styles.myView2}>
                                            <View style={styles.myView3}>
                                                <Text style={styles.textStyle}>{language.image_size_warning}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                        :null}
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={onPressRegister}
                                title={language.register_button}
                                loading={props.loading}
                                titleStyle={styles.buttonTitle}
                                buttonStyle={styles.registerButton}
                            />
                        </View>
                        <View style={styles.gapView} />
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </Background>
    );
};

const styles = {
    headerContainerStyle: {
        backgroundColor: colors.TRANSPARENT,
        borderBottomWidth: 0,
        marginTop: 0
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
    },
    inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: colors.WHITE
    },
    textInputStyle: {
        marginLeft: 10,
    },
    iconContainer: {
        paddingTop: 8
    },
    gapView: {
        height: 40,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 40
    },
    registerButton: {
        backgroundColor: colors.SKY,
        width: 180,
        height: 50,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 15,
    },
    buttonTitle: {
        fontSize: 16
    },
    pickerStyle: {
        color: 'white',
        width: 200,
        fontSize: 15,
        height: 40,
        marginLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.WHITE,
    },
    inputTextStyle: {
        color: colors.WHITE,
        fontSize: 13,
        marginLeft: 0,
        height: 32,
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 20
    },
    form: {
        flex: 1,
    },
    logo: {
        width: '100%',
        justifyContent: "flex-start",
        marginTop: 10,
        alignItems: 'center',
    },
    scrollViewStyle: {
        height: height
    },
    textInputContainerStyle: {
        flexDirection: 'row',
        alignItems: "center",
        marginLeft: 20,
        marginRight: 20,
        padding: 15,
    },
    headerStyle: {
        fontSize: 18,
        color: colors.WHITE,
        textAlign: 'center',
        flexDirection: 'row',
        marginTop: 0
    },

    capturePhoto: {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: colors.WHITE,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15
    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 14,
        textAlign: 'center',
        paddingBottom: 15,

    },
    errorPhotoTitle: {
        color: colors.RED,
        fontSize: 13,
        textAlign: 'center',
        paddingBottom: 15,
    },
    photoResult: {
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15,
        width: '80%',
        height: height / 4
    },
    imagePosition: {
        position: 'relative'
    },
    photoClick: {
        paddingRight: 48,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1
    },
    imageStyle: {
        width: 30,
        height: height / 15
    },
    flexView1: {
        flex: 12
    },
    imageFixStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle2: {
        width: 150,
        height: height / 15
    },
    myView: {
        flex: 2,
        height: 50,
        width: 1,
        alignItems: 'center'
    },
    myView1: {
        height: height / 18,
        width: 1.5,
        backgroundColor: colors.GREY.btnSecondary,
        alignItems: 'center',
        marginTop: 10
    },
    myView2: {
        flex: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myView3: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textStyle: {
        color: colors.GREY.btnPrimary,
        fontFamily: 'Roboto-Bold',
        fontSize: 13
    }
}