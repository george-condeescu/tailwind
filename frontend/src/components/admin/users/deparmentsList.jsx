import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DepartmentsList({
  show,
  onHide,
  handleChangeDepartment,
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/departments');
        if (response.status !== 200) {
          throw new Error('Failed to fetch departments');
        }

        const departments = response.data.data;

        setDepartments(departments);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchDepartments();
    }
  }, [show]);

  return (
    <Modal show={show} backdrop="static" onHide={onHide}>
      <Modal.Header
        closeButton
        style={{ backgroundColor: 'rgb(44,84,35)', color: 'white' }}
      >
        <Modal.Title>Departments List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul>
            {departments.map((dept) => (
              <li
                key={dept.id}
                className="border-b border-gray-300 hover:bg-gray-100 cursor-pointer p-2"
                onClick={() => handleChangeDepartment(dept.id)}
              >
                {dept.name}
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
