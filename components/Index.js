import React, { useState, useTransition } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Modal, Portal, Button, TextInput, Text } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import BuddyList from './BuddyList';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import 'react-native-get-random-values';
import BuddyDetail from './BuddyDetail';
import { formatDate } from '../utils/commonFunctions';

const directoryPath = FileSystem.documentDirectory + 'bucketbuddydir';
const filePath = directoryPath + '/buddy_data.json';

const Index = () => {
    const [visible, setVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [birthday, setBirthday] = useState(new Date());
    const [birthdayPicked, setBirthdayPicked] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [buddyData, setBuddyData] = useState(new Map());

    const [selectedBuddy, setSelectedBuddy] = useState(null);
    const [userDetailVisible, setUserDetailVisible] = useState(false);

    const showModal = () => setVisible(true);

    const hideModal = () => {
        setUserName('');
        setBirthday(new Date());
        setVisible(false)
        setBirthdayPicked(false)
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || birthday;
        setShowDatePicker(false);
        setBirthday(currentDate);
        setBirthdayPicked(true)
    };

    const handleAddUser = async () => {
        if (userName == '') {
            hideModal();
            return;
        }
        const userId = uuidv4();
        const newUser = {
            id: userId,
            name: userName,
            birthday: birthday.toISOString().split('T')[0],
            lastContact: new Date().toISOString().split('T')[0],
            contactLimit: 10
        };
        data = buddyData;
        data.set(userId, newUser);
        setBuddyData(data);
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(Array.from(buddyData.entries())));
        hideModal();
    };

    const handleDeleteUser = async (userId) => {
        // Deleting the user from the map
        const newBuddyData = new Map(buddyData);
        newBuddyData.delete(userId);
        setBuddyData(newBuddyData);
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(newBuddyData));
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
                        .then(contents => {
                            if (contents === '{}') {
                                setBuddyData(new Map());
                            } else {
                                let data = new Map(JSON.parse(contents));
                                setBuddyData(data);
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
            <BuddyList buddyData={buddyData} onDeleteUser={handleDeleteUser} toggleUserDetail={toggleUserDetail} />
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add Buddy</Text>
                    <TextInput
                        label="Name"
                        value={userName}
                        onChangeText={setUserName}
                        style={styles.input}
                    />
                    <Button onPress={() => setShowDatePicker(true)} icon="cake-variant" labelStyle={{ color: '#a15586' }}>
                        {birthdayPicked ? formatDate(birthday) : 'Pick Birthday'}
                    </Button>
                    {showDatePicker && (
                        <DateTimePicker
                            value={birthday}
                            mode="date"
                            onChange={onDateChange}
                        />
                    )}
                    <View style={styles.buttonContainer}>
                        <Button mode="outlined" onPress={hideModal} style={styles.button} labelStyle={{ color: 'gray' }}>
                            Close
                        </Button>
                        <Button mode="contained" onPress={handleAddUser} style={styles.addButton}>
                            Add
                        </Button>
                    </View>
                </Modal>
                <BuddyDetail
                    visible={userDetailVisible}
                    onClose={() => setUserDetailVisible(false)}
                    buddy={selectedBuddy}
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