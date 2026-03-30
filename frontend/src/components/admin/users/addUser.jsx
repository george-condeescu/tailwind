import React, { useEffect, useState, useMemo } from 'react';
import { Button, Modal } from 'react-bootstrap';
import api from '../../../api/axiosInstance';
import { ToastBar } from 'react-hot-toast';

const AddUserModal = ({ showAdd, handleCloseAdd, onSubmit }) => {
  const initialForm = {
    email: '',
    password: '',
    confirmpassword: '',
    username: '',
    full_name: '',
    is_active: 1,
    is_admin: 0,
    start_date: '',
    end_date: '',
    org_unit_id: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const handleClose = () => {
    setFormData(initialForm);
    setSelectedParentId('');
    setSelectedChildId('');
    setSelectedCompartimentId('');
    handleCloseAdd();
  };

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [items, setitems] = useState([]); //toate departamentele
  const [selectedParentId, setSelectedParentId] = useState(''); //directiile
  const [selectedChildId, setSelectedChildId] = useState(''); //servicii subordonate directiilor
  const [selectedCompartimentId, setSelectedCompartimentId] = useState(''); //compartimente subordonate serviciilor

  const directii = useMemo(
    () => items.filter((x) => x.parent_id === 7),
    [items],
  );
  const servicii = useMemo(
    () => items.filter((x) => x.parent_id === Number(selectedParentId)),
    [items, selectedParentId],
  );
  const compartimente = useMemo(
    () => items.filter((x) => x.parent_id === Number(selectedChildId)),
    [items, selectedChildId],
  );

  useEffect(() => {
    const fecthDepartments = async () => {
      try {
        const response = await api('/departments/');
        if (response.status != 200)
          throw new Error('Failed to fetch departments');

        setitems(response.data.data);
      } catch (error) {
        console.log(error);
        setErrors([].push(error));
      } finally {
        setLoading(false);
      }
    };
    fecthDepartments();
  }, []);

  const handleChangeParent = (e) => {
    const value = e.target.value;
    setSelectedParentId(value);
    setSelectedChildId('');
    setSelectedCompartimentId('');
    setFormData((prev) => ({
      ...prev,
      org_unit_id: value && value !== '0' ? Number(value) : '',
    }));
  };

  const handleChangeChild = (e) => {
    const value = e.target.value;
    setSelectedChildId(value);
    setSelectedCompartimentId('');
    if (value && value !== '0') {
      setFormData((prev) => ({ ...prev, org_unit_id: Number(value) }));
    } else {
      setFormData((prev) => ({
        ...prev,
        org_unit_id: selectedParentId ? Number(selectedParentId) : '',
      }));
    }
  };

  const handleChangeCompartiment = (e) => {
    const value = e.target.value;
    setSelectedCompartimentId(value);
    if (value && value !== '0') {
      setFormData((prev) => ({ ...prev, org_unit_id: Number(value) }));
    } else {
      setFormData((prev) => ({
        ...prev,
        org_unit_id: selectedChildId ? Number(selectedChildId) : '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['is_active', 'is_admin', 'org_unit_id'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    if (formData.password !== formData.confirmpassword)
      throw new Error('Parolele nu sunt identice.');
    if (formData.start_date === '')
      formData.start_date = new Date().toISOString().split('T')[0]; //setez data curenta daca nu a fost selectata
    if (formData.end_date === '') formData.end_date = null; //setez end_date null daca nu a fost selectata
    if (
      formData.end_date &&
      formData.start_date &&
      formData.end_date < formData.start_date
    )
      throw new Error(
        'Data de sfârșit nu poate fi mai mică decât data de început.',
      );

    try {
      setLoading(true);
      const result = await api.post('/auth/register', formData);
      console.log('User created successfully:', result.data);
      setSuccess(true);
      onSubmit(); // Notifică componenta părinte că un utilizator a fost adăugat
      handleClose();
    } catch (err) {
      setErrors(err || [].push('Eroare la crearea utilizatorului'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1">
      <Modal show={showAdd} onHide={handleCloseAdd} backdrop="static" size="lg">
        <Modal.Header
          closeButton
          style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
        >
          <Modal.Title>Adaugă utilizator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Utilizator adăugat cu succes!
            </div>
          )}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              <p>{JSON.stringify(errors)}</p>
              {errors.map((err, i) => (
                <p key={i}>
                  {err.field}: {err.message}
                </p>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              type="text"
              name="full_name"
              placeholder="Full name "
              value={formData.fullname}
              onChange={handleChange}
              required
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Parola"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mb-2 p-2 border rounded"
            />

            <input
              type="password"
              name="confirmpassword"
              placeholder="Confirma parola"
              value={formData.confirmpassword}
              onChange={handleChange}
              required
              className="w-full mb-2 p-2 border rounded"
            />

            <select
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            >
              <option key="0" value="0">
                Inactiv
              </option>
              <option key="1" value="1">
                Activ
              </option>
            </select>

            <select
              name="is_admin"
              value={formData.is_admin}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            >
              <option key="0" value="0">
                User
              </option>
              <option key="1" value="1">
                Administrator
              </option>
            </select>

            <div className="flex flex-col gap-3 p-2 mb-2  bg-sky-900 text-white rounded">
              <div className="flex flex-row justify-around gap-2">
                <div>
                  <span className="mt-0 font-semibold">Data start:</span>{' '}
                  <input
                    type="date"
                    name="start_date"
                    onChange={handleChange}
                  />
                </div>{' '}
                <div>
                  <span className="mt-0 font-semibold">Data end:</span>{' '}
                  <input type="date" name="end_date" onChange={handleChange} />
                </div>
              </div>
              <span className="mt-0 font-semibold">Direcția:</span>{' '}
              <select
                name="directia"
                value={formData.directia}
                onChange={handleChangeParent}
                className="p-2 border rounded"
              >
                <option key={0} className="p-2" value="0">
                  --alege--
                </option>
                {directii.map((parent) => (
                  <option value={parent.id} key={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
              <span className="font-semibold">Serviciul:</span>{' '}
              <select
                name="serviciu"
                value={selectedChildId}
                onChange={handleChangeChild}
                disabled={!selectedParentId || selectedParentId === '0'}
                className="mb-1 p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="0">--alege--</option>
                {servicii.map((serviciu) => (
                  <option value={serviciu.id} key={serviciu.id}>
                    {serviciu.name}
                  </option>
                ))}
              </select>
              <span className="font-semibold">Compartimentul:</span>{' '}
              <select
                name="compartiment"
                value={selectedCompartimentId}
                onChange={handleChangeCompartiment}
                disabled={!selectedChildId || selectedChildId === '0'}
                className="mb-1 p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="0">--alege--</option>
                {compartimente.map((compartiment) => (
                  <option value={compartiment.id} key={compartiment.id}>
                    {compartiment.name}
                  </option>
                ))}
              </select>
            </div>
            <hr />
            <div className="flex gap-3 justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Se incarc...' : 'Adaugă'}
              </button>
              <Button variant="secondary" onClick={handleClose}>
                Anulează
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddUserModal;
