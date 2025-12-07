import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { createWatchlist } from '../api/stockService';
import useWatchlistStore from '../store/watchlistStore';

const CreateWatchlistModal = ({ visible, onClose }) => {
  const [watchlistName, setWatchlistName] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshWatchlists } = useWatchlistStore();

  const handleCreate = async () => {
    if (!watchlistName.trim()) {
      alert('Please enter a watchlist name');
      return;
    }

    try {
      setLoading(true);
      await createWatchlist(watchlistName.trim());
      await refreshWatchlists();
      alert(`Watchlist "${watchlistName.trim()}" created successfully!`);
      setLoading(false);
      setWatchlistName('');
      onClose();
    } catch (error) {
      setLoading(false);
      console.error('Error creating watchlist:', error);
      alert(error.error || 'Failed to create watchlist');
    }
  };

  const handleCancel = () => {
    setWatchlistName('');
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <LinearGradient
        colors={['#1a0a3e', '#2d1810']}
        style={styles.modalContent}
      >
        <Text style={styles.title}>Create New Watchlist</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Watchlist Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 'Tech Stocks', 'Dividend Payers'"
            placeholderTextColor="#9CA3AF"
            value={watchlistName}
            onChangeText={setWatchlistName}
            autoFocus
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreate}
            disabled={loading || !watchlistName.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 60, 200, 0.3)',
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 60, 200, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateWatchlistModal;
