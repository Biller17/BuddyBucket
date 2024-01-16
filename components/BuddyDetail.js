import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Modal, Text } from 'react-native-paper';

const BuddyDetail = ({ visible, onClose, buddy }) => {
    if (!buddy) {
        return null;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const isBirthday = () => {
        const today = new Date();
        const birthday = new Date(buddy.birthday);
        return today.getDate() === birthday.getDate() &&
            today.getMonth() === birthday.getMonth();
    };


    const daysSince = (date) => {
        console.log(date);
        const today = new Date();
        const lastContactDate = new Date(date);
        const difference = today - lastContactDate;
        return Math.floor(difference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
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
                <Text style={styles.contentTitle}>Contact Limit</Text>
                <Text>{buddy.contactLimit} days</Text>

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
