// useUser.js
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const useUser = () => useContext(UserContext);

export default useUser;
