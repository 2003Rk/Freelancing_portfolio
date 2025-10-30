import { collection, getDocs, query, orderBy, getDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Fetch all client data from Firestore
 * Expected document structure:
 * {
 *   clientName: string,
 *   projectType: string,
 *   paymentType: string,
 *   totalBudget: number,
 *   images: array of objects with {url, fileName, uploadedAt},
 *   imageCount: number,
 *   createdAt: string,
 *   submittedAt: timestamp
 * }
 */
export const fetchClientsData = async () => {
  try {
    const clientsRef = collection(db, 'clientProofs'); // Changed from 'clients' to 'clientProofs'
    
    // Try with ordering first, fall back to simple query if it fails
    let querySnapshot;
    try {
      const q = query(clientsRef, orderBy('submittedAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderError) {
      console.warn('OrderBy failed, fetching without ordering:', orderError);
      // If orderBy fails (no index), just get all documents
      querySnapshot = await getDocs(clientsRef);
    }
    
    const clients = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Fetched client:', doc.id, data); // Debug log
      clients.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total clients fetched:', clients.length); // Debug log
    return clients;
  } catch (error) {
    console.error('Error fetching clients data:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

/**
 * Fetch a specific client by ID
 */
export const fetchClientById = async (clientId) => {
  try {
    const clientDoc = await getDoc(doc(db, 'clientProofs', clientId));
    if (clientDoc.exists()) {
      return {
        id: clientDoc.id,
        ...clientDoc.data()
      };
    } else {
      throw new Error('Client not found');
    }
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

/**
 * Fetch all reviews data from Firestore
 * Expected document structure:
 * {
 *   clientName: string,
 *   country: string,
 *   projectName: string,
 *   projectType: string,
 *   rating: number,
 *   ratingLabel: string,
 *   review: string,
 *   amount: string,
 *   timestamp: timestamp,
 *   createdAt: string
 * }
 */
export const fetchReviewsData = async () => {
  try {
    const reviewsRef = collection(db, 'reviews');
    
    // Try with ordering first, fall back to simple query if it fails
    let querySnapshot;
    try {
      const q = query(reviewsRef, orderBy('timestamp', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderError) {
      console.warn('OrderBy failed for reviews, fetching without ordering:', orderError);
      // If orderBy fails (no index), just get all documents
      querySnapshot = await getDocs(reviewsRef);
    }
    
    const reviews = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Fetched review:', doc.id, data); // Debug log
      reviews.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total reviews fetched:', reviews.length); // Debug log
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews data:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

/**
 * Add a new client (for admin use)
 */
export const addClient = async (clientData) => {
  try {
    const clientsRef = collection(db, 'clients');
    const docRef = await addDoc(clientsRef, {
      ...clientData,
      timestamp: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
};