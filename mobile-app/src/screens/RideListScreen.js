import React, { useEffect,useContext,useState } from 'react';
import { RideList } from '../components';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback
} from 'react-native';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';
import { language } from 'config';
import { useSelector,useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';

export default function RideListPage(props) {
    const { api } = useContext(FirebaseContext);
    const {
      fetchBookings,
    } = api;
    const auth = useSelector(state => state.auth);
    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const [bookingData,setBookingData] = useState([]);
    const refresh = props.navigation.getParam('refresh');
    const dispatch = useDispatch();

    useEffect(()=>{
        if(bookings){
            setBookingData(bookings.reverse());
        }else{
            setBookingData([]);
        }
    },[bookings]);

    goDetails = (item, index) => {
        if (item && item.trip_cost > 0) {
            item.roundoffCost = Math.round(item.trip_cost).toFixed(2);
            item.roundoff = (Math.round(item.roundoffCost) - item.trip_cost).toFixed(2);
            props.navigation.push('RideDetails', { data: item });
        } else {
            item.roundoffCost = Math.round(item.estimate).toFixed(2);
            item.roundoff = (Math.round(item.roundoffCost) - item.estimate).toFixed(2);
            props.navigation.push('RideDetails', { data: item });
        }
    }

    useEffect(()=>{
        if(refresh){
            dispatch(fetchBookings(auth.info.uid, auth.info.profile.usertype));
        }
    },[refresh,auth.info]);

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{language.ride_list_title}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <RideList onPressButton={(item, index) => { goDetails(item, index) }} data={bookingData}></RideList>
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
    containerView: { flex: 1 },
    textContainer: { textAlign: "center" },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE
    }
});
