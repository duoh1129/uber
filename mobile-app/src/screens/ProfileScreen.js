import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
    Switch,
    Platform
} from 'react-native';
import { Icon, Header } from 'react-native-elements';
import ActionSheet from 'react-native-actionsheet';
import { colors } from '../common/theme';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { language } from 'config';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { FirebaseContext } from 'common/src';

const LOCATION_TASK_NAME = 'background-location-task';

export default function ProfileScreen(props) {
    const { api } = useContext(FirebaseContext);
    const {
        updateProfileImage,
        signOut,
        deleteUser,
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const [profileData, setProfileData] = useState(null);
    const [loader, setLoader] = useState(false);

    const actionSheet = useRef(null);

    useEffect(() => {
        if (auth.info && auth.info.profile) {
            setProfileData(auth.info.profile);
        }
    }, [auth.info]);


    const StartBackgroundLocation = async () => {
        try {
            const { status } = await Location.requestPermissionsAsync();
            if (status === 'granted') {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.High
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    const StopBackgroundLocation = async () => {
        TaskManager.getRegisteredTasksAsync().then((res)=>{
            if(res.length>0){
                for(let i=0;i<res.length;i++){
                    if(res[i].taskName == LOCATION_TASK_NAME){
                        Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                        break;
                    }
                }
            }
        });
    }

    const onChangeFunction = () => {
        let res = !profileData.driverActiveStatus;
        res ? StartBackgroundLocation() : StopBackgroundLocation();
        dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
    }

    showActionSheet = () => {
        actionSheet.current.show();
    }

    uploadImage = () => {
        return (
            <View>
                <ActionSheet
                    ref={actionSheet}
                    title={language.photo_upload_action_sheet_title}
                    options={[language.camera, language.galery, language.cancel]}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={1}
                    useNativeDriver={false}
                    onPress={(index) => {
                        if (index == 0) {
                            _pickImage(ImagePicker.launchCameraAsync);
                        } else if (index == 1) {
                            _pickImage(ImagePicker.launchImageLibraryAsync);
                        }
                    }}
                />
            </View>
        )
    }

    _pickImage = async (res) => {
        var pickFrom = res;
        const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (status == 'granted') {
            setLoader(true);
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3],
                base64: true
            });
            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                setProfileData({
                    ...profileData,
                    profile_image: result.uri
                })
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(language.alert, language.image_upload_error);
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', Platform.OS == 'ios' ? data : result.uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    dispatch(updateProfileImage(auth.info, blob));
                }
                setLoader(false);
            }
            else {
                setLoader(false);
            }
        }
    };


    editProfile = () => {
        props.navigation.push('editUser');
    }

    //sign out and clear all async storage
    logOff = async () => {
        props.navigation.navigate('Intro');
        dispatch(signOut());
    }

    //Delete current user
    deleteAccount = () => {
        Alert.alert(
            language.delete_account_modal_title,
            language.delete_account_modal_subtitle,
            [
                {
                    text: language.cancel,
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: language.yes, onPress: () => {
                        props.navigation.navigate('Intro');
                        dispatch(deleteUser(auth.info.uid));
                    }
                },
            ],
            { cancelable: false },
        );
    }

    goWallet = () => {
        props.navigation.navigate('wallet');
    }

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{language.profile_page_title}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollStyle}>
                {
                    uploadImage()
                }
                {profileData && profileData.usertype == 'driver' ?
                    <View style={styles.scrollViewStyle1} >
                        <Text style={styles.profStyle}>{language.active_status}</Text>
                        <Switch
                            style={styles.switchAlignStyle}
                            value={profileData ? profileData.driverActiveStatus : false}
                            onValueChange={onChangeFunction}
                        />
                    </View>
                    : null}
                <View style={styles.scrollViewStyle} >
                    <Text style={styles.profStyle}>{language.profile_page_subtitle}</Text>
                    <Icon
                        name='page-edit'
                        type='foundation'
                        color={colors.GREY.btnPrimary}
                        containerStyle={{ right: 20 }}
                        onPress={editProfile}
                    />
                </View>

                <View style={styles.viewStyle}>
                    <View style={styles.imageParentView}>
                        <View style={styles.imageViewStyle} >
                            {
                                loader ?
                                    <View style={[styles.loadingcontainer, styles.horizontal]}>
                                        <ActivityIndicator size="large" color="#0000ff" />
                                    </View>
                                    : <TouchableOpacity onPress={showActionSheet}>
                                        <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} style={{ borderRadius: 130 / 2, width: 130, height: 130 }} />
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>
                    <Text style={styles.textPropStyle} >{profileData && profileData.firstName.toUpperCase() + " " + profileData.lastName.toUpperCase()}</Text>
                </View>

                <View style={styles.newViewStyle}>
                    <View style={styles.myViewStyle}>
                        <View style={styles.iconViewStyle}>
                            <Icon
                                name='envelope-letter'
                                type='simple-line-icon'
                                color={colors.GREY.btnPrimary}
                                size={30}
                            />
                            <Text style={styles.emailStyle}>{language.email_placeholder}</Text>
                        </View>
                        <View style={styles.flexView1}>
                            <Text style={styles.emailAdressStyle}>{profileData ? profileData.email : ''}</Text>
                        </View>
                    </View>
                    <View style={styles.myViewStyle}>
                        <View style={styles.iconViewStyle}>
                            <Icon
                                name='phone-call'
                                type='feather'
                                color={colors.GREY.btnPrimary}
                            />
                            <Text style={styles.text1}>{language.mobile_no_placeholder}</Text>
                        </View>
                        <View style={styles.flexView2}>
                            <Text style={styles.text2}>{profileData ? profileData.mobile : ''}</Text>
                        </View>
                    </View>
                    {profileData && profileData.referralId ?
                        <View style={styles.myViewStyle}>
                            <View style={styles.iconViewStyle}>
                                <Icon
                                    name='award'
                                    type='feather'
                                    color={colors.GREY.btnPrimary}
                                />
                                <Text style={styles.emailStyle}>{language.referral_id}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.text2}>{profileData.referralId}</Text>
                            </View>
                        </View>
                        : null}
                    <View style={styles.myViewStyle}>
                        <View style={styles.iconViewStyle}>
                            <Icon
                                name='user'
                                type='simple-line-icon'
                                color={colors.GREY.btnPrimary}
                            />
                            <Text style={styles.emailStyle}>{language.usertype}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.text2}>{profileData ? profileData.usertype : ''}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.flexView3}>

                    <TouchableOpacity style={styles.textIconStyle2} onPress={deleteAccount}>
                        <Text style={styles.emailStyle}>{language.delete_account_lebel}</Text>
                        <Icon
                            name='ios-arrow-forward'
                            type='ionicon'
                            color={colors.GREY.iconPrimary}
                            size={35}
                            containerStyle={{ right: 20 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={logOff} style={styles.textIconStyle2}>
                        <Text style={styles.emailStyle}>{language.logout}</Text>
                        <Icon
                            name='ios-arrow-forward'
                            type='ionicon'
                            color={colors.GREY.iconPrimary}
                            size={35}
                            containerStyle={{ right: 20 }}
                        />
                    </TouchableOpacity>
                </View>

            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.GREY.default,
        borderBottomWidth: 0
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    logo: {
        flex: 1,
        position: 'absolute',
        top: 110,
        width: '100%',
        justifyContent: "flex-end",
        alignItems: 'center'
    },
    footer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        height: 150,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    scrollStyle: {
        flex: 1,
        height: height,
        backgroundColor: colors.WHITE
    },
    scrollViewStyle1: {
        width: width,
        height: 50,
        marginTop: 20,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scrollViewStyle: {
        width: width,
        height: 50,
        marginTop: 30,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 18,
        left: 20,
        fontWeight: 'bold',
        color: colors.GREY.btnPrimary,
        fontFamily: 'Roboto-Bold'
    },
    bonusAmount: {
        right: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    viewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 13
    },
    imageParentView: {
        borderRadius: 150 / 2,
        width: 150,
        height: 150,
        backgroundColor: colors.GREY.secondary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageViewStyle: {
        borderRadius: 140 / 2,
        width: 140,
        height: 140,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textPropStyle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: colors.GREY.iconSecondary,
        fontFamily: 'Roboto-Bold',
        top: 8,
        textTransform: 'uppercase'
    },
    newViewStyle: {
        flex: 1,
        height: 300,
        marginTop: 40
    },
    myViewStyle: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.GREY.btnSecondary,
        borderBottomWidth: 1
    },
    iconViewStyle: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    emailStyle: {
        fontSize: 17,
        left: 10,
        color: colors.GREY.btnPrimary,
        fontFamily: 'Roboto-Bold'
    },
    emailAdressStyle: {
        fontSize: 15,
        color: colors.GREY.secondary,
        fontFamily: 'Roboto-Regular'
    },
    mainIconView: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.GREY.iconSecondary,
        borderBottomWidth: 1
    },
    text1: {
        fontSize: 17,
        left: 10,
        color: colors.GREY.btnPrimary,
        fontFamily: 'Roboto-Bold'
    },
    text2: {
        fontSize: 15,
        left: 10,
        color: colors.GREY.secondary,
        fontFamily: 'Roboto-Regular'
    },
    textIconStyle: {
        width: width,
        height: 50,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textIconStyle2: {
        width: width,
        height: 50,
        marginTop: 10,
        backgroundColor: colors.GREY.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    flexView1: {
        flex: 1
    },
    flexView2: {
        flex: 1
    },
    flexView3: {
        marginTop: 54
    },
    loadingcontainer: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    }
});