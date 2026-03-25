import { useReducer, useEffect, useCallback, createContext } from 'react';
import axios from 'axios';

import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  FETCH_DEPARTMENT_START,
  FETCH_DEPARTMENT_SUCCESS,
  FETCH_DEPARTMENT_FAILURE,
} from './types';

const initialState = {
  user: null,
  isAuthenticated: false,
  department: null,
  loading: true,
  error: null,
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case FETCH_DEPARTMENT_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_DEPARTMENT_SUCCESS:
      return {
        ...state,
        department: action.payload.data,
        loading: false,
        error: null,
      };
    case FETCH_DEPARTMENT_FAILURE:
      return {
        ...state,
        department: null,
        loading: false,
        error: action.payload,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // --- AICI DEFINIM getDepartment ---
  const getDepartment = useCallback(async (id) => {
    dispatch({ type: FETCH_DEPARTMENT_START });
    if (localStorage.getItem('department')) {
      const savedDepartment = JSON.parse(localStorage.getItem('department'));
      dispatch({ type: FETCH_DEPARTMENT_SUCCESS, payload: savedDepartment });
      return savedDepartment; // Return the cached department data
    } else {
      try {
        const res = await axios.get(`/departments/user/${id}`);
        console.log('Departamentul utilizatorului:', res);
        dispatch({ type: FETCH_DEPARTMENT_SUCCESS, payload: res.data });
        localStorage.setItem('department', JSON.stringify(res.data));

        return res.data; // Return the department data for immediate use
      } catch (err) {
        dispatch({ type: FETCH_DEPARTMENT_FAILURE, payload: err.message });
        throw err; // Rethrow the error for the caller to handle
      }
    }
  }, []); // Dependențe goale = funcția e creată O SINGURĂ DATĂ la montarea componentei

  // --- AICI DEFINIM LOGIN AUTOMAT LA ÎNCĂRCAREA PAGINII ---
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: LOGIN_START });
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (savedUser && token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Pas 1: Setăm userul
        dispatch({ type: LOGIN_SUCCESS, payload: JSON.parse(savedUser) });
        // Pas 2: Aducem departamentul utilizatorului
        await getDepartment(JSON.parse(savedUser).id);

        // await getDepartment(JSON.parse(savedUser).id);
      } else {
        dispatch({ type: LOGIN_FAILURE, payload: 'No user found' });
      }
    };

    initAuth();
  }, [getDepartment]); // Dependența getDepartment pentru a putea folosi funcția în useEffect

  // --- AICI DEFINIM LOGOUT ---
  const logout = useCallback(async () => {
    // 1. Acțiune fizică: curățăm browserul
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('department');

    // 2. Acțiune logică: anunțăm Reducer-ul să reseteze state-ul
    await axios.post('/auth/logout'); // Notificăm backend-ul (opțional, dar recomandat pentru audit și invalidare token)
    dispatch({ type: LOGOUT });

    console.log('Utilizatorul a fost deconectat cu succes.');
  }, []); // Dependențe goale = funcția e creată O SINGURĂ DATĂ la montarea componentei

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout, getDepartment }}>
      {children}
    </AuthContext.Provider>
  );
};
