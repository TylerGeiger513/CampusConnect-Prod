import { useState, useEffect } from 'react';
import { getFriendsList } from '../utils/friendsHandler';

export default function useFriends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const data = await getFriendsList();
        setFriends(data.friends || []);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFriends();
  }, []);

  return { friends, loading, error };
}
