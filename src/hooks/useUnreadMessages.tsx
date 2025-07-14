
'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useUnreadMessages(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participantIds', 'array-contains', userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let count = 0;
      querySnapshot.forEach((doc) => {
        const conversation = doc.data();
        // An unread message exists if there is a last message, and it wasn't sent by the current user.
        if (conversation.lastMessage && conversation.lastMessage.senderId !== userId) {
          count++;
        }
      });
      setUnreadCount(count);
    }, (error) => {
        console.error("Error fetching unread messages count: ", error);
        setUnreadCount(0);
    });

    // Cleanup the listener when the component unmounts or userId changes
    return () => unsubscribe();
  }, [userId]);

  return unreadCount;
}
