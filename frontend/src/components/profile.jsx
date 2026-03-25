import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import api from '../api/axiosInstance';
import EditProfileModal from './EditProfileModal';

const Profile = ({ openEdit = false }) => {
  const [profile, setProfile] = React.useState(null);
  const [showEditModal, setShowEditModal] = React.useState(openEdit);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col w-full items-center justify-center p-4 align-top">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-xl p-10">
        <h2>Profilul Meu</h2>
        {profile && (
          <div>
            <p>
              <strong>Nume:</strong> {profile.full_name}
            </p>
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Rol:</strong>{' '}
              {profile.is_admin ? 'Administrator' : 'Utilizator'}
            </p>
            <p>
              <strong>Departament:</strong>{' '}
              {profile?.department || 'N/A'}
            </p>
          </div>
        )}
      </div>
      <div>
        <button
          className="btn btn-primary mt-4"
          onClick={() => navigate('/change-password')}
        >
          Schimbă Parolă
        </button>{' '}
        <button
          className="btn btn-danger mt-4 ml-2"
          onClick={() => setShowEditModal(true)}
        >
          Editează Profil
        </button>{' '}
        <button
          className="btn btn-secondary mt-4 ml-2"
          onClick={() => navigate('/inbox')}
        >
          Close
        </button>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg border shadow-xl p-10 mt-6">
        <h2>Istoric Activitate</h2>
        <p>Funcționalitate în curs de dezvoltare...</p>
      </div>

      <EditProfileModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSaved={() => fetchProfile()}
      />
      <Toaster />
    </div>
  );
};

export default Profile;
