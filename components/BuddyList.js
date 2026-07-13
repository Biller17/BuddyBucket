import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, PanResponder } from 'react-native';
import Buddy from './Buddy';
import { Icon } from 'react-native-paper';
import { daysSince } from '../utils/commonFunctions';

// How far a row opens to reveal the delete button, and how far you must drag
// before it snaps open on release.
const OPEN_OFFSET = -75;
const SWIPE_THRESHOLD = -40;

// A single swipe-to-delete row built on React Native's core Animated +
// PanResponder (no native gesture/animation libraries), so it can't hit the
// worklet/JSI initialization issues that reanimated does on this device.
const SwipeableRow = ({ item, onDelete, onPress, onCheckIn, onSnooze }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const isOpen = useRef(false);

    const snap = (toOpen) => {
        isOpen.current = toOpen;
        Animated.spring(translateX, {
            toValue: toOpen ? OPEN_OFFSET : 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    };

    const panResponder = useRef(
        PanResponder.create({
            // Only take over the gesture on a decisively horizontal drag, so
            // vertical list scrolling is never intercepted.
            onMoveShouldSetPanResponder: (_, g) =>
                Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
            // Once we own the swipe, keep it for the whole gesture so the
            // FlatList can't steal it and strand the card mid-slide.
            onPanResponderTerminationRequest: () => false,
            onPanResponderMove: (_, g) => {
                const base = isOpen.current ? OPEN_OFFSET : 0;
                let next = base + g.dx;
                if (next > 0) next = 0;
                if (next < OPEN_OFFSET) next = OPEN_OFFSET;
                translateX.setValue(next);
            },
            onPanResponderRelease: (_, g) => {
                const base = isOpen.current ? OPEN_OFFSET : 0;
                snap(base + g.dx < SWIPE_THRESHOLD);
            },
            // If the gesture is interrupted, settle to a clean open/closed
            // position instead of freezing halfway.
            onPanResponderTerminate: () => snap(isOpen.current),
        })
    ).current;

    return (
        <View style={styles.rowWrapper}>
            <View style={styles.deleteBehind}>
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Icon source="trash-can-outline" color="white" size={25} />
                </TouchableOpacity>
            </View>
            <Animated.View
                style={{ transform: [{ translateX }] }}
                {...panResponder.panHandlers}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => (isOpen.current ? snap(false) : onPress())}>
                    <View style={styles.buddyContainer}>
                        <Buddy
                            friend={item}
                            daysSinceLastContact={daysSince(item.lastContact)}
                            toggleUserDetail={onPress}
                            onCheckIn={onCheckIn}
                            onSnooze={onSnooze}
                        />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const BuddyList = ({ buddyData, onDeleteUser, toggleUserDetail, onCheckIn, onSnooze }) => {
    if (buddyData.size === 0) {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 100 }}>
                <Text>Go make some buddies!</Text>
            </View>
        );
    }

    const buddyArray = Array.from(buddyData.values());
    const sortedBuddyData = buddyArray
        .sort((a, b) => daysSince(a.lastContact) - daysSince(b.lastContact))
        .reverse();

    return (
        <FlatList
            data={sortedBuddyData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <SwipeableRow
                    item={item}
                    onDelete={() => onDeleteUser(item.id)}
                    onPress={() => toggleUserDetail(item)}
                    onCheckIn={onCheckIn}
                    onSnooze={onSnooze}
                />
            )}
        />
    );
};

const styles = StyleSheet.create({
    rowWrapper: {
        position: 'relative',
    },
    deleteBehind: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    deleteButton: {
        backgroundColor: '#b53e3e',
        width: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginVertical: 10,
        marginRight: 10,
    },
    buddyContainer: {
        backgroundColor: 'black',
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 15,
    },
});

export default BuddyList;
