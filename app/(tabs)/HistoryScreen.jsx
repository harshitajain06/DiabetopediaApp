import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebase';

const { width } = Dimensions.get('window');



export default function HistoryScreen() {
  const [firebaseItems, setFirebaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const historyRef = collection(db, 'users', userId, 'history1');
      const q = query(historyRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFirebaseItems(items);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const speakText = (text) => {
    Speech.speak(text, {
      language: 'en',
      rate: 1.0,
      pitch: 1.0,
    });
  };


  const showDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'history1', itemToDelete.id);
      await deleteDoc(docRef);
      setFirebaseItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setDeleteModalVisible(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', `Failed to delete item: ${error.message}`);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };


  const renderRichText = (text) => {
    // Simple approach: just clean the markdown and return as plain text
    const cleanedText = text
      .replace(/#{1,6}\s*/g, '') // Remove # headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove ** bold **
      .replace(/\*([^*]+)\*/g, '$1') // Remove * italic *
      .replace(/\n\n/g, '\n') // Remove extra line breaks
      .trim();
    
    return cleanedText;
  };

  const shareText = async (text) => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const filteredItems = firebaseItems;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchHistory();
          }}
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.header}>📂 Items History</Text>
        <TouchableOpacity onPress={fetchHistory} style={styles.refreshIcon}>
          <Ionicons name="refresh" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>


      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : filteredItems.length === 0 ? (
        <Text style={styles.noData}>No items found.</Text>
      ) : (
        filteredItems.map((item) => (
          <View key={item.id} style={styles.card}>
            {item.image && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Message:</Text>
              <Text style={styles.response} selectable={true} allowFontScaling={true}>
                {renderRichText(item.response)}
              </Text>
              {item.createdAt && (
                <Text style={styles.date}>
                  {item.createdAt?.toDate?.().toLocaleString?.() || ''}
                </Text>
              )}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => shareText(item.response)}
              >
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                onPress={() => showDeleteModal(item)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>

              {/* English Speech */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => speakText(item.response)}
              >
                <Text style={styles.actionText}>🔊 Speak</Text>
              </TouchableOpacity>

            </View>
          </View>
        ))
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Item</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this item? This action cannot be undone.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
  },
  refreshIcon: {
    padding: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
  },
  noData: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '20%',
    height: width > 768 ? 300 : 180,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  textContainer: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111827',
  },
  response: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 6,
    margin: 4,
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
