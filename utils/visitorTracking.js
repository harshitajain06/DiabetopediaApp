import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const VISITOR_ID_KEY = 'visitor_id';
const VISIT_COUNT_KEY = 'visit_count';

// Generate a unique visitor ID
const generateVisitorId = () => {
  return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create visitor ID
const getVisitorId = async () => {
  try {
    let visitorId = await AsyncStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      await AsyncStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch (error) {
    console.error('Error getting visitor ID:', error);
    return generateVisitorId();
  }
};

// Track a visit
export const trackVisit = async () => {
  try {
    const visitorId = await getVisitorId();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if this is a new visit today
    const lastVisitDate = await AsyncStorage.getItem('last_visit_date');
    const isNewVisitToday = lastVisitDate !== today;
    
    if (isNewVisitToday) {
      // Update last visit date
      await AsyncStorage.setItem('last_visit_date', today);
      
      // Increment daily visit count
      const visitCount = await AsyncStorage.getItem(VISIT_COUNT_KEY);
      const newVisitCount = visitCount ? parseInt(visitCount) + 1 : 1;
      await AsyncStorage.setItem(VISIT_COUNT_KEY, newVisitCount.toString());
      
      // Update Firebase
      await updateVisitorStats(visitorId, today);
    }
    
    return { visitorId, isNewVisitToday };
  } catch (error) {
    console.error('Error tracking visit:', error);
    return { visitorId: null, isNewVisitToday: false };
  }
};

// Update visitor statistics in Firebase
const updateVisitorStats = async (visitorId, date) => {
  try {
    const statsRef = doc(db, 'app_stats', 'visitor_stats');
    const visitorRef = doc(db, 'visitors', visitorId);
    
    // Update or create visitor document
    await setDoc(visitorRef, {
      firstVisit: serverTimestamp(),
      lastVisit: serverTimestamp(),
      totalVisits: increment(1),
      lastVisitDate: date
    }, { merge: true });
    
    // Update daily stats
    const dailyStatsRef = doc(db, 'daily_stats', date);
    await setDoc(dailyStatsRef, {
      date: date,
      uniqueVisitors: increment(1),
      totalVisits: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    // Update overall app stats
    await setDoc(statsRef, {
      totalUniqueVisitors: increment(1),
      totalVisits: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
  } catch (error) {
    console.error('Error updating visitor stats:', error);
  }
};

// Get visitor statistics
export const getVisitorStats = async () => {
  try {
    const statsRef = doc(db, 'app_stats', 'visitor_stats');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      return {
        totalUniqueVisitors: (data.totalUniqueVisitors || 0) + 398,
        totalVisits: (data.totalVisits || 0) + 398,
        lastUpdated: data.lastUpdated
      };
    } else {
      return {
        totalUniqueVisitors: 398,
        totalVisits: 398,
        lastUpdated: null
      };
    }
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return {
      totalUniqueVisitors: 398,
      totalVisits: 398,
      lastUpdated: null
    };
  }
};

// Get local visit count
export const getLocalVisitCount = async () => {
  try {
    const visitCount = await AsyncStorage.getItem(VISIT_COUNT_KEY);
    return visitCount ? parseInt(visitCount) : 0;
  } catch (error) {
    console.error('Error getting local visit count:', error);
    return 0;
  }
};

// Reset visitor data (for testing purposes)
export const resetVisitorData = async () => {
  try {
    await AsyncStorage.removeItem(VISITOR_ID_KEY);
    await AsyncStorage.removeItem(VISIT_COUNT_KEY);
    await AsyncStorage.removeItem('last_visit_date');
  } catch (error) {
    console.error('Error resetting visitor data:', error);
  }
};
