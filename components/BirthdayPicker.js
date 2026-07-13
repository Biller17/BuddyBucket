import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip } from 'react-native-paper';

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Days in a month. Uses a leap year (2000) so February allows the 29th.
const daysInMonth = (month) => new Date(2000, month + 1, 0).getDate();

// Month + day birthday picker (no year). `month` is 0-based, `day` is 1-based.
const BirthdayPicker = ({ month, day, onChange }) => {
    const days = Array.from({ length: daysInMonth(month) }, (_, i) => i + 1);

    // When the month changes, keep the day valid (e.g. Jan 31 -> Feb 29).
    const handleMonth = (m) => onChange(m, Math.min(day, daysInMonth(m)));

    return (
        <View>
            <Text style={styles.label}>Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {MONTH_ABBR.map((name, i) => {
                    const selected = month === i;
                    return (
                        <Chip
                            key={name}
                            compact
                            showSelectedCheck={false}
                            style={[styles.chip, selected && styles.chipSelected]}
                            textStyle={selected ? styles.chipTextSelected : styles.chipText}
                            onPress={() => handleMonth(i)}>
                            {name}
                        </Chip>
                    );
                })}
            </ScrollView>
            <Text style={styles.label}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {days.map((d) => {
                    const selected = day === d;
                    return (
                        <Chip
                            key={d}
                            compact
                            showSelectedCheck={false}
                            style={[styles.chip, selected && styles.chipSelected]}
                            textStyle={selected ? styles.chipTextSelected : styles.chipText}
                            onPress={() => onChange(month, d)}>
                            {String(d)}
                        </Chip>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#a15586',
    },
    row: {
        paddingVertical: 6,
    },
    chip: {
        marginHorizontal: 3,
        backgroundColor: 'rgba(230, 122, 167, 0.15)',
    },
    chipSelected: {
        backgroundColor: '#e67aa7',
    },
    chipText: {
        color: '#a15586',
    },
    chipTextSelected: {
        color: 'white',
    },
});

export default BirthdayPicker;
