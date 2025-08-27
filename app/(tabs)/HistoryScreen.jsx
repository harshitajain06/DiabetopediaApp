import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ✅ Updated with Hindi translations
const originalDefaultItems = [
];

const categories = [
  'All',
  'Food',
  'Pain',
  'Recreational Activity',
  'Communication',
  'Basic Needs',
];

export default function HistoryScreen() {
  const [firebaseItems, setFirebaseItems] = useState([]);
  const [defaultItems, setDefaultItems] = useState(originalDefaultItems);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const historyRef = collection(db, 'users', userId, 'history');
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

  const speakHindi = (text) => {
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 1.0,
      pitch: 1.0,
    });
  };

  const deleteItem = async (item, fromFirebase = false) => {
    if (fromFirebase) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'history', item.id));
        setFirebaseItems((prev) => prev.filter((i) => i.id !== item.id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    } else {
      setDefaultItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const restoreDefaultItems = () => {
    setDefaultItems(originalDefaultItems);
  };

  const shareText = async (text) => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const filteredItems = [...firebaseItems, ...defaultItems].filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

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

      <View style={styles.categoryBar}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
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
              <Text style={styles.response}>{item.response}</Text>
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
                onPress={() =>
                  Alert.alert('Delete', 'Are you sure you want to delete?', [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      onPress: () => deleteItem(item, !!item.createdAt),
                    },
                  ])
                }
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

              {/* Hindi Speech */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => speakHindi(item.responseHindi || item.response)}
              >
                <Text style={styles.actionText}>🔊 Speak Hindi</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.restoreButton} onPress={restoreDefaultItems}>
        <Text style={styles.restoreText}>🔄 Restore Deleted Defaults</Text>
      </TouchableOpacity>
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
  categoryBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    color: '#111827',
    fontWeight: '600',
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
  restoreButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
  },
  restoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
