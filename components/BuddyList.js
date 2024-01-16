import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, TouchableWithoutFeedback } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Buddy from './Buddy';
import { Icon } from 'react-native-paper';
import { daysSince } from '../utils/commonFunctions';

const BuddyList = ({ buddyData, onDeleteUser, toggleUserDetail }) => {

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => onDeleteUser(data.item.id)}>
                <Icon source="trash-can-outline" color="white" size={25} />
            </TouchableOpacity>
        </View>
    );
    if (buddyData.size == 0) {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 100 }}>
                <Text>Go make some buddies!</Text>
            </View>
        )
    } else {
        const buddyArray = Array.from(buddyData.values());
        const sortedBuddyData = buddyArray.sort((a, b) => daysSince(a.lastContact) - daysSince(b.lastContact)).reverse();
        return (
            <SwipeListView
                data={sortedBuddyData}
                renderItem={(data, rowMap) => (
                    <View style={styles.buddyContainer}>
                        <TouchableOpacity
                            onPress={() => toggleUserDetail(data.item)}
                            activeOpacity={0.7}>
                            <Buddy
                                friend={data.item}
                                daysSinceLastContact={daysSince(data.item.lastContact)}
                                toggleUserDetail={toggleUserDetail}
                            />
                        </TouchableOpacity>
                    </View>

                )}
                renderHiddenItem={renderHiddenItem}
                leftOpenValue={75}
                rightOpenValue={-75}
                disableRightSwipe
                keyExtractor={item => item.id}
            />
            // <ScrollView>
            //     {sortedBuddyData.map((friend, index) => (
            //         <Buddy
            //             key={index}
            //             friend={friend}
            //             daysSinceLastContact={daysSince(friend.lastContact)}
            //         />
            //     ))}
            // </ScrollView>
            // <FlatList
            //     data={sortedBuddyData}
            //     renderItem={({ item }) => (
            //         <Buddy
            //             friend={item}
            //             daysSinceLastContact={daysSince(item.lastContact)}
            //         />
            //     )}
            //     keyExtractor={(item, index) => index.toString()}
            //     numColumns={2} // Display two items per row
            // />
        )
    }
}

const styles = StyleSheet.create({
    buddyContainer: {
        backgroundColor: 'black',
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 15
    },
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 70,
    },
    backRightBtnRight: {
        backgroundColor: '#b53e3e',
        right: 0,
        margin: 10,
        borderRadius: 15
    },
    backTextWhite: {
        color: '#FFF',
    }
});

export default BuddyList;