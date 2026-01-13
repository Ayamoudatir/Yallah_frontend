import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCLrGe7T6ot8KrGVcj0M3HsM9zORpKin4A',
  authDomain: 'yalah-mobile.firebaseapp.com',
  projectId: 'yalah-mobile',
  storageBucket: 'yalah-mobile.appspot.com',
  messagingSenderId: '1051871657630',
  appId: '1:1051871657630:web:6cf7d8900c2912848d858f',
};

export const firebaseApp = initializeApp(firebaseConfig);
console.log('Firebase initialisé avec le projet:', firebaseConfig.projectId);