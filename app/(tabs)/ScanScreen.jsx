import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db, storage } from '../../config/firebase';
import { encodeToBase64 } from '../../utils/base64Encoder';

export default function ScanPageWithAI() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) requestPermission();
    fetchApiKey();
  }, [permission]);

  const fetchApiKey = async () => {
    try {
      const apiKeyDoc = await getDoc(doc(db, 'configSnigdha', 'openai'));
      if (apiKeyDoc.exists()) {
        setOpenaiApiKey(apiKeyDoc.data().apiKey);
      } else {
        console.error('OpenAI API key not found in Firestore');
        Alert.alert('Error', 'API configuration not found. Please contact support.');
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      Alert.alert('Error', 'Failed to load API configuration.');
    }
  };

  const analyzeAndUpload = async (uri) => {
    try {
      setLoading(true);
      setAiResponse('');

      let base64;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64 = await blobToBase64(blob);
      } else {
        base64 = await encodeToBase64(uri);
      }

      // Check if API key is available
      if (!openaiApiKey) {
        Alert.alert('Error', 'API key not loaded. Please try again.');
        setLoading(false);
        return;
      }

      // Step 1: Get English interpretation
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'You are a diabetes nutrition assistant. The user will ask about Indian foods. You are given the nutrition values (carbs, fat, protein, sugar, GI, etc.). Classify the food as Green (safe), Yellow (moderate), or Red (avoid) for diabetics. If the food is Yellow or Red, suggest a healthier alternative from the dataset.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'What all ingredients are in this dish? break down the contents into the different macronutrients (carbs, fats, proteins, vegetables) contained in them. Also suggest some alternatives for thefood in image and why those alternatives are better. Tell the user if the dish is safe for the diabetic patient.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
              ],
            },
          ],
        }),
      });

      const data = await openaiRes.json();
      const reply = data.choices?.[0]?.message?.content || 'No response';
      console.log('AI Response received:', reply);
      setAiResponse(reply);

      setModalVisible(true);

      // Step 3: Upload image + responses to Firestore
      setIsUploading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const imageBlob = await fetch(uri).then((res) => res.blob());
      const imageRef = ref(storage, `images/${userId}/${Date.now()}.jpg`);
      await uploadBytes(imageRef, imageBlob);
      const downloadURL = await getDownloadURL(imageRef);

      const historyRef = collection(db, 'users', userId, 'history1');
      await addDoc(historyRef, {
        image: downloadURL,
        response: reply,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setIsUploading(false);
      setLoading(false);
      setCameraActive(false);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  const pickImage = async () => {
    setSelectedImage(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      await analyzeAndUpload(uri);
    }
  };

  const takePicture = async () => {
    setSelectedImage(null);
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setSelectedImage(photo.uri);
      await analyzeAndUpload(photo.uri);
    }
  };

  const renderCamera = () => (
    <CameraView style={styles.camera} ref={cameraRef} mode="picture" facing="back" mute={false}>
      <View style={styles.cameraOverlay}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
      </View>
    </CameraView>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Talk to Me</Text>

      <View style={styles.scanBox}>
        {cameraActive ? (
          !permission?.granted ? (
            <Text>No access to camera</Text>
          ) : (
            renderCamera()
          )
        ) : (
          <TouchableOpacity style={styles.iconArea}>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.placeholderText}>
            Take a picture or upload an image to get insights on your plate
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#93c5fd' }]}
        onPress={pickImage}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>📁 Upload Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#e9d5ff' }]}
        onPress={() => setCameraActive(true)}
        disabled={isUploading}
      >
        <Text style={[styles.buttonText, { color: '#7c3aed' }]}>📷 Use Camera</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 20 }} />}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.title}>🧠 AI Interpretation</Text>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}
          <View style={styles.responseBox}>
            <Text style={styles.responseTitle}>This Iem contains:</Text>
            <Text style={styles.responseText} selectable={true} allowFontScaling={true}>
              {renderRichText(aiResponse)}
            </Text>

            {/* */}
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#93c5fd' }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Photo Tips for Best Results:</Text>
        <Text style={styles.tip}>• Use clear, well-lit images</Text>
        <Text style={styles.tip}>• Center the object (food/toy/activity)</Text>
        <Text style={styles.tip}>• Avoid blurry or dark pictures</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1f2937',
  },
  scanBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#8b5cf6',
  },
  iconArea: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 42,
    marginBottom: 10,
    color: '#8b5cf6',
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#6b7280',
    maxWidth: 250,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginVertical: 20,
  },
  responseBox: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fef3c7',
    width: '100%',
    marginBottom: 20,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#92400e',
  },
  responseText: {
    fontSize: 16,
    color: '#78350f',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    elevation: 2,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
});
