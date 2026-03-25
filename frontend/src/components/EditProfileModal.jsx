import React, { useState, useEffect, lazy } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import api from '../api/axiosInstance';

const DepartmentList = lazy(() =>
  import('./admin/users/deparmentsList'),
);

const EditProfileModal = ({ show, onHide, onSaved }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showDepartments, setShowDepartments] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  useEffect(() => {
    if (!show) return;

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/auth/profile');
        if (!cancelled) {
          setProfile(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Eroare la încărcarea profilului.');
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [show]);

  useEffect(() => {
    if (!selectedDepartmentId) return;

    let cancelled = false;

    const fetchDepartment = async () => {
      try {
        const response = await api.get(
          `/departments/${selectedDepartmentId}`,
        );
        const department = response.data.data ?? response.data;
        if (!cancelled) {
          setProfile((prev) => ({
            ...prev,
            department: department.name,
            org_unit_id: department.id,
          }));
        }
      } catch (err) {
        console.error('Eroare la încărcarea departamentului:', err);
      }
    };

    fetchDepartment();
    return () => { cancelled = true; };
  }, [selectedDepartmentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeDepartment = (id) => {
    setSelectedDepartmentId(id);
    setShowDepartments(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/auth/profile', {
        full_name: profile.full_name,
        username: profile.username,
        email: profile.email,
        org_unit_id: profile.org_unit_id,
      });
      toast.success('Profil actualizat cu succes!');
      if (onSaved) onSaved(response.data);
      onHide();
    } catch (err) {
      const message =
        err.response?.data?.message || 'Eroare la salvarea profilului.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setProfile(null);
    setSelectedDepartmentId(null);
    setError(null);
    onHide();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header
          closeButton
          style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
        >
          <Modal.Title>Editează Profil</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading && (
            <p className="text-center text-gray-500">Se încarcă...</p>
          )}
          {error && (
            <div className="mb-3 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {!loading && !error && profile && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nume complet</label>
                <input
                  className="form-control"
                  type="text"
                  name="full_name"
                  value={profile.full_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  type="text"
                  name="username"
                  value={profile.username || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Departament</label>
                <div className="flex flex-row gap-2">
                  <input
                    className="form-control"
                    type="text"
                    value={profile.department || 'N/A'}
                    readOnly
                    disabled
                  />
                  <button
                    type="button"
                    className="btn btn-success text-nowrap"
                    onClick={() => setShowDepartments(true)}
                  >
                    Schimbă
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Anulează
                </button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      <DepartmentList
        show={showDepartments}
        onHide={() => setShowDepartments(false)}
        handleChangeDepartment={handleChangeDepartment}
      />
    </>
  );
};

export default EditProfileModal;
