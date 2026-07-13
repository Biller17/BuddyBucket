import * as Notifications from 'expo-notifications';

// Show reminders while the app is foregrounded too.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function requestNotificationPermissions() {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') return true;
        const { status: asked } = await Notifications.requestPermissionsAsync();
        return asked === 'granted';
    } catch (error) {
        console.log('Notification permission error:', error);
        return false;
    }
}

// The moment a buddy is due for contact, at 12:00 local time. If that noon has
// already passed (buddy is already overdue), fire at the next upcoming noon.
function reminderDate(buddy) {
    const due = new Date(`${buddy.lastContact}T00:00:00`);
    due.setDate(due.getDate() + buddy.contactLimit);
    due.setHours(12, 0, 0, 0);

    // A snooze pushes the reminder out to (at least) the snoozed date's noon.
    if (buddy.snoozedUntil) {
        const snooze = new Date(`${buddy.snoozedUntil}T00:00:00`);
        snooze.setHours(12, 0, 0, 0);
        if (snooze > due) return snooze;
    }

    const now = new Date();
    if (due > now) return due;

    // Already overdue — schedule the next noon (today if it hasn't passed).
    const nextNoon = new Date();
    nextNoon.setHours(12, 0, 0, 0);
    if (nextNoon <= now) nextNoon.setDate(nextNoon.getDate() + 1);
    return nextNoon;
}

// Schedule (or reschedule) a buddy's reminder. The buddy id doubles as the
// notification identifier so we can cancel/replace it cleanly.
export async function scheduleBuddyReminder(buddy) {
    try {
        await Notifications.cancelScheduledNotificationAsync(buddy.id);
        await Notifications.scheduleNotificationAsync({
            identifier: buddy.id,
            content: {
                title: 'Buddy Bucket',
                body: `Time to check in on ${buddy.name}! 🪣`,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: reminderDate(buddy),
            },
        });
    } catch (error) {
        console.log('Failed to schedule reminder:', error);
    }
}

export async function cancelBuddyReminder(buddyId) {
    try {
        await Notifications.cancelScheduledNotificationAsync(buddyId);
    } catch (error) {
        console.log('Failed to cancel reminder:', error);
    }
}

// Rebuild all reminders from the current buddy data (called on app start).
export async function syncAllReminders(buddyMap) {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        for (const buddy of buddyMap.values()) {
            await scheduleBuddyReminder(buddy);
        }
    } catch (error) {
        console.log('Failed to sync reminders:', error);
    }
}
