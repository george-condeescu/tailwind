import React, { createContext, useContext, useState } from 'react';
import api from '../api/axiosInstance';

import {
  FETCH_PARTNERS_START,
  FETCH_PARTNERS_SUCCESS,
  FETCH_PARTNERS_FAILURE,
  FETCH_PARTNER_START,
  FETCH_PARTNER_SUCCESS,
  FETCH_PARTNER_FAILURE,
} from './types';

const initialState = {
  partners: [],
  selectedPartner: null,
  loading: false,
  error: null,
  pagination: { total: 0, totalPages: 1, currentPage: 1 },
};

const partnerReducer = (state, action) => {
  switch (action.type) {
    case FETCH_PARTNERS_START:
    case FETCH_PARTNER_START:
      return { ...state, loading: true, error: null };
    case FETCH_PARTNERS_SUCCESS:
      return {
        ...state,
        loading: false,
        partners: action.payload.partners,
        pagination: {
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        },
      };
    case FETCH_PARTNER_SUCCESS:
      return { ...state, loading: false, selectedPartner: action.payload };
    case FETCH_PARTNERS_FAILURE:
    case FETCH_PARTNER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // add partener cases (create, update, delete) aici
    case 'CREATE_PARTNER_START':
    case 'UPDATE_PARTNER_START':
    case 'DELETE_PARTNER_START':
      return { ...state, loading: true, error: null };
    case 'CREATE_PARTNER_SUCCESS':
      return { ...state, partners: [...state.partners, action.payload] };
    case 'UPDATE_PARTNER_SUCCESS':
      return {
        ...state,
        partners: state.partners.map((partner) =>
          partner.id === action.payload.id ? action.payload : partner,
        ),
      };
    case 'DELETE_PARTNER_SUCCESS':
      return {
        ...state,
        partners: state.partners.filter(
          (partner) => partner.id !== action.payload,
        ),
      };
    case 'CREATE_PARTNER_FAILURE':
    case 'UPDATE_PARTNER_FAILURE':
    case 'DELETE_PARTNER_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const PartnerContext = createContext(null);

export const PartnerProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(partnerReducer, initialState);

  // 1. Fetch partners (paginated)
  const getPartners = async (page = 1) => {
    dispatch({ type: FETCH_PARTNERS_START });
    try {
      const response = await api.get(`/partners/?page=${page}`);
      const data = response.data;
      dispatch({ type: FETCH_PARTNERS_SUCCESS, payload: data });
      return data;
    } catch (error) {
      console.error('Eroare la obținerea partenerilor:', error);
      dispatch({ type: FETCH_PARTNERS_FAILURE, payload: error.message });
    }
  };

  // 1b. Fetch all partners (no pagination) - for search/select
  const getAllPartners = async () => {
    try {
      const response = await api.get('/partners/?all=true');
      // console.log('Toți partenerii:', response.data);
      return response.data;
    } catch (error) {
      console.error('Eroare la obținerea tuturor partenerilor:', error);
      throw error;
    }
  };

  // 2. Fetch single partner
  const getPartner = async (id) => {
    dispatch({ type: FETCH_PARTNER_START });
    try {
      const response = await api.get(`/api/partners/${id}/`);
      const data = response.data;
      console.log('Partener selectat:', data);
      dispatch({ type: FETCH_PARTNER_SUCCESS, payload: data });
    } catch (error) {
      console.error('Eroare la obținerea partenerului:', error);
      dispatch({ type: FETCH_PARTNER_FAILURE, payload: error.message });
    }
  };

  return (
    <PartnerContext.Provider
      value={{
        ...state,
        getPartners,
        getAllPartners,
        getPartner,
        pagination: state.pagination,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};
