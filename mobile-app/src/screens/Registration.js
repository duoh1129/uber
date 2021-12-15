import React, { useState, useRef, useEffect, useContext } from 'react';
import { Registration } from '../components';
import { StyleSheet, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { language } from 'config';
import { FirebaseContext } from 'common/src';

export default function RegistrationPage(props) {
  const { api } = useContext(FirebaseContext);
  const {
    addProfile, 
    validateReferer 
  } = api;
  const pageActive = useRef(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const auth = useSelector(state => state.auth);
  const reqData = props.navigation.getParam("requireData");
  const cars = useSelector(state => state.cartypes.cars);
  const [carTypes, setCarTypes] = useState(null);

  useEffect(() => {
    if (auth.info && auth.info.profile) {
      setLoading(false);
      pageActive.current = false;
      props.navigation.navigate('AuthLoading');
    }
  }, [auth.info, auth.info.profile]);

  useEffect(() => {
    if (auth.error && auth.error.msg && pageActive.current) {
      pageActive.current = false;
      setLoading(false);
      Alert.alert(language.alert, auth.error.msg);
    }
  }, [auth.error, auth.error.msg]);

  useEffect(() => {
    if (auth.refererInfo) {
      let regData = auth.refererInfo.regData;
      regData.refererInfo = {
        amount: auth.refererInfo.amount,
        refererUid: auth.refererInfo.refererUid,
        walletBalance: auth.refererInfo.walletBalance
      };
      uploadProfile(regData);
    }
  }, [auth.refererInfo]);

  useEffect(() => {
    if (cars) {
      let arr = [];
      for (let i = 0; i < cars.length; i++) {
        arr.push({ label: cars[i].name, value: cars[i].name });
      }
      setCarTypes(arr);
    }
  }, [cars]);

  const uploadProfile = (regData) => {
    if(regData.usertype == 'driver'){
        dispatch(addProfile(regData));
    }else{
      dispatch(addProfile(regData));
    }
  };

  const clickRegister = async (regData) => {
    pageActive.current = true;
    setLoading(true);
    if (regData.refererId && regData.refererId.length > 0) {
      dispatch(validateReferer(regData));
    } else {
      uploadProfile(regData)
    }
  }

  return (
    <View style={styles.containerView}>
      {carTypes?
      <Registration
        reqData={reqData ? reqData : {}}
        cars={carTypes}
        onPressRegister={(regData) => clickRegister(regData)}
        onPress={() => { clickRegister() }}
        onPressBack={() => { props.navigation.goBack() }}
        loading={loading}>
      </Registration>
      :null}
    </View>
  );

}
const styles = StyleSheet.create({
  containerView: { flex: 1 },
  textContainer: { textAlign: "center" },
});
