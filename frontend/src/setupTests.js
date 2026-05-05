import '@testing-library/jest-dom';

// Mock pentru window.location (pentru a testa redirecționarea)
delete window.location;
window.location = { href: '', pathname: '/' };
