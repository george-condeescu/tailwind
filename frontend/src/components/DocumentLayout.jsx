import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DocumentTabs from './DocumentTabs';

function DocumentLayout() {
  const { id } = useParams();
  const location = useLocation();
  return (
    <div className="space-y-6">
      <DocumentTabs />
      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-5">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          id: {id} | path: {location.pathname}
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/documents/:id" element={<DocumentLayout />}>
        <Route index element={<Navigate to="informatii" replace />} />
        <Route path="informatii" element={<div>Info content</div>} />
        <Route
          path="circulatieDocument"
          element={<div>Circulație content</div>}
        />
        <Route path="comentarii" element={<div>Comentarii content</div>} />
        <Route path="fisiere" element={<div>Fișiere content</div>} />
      </Route>
    </Routes>
  );
}
