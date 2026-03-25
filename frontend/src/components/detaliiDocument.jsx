import { useState, lazy, useMemo } from 'react';
import { Routes, Route, useParams, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

const InformatiiDocument = lazy(() => import('./informatiiDocument'));
const CirculatieDocument = lazy(() => import('./circulatieDocument'));
const Comentarii = lazy(() => import('./comentarii'));
const Distributie = lazy(() => import('./distributie'));
const Fisiere = lazy(() => import('./fisiere'));
const Revizii = lazy(() => import('./revizii'));

import { Users, Files, File, Mail } from 'lucide-react';

export default function DetaliiDocument() {
  const id = useParams().id; // Get the document ID from the URL parameters
  const { user } = useAuth(); // Get the authenticated user information from the custom useAuth hook
  const userId = user?.id; // Extract the user ID from the authenticated user information

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('informatii');

  const [destinatar, setDestinatar] = useState('');

  const tabs = useMemo(
    () => [
      {
        id: 'informatii',
        label: 'Informatii document',
        href: `/documents/${id}/informatii`,
        icon: 'File',
      },
      {
        id: 'circulatie',
        label: 'Circulatie',
        href: `/documents/${id}/circulatie`,
        icon: 'Users',
      },
      {
        id: 'comentarii',
        label: 'Comentarii',
        href: `/documents/${id}/comentarii`,
        icon: 'Mail',
      },
      {
        id: 'fisiere',
        label: 'Fisiere',
        href: `/documents/${id}/fisiere`,
        icon: 'Files',
      },
    ],
    [id],
  );

  const iconMap = {
    Users,
    Files,
    File,
    Mail,
  };

  const userQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data;
    },
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: errorUsers,
  } = userQuery;

  const queryDocumentDetails = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const res = await api.get(`/documents/${id}`);
      return res.data;
    },
  });

  const {
    data: documentData,
    isLoading: isLoadingDocument,
    error: errorDocument,
  } = queryDocumentDetails;

  // query to fetch last sender
  const queryLastSender = useQuery({
    queryKey: ['lastSender', documentData?.id, userId],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/circulatie/last-sender/${documentData?.id}/${userId}`,
        );
        const { data } = response;
        if (!data || Object.keys(data).length === 0) {
          return null; // Return null if no data is found, allowing the component to handle this case gracefully
        }
        return data; // Return the last sender data if found
      } catch (error) {
        console.error('Error fetching last sender:', error);
        throw error;
      }
    },
  });
  const {
    data: lastSenderData,
    isLoading: isLoadingLastSender,
    error: errorLastSender,
  } = queryLastSender;

  if (isLoadingLastSender || isLoadingDocument || isLoadingUsers) {
    return <div>Loading...</div>;
  }

  if (errorLastSender || errorDocument || errorUsers) {
    return (
      <div>
        Error loading last sender:{' '}
        {errorLastSender?.message ||
          errorDocument?.message ||
          errorUsers?.message}
      </div>
    );
  }

  const handleSend = () => {
    // Implement the logic to send the document to the selected recipient
    console.log('Selected recipient:', destinatar);
    // You can make an API call here to send the document to the selected recipient
    console.log('Document data to send:', documentData);

    api
      .post('/circulatie/trimite', {
        document_id: documentData.id,
        from_user_id: userId,
        to_user_id: destinatar,
        note: 'Optional note for the recipient....',
      })
      .then((response) => {
        console.log('Document sent successfully:', response.data);
        queryClient.invalidateQueries({ queryKey: ['documents', userId] });
        navigate('/inbox');
      })
      .catch((error) => {
        console.error('Error sending document:', error);
      });
  };

  // console.log('DocumentData:', documentData);

  return (
    <div className="flex flex-col w-full bg-gray-300 p-6 rounded-lg shadow">
      {/* Header */}
      <div className="bg-yellow-50 border-l-4 border-red-600 px-4 py-3 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">De la:</span>{' '}
            <span>{lastSenderData?.full_name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 mb-6">
        <div className="flex flex-row  gap-1">
          {tabs.map((tab) => {
            const IconComponent = iconMap[tab.icon];
            return (
              <div key={tab.id} className="flex flex-row">
                <div>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 font-semibold'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      {IconComponent ? (
                        <IconComponent size={16} className="mr-1" />
                      ) : null}
                      <NavLink
                        className="no-underline! hover:no-underline focus:no-underline active:no-underline"
                        to={tab.href}
                      >
                        {tab.label}
                      </NavLink>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
          {/* Separator between tabs */}
          <div className="flex flex-row items-right gap-2 ml-auto">
            Către:{' '}
            <select
              className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setDestinatar(e.target.value)}
            >
              <option value="">-- selecteaza destinatar --</option>
              {usersData.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl! transition-colors"
              onClick={handleSend}
            >
              Trimite
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-1">
        <Routes>
          <Route
            index
            element={
              <InformatiiDocument
                activeTab={activeTab}
                documentData={documentData}
              />
            }
          />
          <Route
            path="informatii"
            element={
              <InformatiiDocument
                activeTab={activeTab}
                documentData={documentData}
              />
            }
          />
          <Route
            path="circulatie"
            element={
              <CirculatieDocument
                activeTab={activeTab}
                documentData={documentData}
              />
            }
          />
          <Route
            path="comentarii"
            element={
              <Comentarii activeTab={activeTab} documentData={documentData} />
            }
          />
          <Route
            path="fisiere"
            element={
              <Fisiere activeTab={activeTab} documentData={documentData} />
            }
          />
          <Route
            path="distributie"
            element={
              <Distributie activeTab={activeTab} documentData={documentData} />
            }
          />
          <Route
            path="revizii"
            element={<Revizii documentData={documentData} />}
          />
        </Routes>
      </div>
    </div>
  );
}
