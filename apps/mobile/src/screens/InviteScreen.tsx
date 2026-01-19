import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { apiClient } from '../api/apiClient';
import type { InviteDetails, CreateInviteRequest } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Invite'>;

export default function InviteScreen({ route, navigation }: Props) {
  const { inviteId } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [invite, setInvite] = useState<InviteDetails | null>(null);

  // Form state for creating new invite
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [allowedPlusOnes, setAllowedPlusOnes] = useState('2');
  const [eventId, setEventId] = useState('');

  useEffect(() => {
    if (inviteId) {
      loadInvite(inviteId);
    }
  }, [inviteId]);

  const loadInvite = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await apiClient.getInvite(id);
      setInvite(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!guestName.trim() || !phone.trim() || !eventId.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      const data: CreateInviteRequest = {
        guestName: guestName.trim(),
        phone: phone.trim(),
        allowedPlusOnes: parseInt(allowedPlusOnes) || 0,
        eventId: eventId.trim(),
      };

      const response = await apiClient.createInvite(data);

      Alert.alert('Success', 'Invite created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Load the newly created invite
            loadInvite(response.inviteId);
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create invite');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && inviteId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading invite...</Text>
      </View>
    );
  }

  // Display existing invite
  if (invite) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invite Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guest Name:</Text>
              <Text style={styles.detailValue}>{invite.guestName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{invite.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Allowed Plus-Ones:</Text>
              <Text style={styles.detailValue}>{invite.allowedPlusOnes}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>RSVP Status:</Text>
              <Text style={[styles.detailValue, styles.statusBadge]}>
                {invite.rsvpStatus}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Checked In:</Text>
              <Text style={styles.detailValue}>
                {invite.checkedIn ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert('Coming Soon', 'QR code display coming soon!')}
          >
            <Text style={styles.buttonText}>View QR Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Create new invite form
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Invite</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Guest Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={guestName}
            onChangeText={setGuestName}
            editable={!isLoading}
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="+1234567890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          <Text style={styles.label}>Event ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="nikah-2026"
            value={eventId}
            onChangeText={setEventId}
            editable={!isLoading}
          />

          <Text style={styles.label}>Allowed Plus-Ones</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            value={allowedPlusOnes}
            onChangeText={setAllowedPlusOnes}
            keyboardType="number-pad"
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateInvite}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Invite</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#1e40af',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
