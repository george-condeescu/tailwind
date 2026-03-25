import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock pentru window.location (pentru a testa redirecționarea)
delete window.location;
window.location = { href: '', pathname: '/' };