import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex flex-full flex-1">
        <Outlet />
      </main>
    </div>
  );
}
