import React, { useState, useTransition } from 'react';
import { View, StyleSheet, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Appbar, Modal, Portal, Button, TextInput, Text } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import BuddyList from './BuddyList';
import * as FileSystem from 'expo-file-system/legacy';
import BuddyDetail from './BuddyDetail';
import ContactFrequencyPicker, { DEFAULT_CONTACT_LIMIT } from './ContactFrequencyPicker';
import BirthdayPicker, { MONTH_NAMES } from './BirthdayPicker';
import { requestNotificationPermissions, scheduleBuddyReminder, cancelBuddyReminder, syncAllReminders } from '../utils/notifications';

const directoryPath = FileSystem.documentDirectory + 'bucketbuddydir';
const filePath = directoryPath + '/buddy_data.json';

const Index = () => {
    const [visible, setVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [birthMonth, setBirthMonth] = useState(() => new Date().getMonth());
    const [birthDay, setBirthDay] = useState(() => new Date().getDate());
    const [birthdayPicked, setBirthdayPicked] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [contactLimit, setContactLimit] = useState(DEFAULT_CONTACT_LIMIT);
    const [buddyData, setBuddyData] = useState(new Map());

    const [selectedBuddy, setSelectedBuddy] = useState(null);
    const [userDetailVisible, setUserDetailVisible] = useState(false);

    const showModal = () => setVisible(true);

    const hideModal = () => {
        const now = new Date();
        setUserName('');
        setBirthMonth(now.getMonth());
        setBirthDay(now.getDate());
        setVisible(false)
        setBirthdayPicked(false)
        setShowDatePicker(false)
        setContactLimit(DEFAULT_CONTACT_LIMIT)
    };

    const onBirthdayChange = (month, day) => {
        setBirthMonth(month);
        setBirthDay(day);
        setBirthdayPicked(true);
    };

    const handleAddUser = async () => {
        Keyboard.dismiss();
        if (userName.trim() === '') {
            hideModal();
            return;
        }
        const userId = uuidv4();
        const newUser = {
            id: userId,
            name: userName.trim(),
            // Stored with a fixed placeholder year — only month/day matter.
            birthday: `2000-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
            lastContact: new Date().toISOString().split('T')[0],
            contactLimit: contactLimit
        };
        // Build a new Map so React sees a new reference and re-renders the list.
        const newBuddyData = new Map(buddyData);
        newBuddyData.set(userId, newUser);
        setBuddyData(newBuddyData);
        try {
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(Array.from(newBuddyData.entries())));
        } catch (error) {
            console.error('Failed to save buddy:', error);
        }
        scheduleBuddyReminder(newUser);
        hideModal();
    };

    const handleDeleteUser = async (userId) => {
        // Deleting the user from the map
        const newBuddyData = new Map(buddyData);
        newBuddyData.delete(userId);
        setBuddyData(newBuddyData);
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(Array.from(newBuddyData.entries())));
        cancelBuddyReminder(userId);
    };

    // Apply a partial update to one buddy and persist, keeping the Map
    // immutable so the list re-renders.
    const updateBuddy = async (userId, changes) => {
        const existing = buddyData.get(userId);
        if (!existing) return;
        const updated = { ...existing, ...changes };
        const newBuddyData = new Map(buddyData);
        newBuddyData.set(userId, updated);
        setBuddyData(newBuddyData);
        try {
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(Array.from(newBuddyData.entries())));
        } catch (error) {
            console.error('Failed to update buddy:', error);
        }
        // Re-schedule this buddy's reminder for its new due date.
        scheduleBuddyReminder(updated);
    };

    // Check-In: mark contact as of today (resets days-since) and clear any snooze.
    const handleCheckIn = (userId) => {
        updateBuddy(userId, {
            lastContact: new Date().toISOString().split('T')[0],
            snoozedUntil: null,
        });
    };

    // Snooze: quiet the overdue reminder for a few days without recording contact.
    const handleSnooze = (userId) => {
        const until = new Date();
        until.setDate(until.getDate() + 3);
        updateBuddy(userId, { snoozedUntil: until.toISOString().split('T')[0] });
    };

    const handleUpdateContactLimit = (userId, newLimit) => {
        updateBuddy(userId, { contactLimit: newLimit });
    };

    const toggleUserDetail = (buddy) => {
        setSelectedBuddy(buddy);
        setUserDetailVisible(true);
    }

    const deleteFile = async () => {
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(new Map()));
    }

    React.useEffect(() => {
        const loadOrCreate = async () => {
            try {
                const dirInfo = await FileSystem.getInfoAsync(directoryPath);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });
                }
                const fileInfo = await FileSystem.getInfoAsync(filePath);
                if (!fileInfo.exists) {
                    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(buddyData));
                } else {
                    FileSystem.readAsStringAsync(filePath)
                        .then(async contents => {
                            const data = contents === '{}' ? new Map() : new Map(JSON.parse(contents));
                            setBuddyData(data);
                            // Ask once for permission, then (re)build all reminders
                            // from the freshly loaded data.
                            const granted = await requestNotificationPermissions();
                            if (granted) {
                                syncAllReminders(data);
                            }
                        })
                        .catch(error => console.log('File reading error:', error));
                }
            } catch (error) {
                console.error('Error ensuring file exists:', error);
            }
        };
        loadOrCreate();
    }, []);

    return (
        <View>
            <Appbar.Header
                style={style}>
                <Appbar.Content
                    title={
                        <Text>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 25 }}>Buddy</Text>
                            <Text style={{ color: '#e67aa7', fontWeight: 'bold', fontSize: 25 }}> Bucket</Text>
                        </Text>
                    }
                />
                <Appbar.Action
                    icon="account-plus-outline"
                    onPress={showModal}
                />
            </Appbar.Header>
            <BuddyList buddyData={buddyData} onDeleteUser={handleDeleteUser} toggleUserDetail={toggleUserDetail} onCheckIn={handleCheckIn} onSnooze={handleSnooze} />
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View>
                            <Text style={styles.modalTitle}>Add Buddy</Text>
                            <TextInput
                                label="Name"
                                value={userName}
                                onChangeText={setUserName}
                                style={styles.input}
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                                blurOnSubmit
                            />
                            <Button onPress={() => { Keyboard.dismiss(); setShowDatePicker((s) => !s); }} icon="cake-variant" labelStyle={{ color: '#a15586' }}>
                                {birthdayPicked ? `${MONTH_NAMES[birthMonth]} ${birthDay}` : 'Pick Birthday'}
                            </Button>
                            {showDatePicker && (
                                <View>
                                    <BirthdayPicker
                                        month={birthMonth}
                                        day={birthDay}
                                        onChange={onBirthdayChange}
                                    />
                                    <Button onPress={() => setShowDatePicker(false)} labelStyle={{ color: '#a15586' }}>
                                        Done
                                    </Button>
                                </View>
                            )}
                            <ContactFrequencyPicker
                                value={contactLimit}
                                onChange={setContactLimit}
                                labelPrefix="I want to check on my buddy every"
                            />
                            <View style={styles.buttonContainer}>
                                <Button mode="outlined" onPress={hideModal} style={styles.button} labelStyle={{ color: 'gray' }}>
                                    Close
                                </Button>
                                <Button mode="contained" onPress={handleAddUser} style={styles.addButton}>
                                    Add
                                </Button>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <BuddyDetail
                    visible={userDetailVisible}
                    onClose={() => setUserDetailVisible(false)}
                    buddy={selectedBuddy}
                    onUpdateContactLimit={handleUpdateContactLimit}
                />
            </Portal>
        </View>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 15
    },
    input: {
        marginBottom: 10,
        backgroundColor: 'rgba(230, 122, 167, 0.2)'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly', // This will space out the buttons evenly
    },
    button: {
        marginTop: 10,
        marginHorizontal: 10,
        flex: 1,
    },
    addButton: {
        marginTop: 10,
        marginHorizontal: 10,
        flex: 1,
        backgroundColor: '#e67aa7'
    },
    buttonLabel: {
        color: 'white'
    },
    modalTitle: {
        fontSize: 24, // Adjust the font size as needed
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#e67aa7'
    }
});

const style = {
    backgroundColor: 'transparent',
    // "#e67aa7"
};

export default Index;