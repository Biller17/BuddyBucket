import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';

export const MIN_CONTACT_LIMIT = 1;
export const MAX_CONTACT_LIMIT = 365;
export const DEFAULT_CONTACT_LIMIT = 7;

const PRESETS = [
    { label: 'Daily', value: 1 },
    { label: 'Weekly', value: 7 },
    { label: 'Monthly', value: 30 },
];

const clamp = (n) => Math.min(MAX_CONTACT_LIMIT, Math.max(MIN_CONTACT_LIMIT, n));

// Reusable control for choosing a check-in interval (in days). Shows a live
// sentence, quick presets, and a -/+ stepper. Used in both the Add Buddy modal
// and the buddy detail popup.
const ContactFrequencyPicker = ({ value, onChange, labelPrefix = 'Check in every' }) => {
    return (
        <View>
            <Text style={styles.label}>
                {labelPrefix} {value} {value === 1 ? 'day' : 'days'}
            </Text>
            <View style={styles.presetRow}>
                {PRESETS.map((preset) => {
                    const selected = value === preset.value;
                    return (
                        <Chip
                            key={preset.value}
                            compact
                            showSelectedCheck={false}
                            style={[styles.chip, selected && styles.chipSelected]}
                            textStyle={selected ? styles.chipTextSelected : styles.chipText}
                            onPress={() => onChange(preset.value)}>
                            {preset.label}
                        </Chip>
                    );
                })}
            </View>
            <View style={styles.stepperRow}>
                <IconButton
                    icon="minus"
                    mode="contained"
                    size={22}
                    containerColor="#a15586"
                    iconColor="white"
                    disabled={value <= MIN_CONTACT_LIMIT}
                    onPress={() => onChange(clamp(value - 1))}
                />
                <Text style={styles.value}>{value}</Text>
                <IconButton
                    icon="plus"
                    mode="contained"
                    size={22}
                    containerColor="#e67aa7"
                    iconColor="white"
                    disabled={value >= MAX_CONTACT_LIMIT}
                    onPress={() => onChange(clamp(value + 1))}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 15,
        color: '#333',
    },
    presetRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    chip: {
        marginHorizontal: 4,
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
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    value: {
        minWidth: 48,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#a15586',
    },
});

export default ContactFrequencyPicker;
