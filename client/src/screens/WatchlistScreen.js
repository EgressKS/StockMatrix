import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import WatchlistCard from '../components/WatchlistCard';
import CreateWatchlistModal from '../components/CreateWatchlistModal';
import useWatchlistStore from '../store/watchlistStore';

const WatchlistScreen = () => {
  const navigation = useNavigation();
  const { watchlists, loading, loadWatchlists } = useWatchlistStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [watchlistToDelete, setWatchlistToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadWatchlists();
  }, []);

  const handleWatchlistPress = (watchlist) => {
    navigation.navigate('ViewAll', { 
      type: 'watchlist',
      watchlistName: watchlist.name,
      stocks: watchlist.stocks,
    });
  };

  const { deleteWatchlist } = useWatchlistStore();

  const handleAddWatchlist = () => {
    setCreateModalVisible(true);
  };

  const handleMenuPress = (watchlist) => {
    setWatchlistToDelete(watchlist);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!watchlistToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteWatchlist(watchlistToDelete.name);
      setDeleteModalVisible(false);
      setWatchlistToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete watchlist. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setWatchlistToDelete(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#1a0a3e', '#000000', '#2d1810']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Watchlists</Text>
        </View>
        <View style={styles.horizontalLine} />
      

      <ScrollView style={styles.content}>
        {watchlists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No watchlists yet</Text>
            <Text style={styles.emptySubtext}>
              Create a watchlist to track your favorite stocks
            </Text>
          </View>
        ) : (
          watchlists.map((watchlist, index) => (
            <WatchlistCard
              key={index}
              watchlist={watchlist}
              onPress={() => handleWatchlistPress(watchlist)}
              onMenuPress={() => handleMenuPress(watchlist)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddWatchlist}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

        <CreateWatchlistModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
        />

        <Modal
          isVisible={deleteModalVisible}
          onBackdropPress={handleCancelDelete}
          onBackButtonPress={handleCancelDelete}
          style={styles.modal}
          animationIn="zoomIn"
          animationOut="zoomOut"
        >
          <LinearGradient
            colors={['#1a0a3e', '#2d1810']}
            style={styles.deleteModalContent}
          >
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠️</Text>
            </View>
            <Text style={styles.deleteTitle}>Delete Watchlist</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete "{watchlistToDelete?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteButtonRow}>
              <TouchableOpacity 
                style={styles.deleteCancelButton} 
                onPress={handleCancelDelete}
                disabled={isDeleting}
              >
                <Text style={styles.deleteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteConfirmButton} 
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop:20,
    padding: 12,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign:'center'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop:20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: 'rgba(175, 175, 248, 0.3)',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  deleteModalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 32,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  deleteButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 60, 200, 0.3)',
  },
  deleteCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WatchlistScreen;
