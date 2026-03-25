import React, { useEffect, useState, lazy } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../../../api/axiosInstance';

const DepartmentList = lazy(() => import('./deparmentsList'));

const EditUser = ({ show, userId, onHide, onSaved }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal deparment list
  const [showDepartments, setShowDepartments] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  const handleChangeDepartment = (id) => {
    setSelectedDepartmentId(id);
    setShowDepartments(false);
  };

  const closeDepartments = () => {
    setShowDepartments(false);
    setSelectedDepartmentId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, dataset } = e.target;
    const parsedValue = dataset.type === 'number' ? Number(value) : value;
    setUser((prevUser) => ({ ...prevUser, [name]: parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/auth/admin/users/${userId}`, user).then((response) => {
        onSaved(response.data.user); // Apelează callback-ul onSaved cu datele actualizate ale utilizatorului
      });

      onHide(); // Închide modalul după salvare
    } catch (error) {
      setError('Error updating user data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔥 IMPORTANT: rulează DOAR când modalul se deschide
    if (!show || !userId) return;

    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        const response = await api(`/auth/admin/users/${userId}`);

        if (!cancelled) {
          setUser(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setError('Error fetching user data', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [userId, show]);

  useEffect(() => {
    if (!selectedDepartmentId) return;

    let cancelled = false;

    const fetchSelectedDepartment = async () => {
      try {
        const response = await api.get(`/departments/${selectedDepartmentId}`);

        // dacă backend-ul tău e de forma { message, data }
        const department = response.data.data ?? response.data;

        // if (cancelled) return;

        setUser((prevUser) => ({
          ...prevUser,
          department: department.name,
          org_unit_id: department.id, // presupunând că backend-ul tău așteaptă org_unit_id
        }));
      } catch (error) {
        console.error('Error fetching selected department:', error);
      }
    };

    fetchSelectedDepartment();

    return () => {
      cancelled = true;
    };
  }, [selectedDepartmentId]); // cand se schimbă departamentul selectat, adică când userul alege alt departament din listă

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header
        closeButton
        style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
      >
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && user && (
          <form onSubmit={handleSubmit}>
            <label>Username:</label>
            <input
              className="w-full mb-2 p-2 border rounded"
              type="text"
              name="username"
              value={user ? user.username : ''}
              onChange={handleInputChange}
            />
            <br />
            <label>Fullname:</label>
            <input
              className="w-full mb-2 p-2 border rounded"
              type="text"
              name="full_name"
              value={user ? user.full_name : ''}
              onChange={handleInputChange}
            />
            <br />
            <label>Email:</label>
            <input
              className="w-full mb-2 p-2 border rounded"
              type="email"
              name="email"
              value={user ? user.email : ''}
              onChange={handleInputChange}
            />
            <br />
            <label>Este admin:</label>
            <select
              className="w-full mb-2 p-2 border rounded"
              name="is_admin"
              data-type="number"
              value={user ? (user.is_admin ? 1 : 0) : 0}
              onChange={handleInputChange}
            >
              <option value={1}>Admin</option>
              <option value={0}>User</option>
            </select>
            <br />
            <label>Este activ:</label>
            <select
              className="w-full mb-2 p-2 border rounded"
              name="is_active"
              data-type="number"
              value={user ? (user.is_active ? 1 : 0) : 0}
              onChange={handleInputChange}
            >
              <option value={1}>Activ</option>
              <option value={0}>Inactiv</option>
            </select>
            <br />
            <label>Departament:</label>
            <div className="flex flex-row">
              <input
                className="w-full mb-2 p-1 border rounded"
                type="text"
                name="department"
                value={user ? user.department : ''}
                readOnly
                disabled
              />
              &nbsp;
              <button
                className="bg-green-700 text-white mb-2 ml-2 px-2 py-1 rounded"
                type="button"
                onClick={() => setShowDepartments(true)}
              >
                Schimbă
              </button>
              <DepartmentList
                show={showDepartments}
                onHide={closeDepartments}
                handleChangeDepartment={handleChangeDepartment}
              />
            </div>
            <div className="flex flex-row justify-end gap-2 p-2 bg-sky-200 text-yellow-700 rounded">
              <div>
                <button
                  className="bg-blue-700 text-white px-5 py-2 rounded"
                  type="submit"
                >
                  Save
                </button>
              </div>
              &nbsp;
              <div>
                <button
                  className="bg-red-700 text-white px-5 py-2 rounded"
                  type="button"
                  onClick={() => {
                    setUser(null);
                    onHide();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          className="bg-gray-700 text-white px-5 py-2 rounded"
          type="button"
          onClick={onHide}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUser;
