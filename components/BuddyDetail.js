import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Modal, Text } from 'react-native-paper';
import { formatDate, daysSince } from '../utils/commonFunctions';
import ContactFrequencyPicker from './ContactFrequencyPicker';

const BuddyDetail = ({ visible, onClose, buddy, onUpdateContactLimit }) => {
    const [contactLimit, setContactLimit] = useState(7);

    // Keep the editable value in sync with whichever buddy is being shown.
    useEffect(() => {
        if (buddy) {
            setContactLimit(buddy.contactLimit);
        }
    }, [buddy]);

    if (!buddy) {
        return null;
    }

    const handleLimitChange = (value) => {
        setContactLimit(value);
        onUpdateContactLimit(buddy.id, value);
    };

    const isBirthday = () => {
        const today = new Date();
        // birthday is stored as YYYY-MM-DD; compare month/day directly to avoid
        // any timezone shifting from Date parsing.
        const [, month, day] = buddy.birthday.split('-').map(Number);
        return today.getMonth() + 1 === month && today.getDate() === day;
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            onDismiss={onClose}>
            <View style={styles.modalView}>
                <View style={styles.titleStyle}>
                    {isBirthday() && (
                        <Avatar.Icon size={24} icon="cake-variant" style={{ marginLeft: 8 }} />
                    )}
                    <Text style={styles.modalTitle}>{buddy.name}</Text>
                </View>

                <Text style={styles.contentTitle}>Birthday</Text>
                <Text>{formatDate(buddy.birthday)}</Text>
                <Text style={styles.contentTitle}>Last Contact</Text>
                <View style={styles.daysSinceContainer}>
                    <Text style={styles.daysSinceText}>{daysSince(buddy.lastContact)} days ago</Text>
                </View>
                <Text style={styles.contentTitle}>Check-in Frequency</Text>
                <ContactFrequencyPicker
                    value={contactLimit}
                    onChange={handleLimitChange}
                    labelPrefix="Check in every"
                />

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}>
                    <Text style={styles.textStyle}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
    },
    titleStyle: {
        alignItems: 'center'
    },
    contentTitle: {
        color: '#e67aa7',
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 10
    },
    closeButton: {
        backgroundColor: '#a15586',
        borderRadius: 20,
        padding: 10,
        marginTop: 15,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 25,
        color: 'black'
    },
    daysSinceContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 5,
    },
    daysSinceText: {
        color: 'white',
        fontWeight: 'bold',
        margin: 2,
        marginHorizontal: 20
    },
});

export default BuddyDetail;
