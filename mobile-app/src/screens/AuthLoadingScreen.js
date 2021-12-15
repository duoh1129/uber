import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Text,
  Platform,
  Alert
} from 'react-native';
import GetPushToken from '../components/GetPushToken';
import { language } from 'config';
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from 'common/src';

export default function AuthLoadingScreen(props) {
  const { api } = useContext(FirebaseContext);
  const {
    fetchAboutUs,
    fetchBookings,
    fetchCancelReasonsApp,
    updatePushToken,
    signOut,
    fetchPaymentMethods,
    fetchDrivers,
    fetchTasks,
    fetchPromos,
    clearLoginError
  } = api;

  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.info) {
      if (auth.info.profile) {
        let role = auth.info.profile.usertype;
        if (auth.info.profile.approved) {
          if (role === 'rider') {
            saveToken();
            dispatch(fetchDrivers());
            dispatch(fetchBookings(auth.info.uid, role));
            dispatch(fetchCancelReasonsApp());
            dispatch(fetchAboutUs());
            dispatch(fetchPaymentMethods());
            dispatch(fetchPromos());
            props.navigation.navigate('Map');
          } else if (role === 'driver') {
            saveToken();
            dispatch(fetchBookings(auth.info.uid, role));
            dispatch(fetchPaymentMethods());
            dispatch(fetchTasks());
            dispatch(fetchAboutUs());
            props.navigation.navigate('DriverRoot');
          } else if (role === 'admin') {
            dispatch(fetchAboutUs());
            props.navigation.navigate('AdminRoot');
          }
          else {
            Alert.alert(language.alert, language.not_valid_user_type);
            dispatch(signOut());
            props.navigation.navigate('Intro');
          }
        }
        else {
          Alert.alert(language.alert, language.require_approval);
          dispatch(signOut());
          props.navigation.navigate('Intro');
        }
      } else {
        var data = {};
        data.profile = {
          email: auth.info.email ? auth.info.email : '',
          mobile: auth.info.phoneNumber ? auth.info.phoneNumber.replace('"', '') : '',
        };
        props.navigation.navigate("Reg", { requireData: data });
      }
    } 
  }, [auth.info, auth.loading]);

  useEffect(() => {
    if (auth.error && auth.error.msg) {
      dispatch(clearLoginError());
      props.navigation.navigate('Intro');
    }
  }, [auth.error,auth.error.msg]);

  const saveToken = async () => {
    let token = await GetPushToken();
    dispatch(
      updatePushToken(
        auth.info,
        token,
        Platform.OS == 'ios' ? 'IOS' : 'ANDROID'
      )
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/intro.jpg')}
        resizeMode="stretch"
        style={styles.imagebg}
      >
        <ActivityIndicator />
        <Text style={{ paddingBottom: 100 }}>{language.fetching_data}</Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  imagebg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: "flex-end",
    alignItems: 'center'
  }
});