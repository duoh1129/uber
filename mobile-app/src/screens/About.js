import React from 'react';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableWithoutFeedback,
    Dimensions,
    Image
} from 'react-native';
var { width } = Dimensions.get('window');
import { useSelector } from "react-redux";

import { language } from 'config';

export default function AboutPage(props) {

    const data = useSelector(state => state.aboutusdata.info);

    return (

        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{language.about_us_menu}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <View>
                {!!data ?
                    <ScrollView styles={{ marginTop: 10 }}>
                        <Text style={styles.aboutTitleStyle}>{data.heading ? data.heading : null}</Text>
                        <View style={styles.aboutcontentmainStyle}>
                            <Image
                                style={{ width: '100%', height: 150 }}
                                source={require('../../assets/images/about_us.png')}
                            />

                            <Text style={styles.aboutcontentStyle}>

                                {data.contents ? data.contents : null}
                            </Text>
                            <Text style={styles.aboutTitleStyle}>{language.contact_details}</Text>
                            <View style={styles.contact}>
                                <View style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={styles.contacttype1}>{language.email_placeholder} :</Text>
                                    <Text style={styles.contacttype1}> {data.email ? data.email : null}</Text>
                                </View>
                                <View style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={styles.contacttype2}>{language.phone} :</Text>
                                    <Text style={styles.contacttype1}> {data.phone ? data.phone : null}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    : null}
            </View>
        </View>

    );


}
const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight,
    },
    headerStyle: {
        backgroundColor: colors.GREY.default,
        borderBottomWidth: 0
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    aboutTitleStyle: {
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        fontSize: 20,
        marginLeft: 8,
        marginTop: 8
    },
    aboutcontentmainStyle: {
        marginTop: 12,
        marginBottom: 60
    },
    aboutcontentStyle: {
        color: colors.GREY.secondary,
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        textAlign: "justify",
        alignSelf: 'center',
        width: width - 20,
        letterSpacing: 1,
        marginTop: 6,
    },
    contact: {
        marginTop: 6,
        marginLeft: 8,
        //flexDirection:'row',
        width: "100%",
        marginBottom: 30
    },
    contacttype1: {
        textAlign: 'left',
        color: colors.GREY.secondary,
        fontFamily: 'Roboto-Bold',
        fontSize: 15,
    },
    contacttype2: {
        textAlign: 'left',
        marginTop: 4,
        color: colors.GREY.secondary,
        fontFamily: 'Roboto-Bold',
        fontSize: 15,
    }
})