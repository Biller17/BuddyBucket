import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

let today = new Date();

const formatDate = (date) => {
    let d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [month, day].join('-');
}

const Buddy = ({ friend, daysSinceLastContact }) => {
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
                {daysSinceLastContact > friend.contactLimit &&
                    (<Button buttonColor="#a15586" icon="sleep" labelStyle={{ color: 'white' }}>Snooze</Button>)}
                <Button buttonColor="#e67aa7" icon="check-circle-outline" labelStyle={{ color: 'white' }}>Check-In</Button>
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
