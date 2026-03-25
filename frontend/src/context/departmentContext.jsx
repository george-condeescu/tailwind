import { createContext, useReducer, useCallback } from 'react';
import api from '../api/axiosInstance';

import {
  FETCH_DEPARTMENTS_START,
  FETCH_DEPARTMENTS_SUCCESS,
  FETCH_DEPARTMENTS_FAILURE,
  FETCH_DEPARTMENT_START,
  FETCH_DEPARTMENT_SUCCESS,
  FETCH_DEPARTMENT_FAILURE,
  ADD_DEPARTMENT_START,
  ADD_DEPARTMENT_SUCCESS,
  ADD_DEPARTMENT_FAILURE,
  UPDATE_DEPARTMENT_START,
  UPDATE_DEPARTMENT_SUCCESS,
  UPDATE_DEPARTMENT_FAILURE,
  DELETE_DEPARTMENT_START,
  DELETE_DEPARTMENT_SUCCESS,
  DELETE_DEPARTMENT_FAILURE,
} from './types';

const initialState = {
  departments: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line react-refresh/only-export-components
export const DepartmentContext = createContext(null);

const departmentReducer = (state, action) => {
  switch (action.type) {
    //Fetch a single department
    case FETCH_DEPARTMENT_START:
      return { ...state, loading: true, error: null };
    case FETCH_DEPARTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        department: state.departments.filter(
          (dept) => dept.id === action.payload.id,
        )[0],
      };
    case FETCH_DEPARTMENT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Fetch all departments
    case FETCH_DEPARTMENTS_START:
      return { ...state, loading: true, error: null };
    case FETCH_DEPARTMENTS_SUCCESS:
      return { ...state, loading: false, departments: action.payload.data };
    case FETCH_DEPARTMENTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Add more cases for create, update, delete if needed
    case ADD_DEPARTMENT_START:
      return { ...state, loading: true, error: null };
    case ADD_DEPARTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        departments: [...state.departments, action.payload],
      };
    case ADD_DEPARTMENT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Update department
    case UPDATE_DEPARTMENT_START:
      return { ...state, loading: true, error: null };
    case UPDATE_DEPARTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        departments: state.departments.map((dept) =>
          dept.id === action.payload.id ? action.payload : dept,
        ),
      };
    case UPDATE_DEPARTMENT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Delete department
    case DELETE_DEPARTMENT_START:
      return { ...state, loading: true, error: null };
    case DELETE_DEPARTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        departments: state.departments.filter(
          (dept) => dept.id !== action.payload,
        ),
      };
    case DELETE_DEPARTMENT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Directia userului
    case 'FETCH_USER_DIRECTIE_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_USER_DIRECTIE_SUCCESS':
      return { ...state, loading: false, userDirectie: action.payload };
    case 'FETCH_USER_DIRECTIE_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const DepartmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(departmentReducer, initialState);

  // 1. Fetch all departments
  const getDepartments = useCallback(async () => {
    dispatch({ type: FETCH_DEPARTMENTS_START });
    try {
      const res = await api.get('/departments');
      dispatch({ type: FETCH_DEPARTMENTS_SUCCESS, payload: res.data });
    } catch (err) {
      dispatch({ type: FETCH_DEPARTMENTS_FAILURE, payload: err.message });
    }
  }, []);

  // 2. Fetch single department by ID => /departments/:id
  const getDepartment = useCallback(
    async (id) => {
      dispatch({ type: FETCH_DEPARTMENT_START });
      try {
        const res = await api.get(`/departments/${id}`);
        dispatch({ type: FETCH_DEPARTMENT_SUCCESS, payload: res.data });
        return res.data; // Return the department data for immediate use
      } catch (err) {
        dispatch({ type: FETCH_DEPARTMENT_FAILURE, payload: err.message });
      }
    },
    [dispatch],
  );

  // 3. Get department by user ID => /departments/user/:userId
  const getDepartmentByUserId = useCallback(
    async (userId) => {
      dispatch({ type: FETCH_DEPARTMENT_START });
      try {
        const res = await api.get(`/departments/user/${userId}`);
        dispatch({ type: FETCH_DEPARTMENT_SUCCESS, payload: res.data });
        return res.data; // Return the department data for immediate use
      } catch (err) {
        dispatch({ type: FETCH_DEPARTMENT_FAILURE, payload: err.message });
      }
    },
    [dispatch],
  );

  // 4. Add department
  const addDepartment = async (departmentData) => {
    try {
      const res = await api.post('/departments', departmentData);
      dispatch({ type: ADD_DEPARTMENT_SUCCESS, payload: res.data });
      return { success: true };
    } catch (err) {
      dispatch({ type: ADD_DEPARTMENT_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  };

  // 5. Update department
  const updateDepartment = async (id, updateData) => {
    try {
      const res = await api.put(`/departments/${id}`, updateData);
      dispatch({ type: UPDATE_DEPARTMENT_SUCCESS, payload: res.data });
      return { success: true };
    } catch (err) {
      dispatch({ type: UPDATE_DEPARTMENT_FAILURE, payload: err.message });
      return { success: false, error: err.message };
    }
  };

  // 6. Delete department
  const deleteDepartment = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest departament?'))
      return;
    try {
      await api.delete(`/departments/${id}`);
      dispatch({ type: DELETE_DEPARTMENT_SUCCESS, payload: id });
    } catch (err) {
      dispatch({ type: DELETE_DEPARTMENT_FAILURE, payload: err.message });
    }
  };

  // 7. Get user directie
  const getUserDirectie = async (userId) => {
    dispatch({ type: 'FETCH_USER_DIRECTIE_START' });
    try {
      const res = await api.get(`/departments/user/${userId}/directie`);
      dispatch({ type: 'FETCH_USER_DIRECTIE_SUCCESS', payload: res.data });
      return res.data; // Return the directie data for immediate use
    } catch (err) {
      dispatch({ type: 'FETCH_USER_DIRECTIE_FAILURE', payload: err.message });
    }
  };

  return (
    <DepartmentContext.Provider
      value={{
        ...state,
        getDepartments,
        getDepartment,
        getDepartmentByUserId,
        getUserDirectie,
        addDepartment,
        updateDepartment,
        deleteDepartment,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};
