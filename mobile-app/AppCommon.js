import { useContext, useEffect } from 'react';
import { store, FirebaseContext } from 'common/src';
import { useSelector,useDispatch } from 'react-redux';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations }, error }) => {
  if (error) {
    console.log("Task Error");
    return;
  }
  if (locations.length > 0) {
    let location = locations[locations.length - 1];
    try {
      if (store.getState().auth.info && store.getState().auth.info.uid) {
        store.dispatch({
          type: 'UPDATE_GPS_LOCATION',
          payload: {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

export default function AppCommon({children}) {
  const { api } = useContext(FirebaseContext);
  const {
    fetchUser,
    fetchSettings,
    fetchCarTypes,
    saveUserLocation,
    GetDistance,
    saveTracking,
    updateBooking
  } = api;
  const dispatch = useDispatch();

  const gps = useSelector(state => state.gpsdata);
  const activeBooking = useSelector(state => state.bookinglistdata.tracked);
  const lastLocation = useSelector(state => state.locationdata.coords);
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (gps.location) {
      if(auth.info.uid){
        saveUserLocation(auth.info.uid,{
          lat: gps.location.lat,
          lng: gps.location.lng
        });
      }
      if(activeBooking){
        if(lastLocation && (activeBooking.status == 'ACCEPTED' || activeBooking.status == 'STARTED')){
          let diff = GetDistance(lastLocation.lat,lastLocation.lng,gps.location.lat,gps.location.lng);
          if(diff> 0.010){
            saveTracking(activeBooking.id,{
              at: new Date().getTime(),
              status: activeBooking.status,
              lat: gps.location.lat,
              lng: gps.location.lng
            });              
          }
        }
        if(activeBooking.status == 'ACCEPTED'){
          let diff = GetDistance(activeBooking.pickup.lat,activeBooking.pickup.lng,gps.location.lat,gps.location.lng);
          if(diff<0.05){
            let bookingData = activeBooking;
            bookingData.status = 'ARRIVED';
            store.dispatch(updateBooking(bookingData));
            saveTracking(activeBooking.id,{
              at: new Date().getTime(),
              status: 'ARRIVED',
              lat: gps.location.lat,
              lng: gps.location.lng
            });
          }
        }
      }
    }
  }, [gps.location]);

  useEffect(() => {
    if (auth.info 
        && auth.info.profile 
        && auth.info.profile.usertype == 'driver'
        && auth.info.profile.driverActiveStatus
        && auth.info.profile.approved
    ) {
      StartBackgroundLocation()
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
      Alert.alert(language.alert, language.location_permission_error)
    }
  }

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchSettings());
    dispatch(fetchCarTypes());
  }, []);

  return children;
}