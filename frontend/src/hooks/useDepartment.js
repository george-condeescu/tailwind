import { useContext } from 'react';
import { DepartmentContext } from '../context/departmentContext.jsx';

export const useDepartments = () => useContext(DepartmentContext);
