import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { formatDate } from '../utils/commonFunctions';

let today = new Date();

const Buddy = ({ friend, daysSinceLastContact, onCheckIn, onSnooze }) => {
    const isOverdue = daysSinceLastContact > friend.contactLimit;
    const isSnoozed = friend.snoozedUntil != null && new Date(friend.snoozedUntil) > new Date();

    return (
        <Card style={styles.buddyStyle}>
            <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text variant="titleLarge">{friend.name}</Text>
                    {formatDate(today) === formatDate(friend.birthday) && (
                        <Avatar.Icon size={24} icon="cake-variant" style={{ marginLeft: 8 }} />
                    )}
                </View>
            </Card.Content>
            <Card.Actions>
                {isOverdue && !isSnoozed && (
                    <Button buttonColor="#a15586" icon="sleep" labelStyle={{ color: 'white' }} onPress={() => onSnooze(friend.id)}>Snooze</Button>
                )}
                <Button buttonColor="#e67aa7" icon="check-circle-outline" labelStyle={{ color: 'white' }} onPress={() => onCheckIn(friend.id)}>Check-In</Button>
            </Card.Actions>
            <View style={styles.daysSinceContainer}>
                <Text style={styles.daysSinceText}>{daysSinceLastContact} days</Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    buddyStyle: {
        flex: 1,
        backgroundColor: '#d9d3e0'
    },
    cardContainer: {
        position: 'relative',
    },
    daysSinceContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 5,
    },
    daysSinceText: {
        color: 'white',
        fontWeight: 'bold',
        margin: 2
    },
});

export default Buddy;
