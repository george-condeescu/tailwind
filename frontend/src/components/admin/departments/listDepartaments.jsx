import React from 'react';
import { useEffect, useState, useMemo, lazy } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { PlusSquare } from 'lucide-react';
import { useDepartments } from '../../../hooks/useDepartment.js';

function TreeAccordion({ data, onDeleted, showEditDepartment }) {
  const roots = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);

  return (
    <>
      {roots.map((root) => (
        <TreeNode
          key={root.id}
          node={root}
          level={0}
          onDeleted={onDeleted}
          showEditDepartment={showEditDepartment}
        />
      ))}
    </>
  );
}

function TreeNode({ node, level, onDeleted, showEditDepartment }) {
  //open state local per node - pastreaza fiecare ramura independenta
  const [open, setOpen] = useState(false);
  return (
    <TreeRow
      node={node}
      level={level}
      isOpen={open}
      toggle={() => setOpen((v) => !v)}
      onDeleted={onDeleted}
      showEditDepartment={showEditDepartment}
    />
  );
}

const TreeRow = ({
  node,
  level,
  isOpen,
  toggle,
  onDeleted,
  showEditDepartment,
}) => {
  const { id, name, parent_id, code, is_active, children } = node;
  const hasChildren = children && children.length > 0;

  const { getDepartments } = useDepartments();

  const EditDepartmentModal = lazy(() => import('./editDepartment'));

  const levelColors = {
    0: 'bg-sky-100',
    1: 'bg-rose-100',
    2: 'bg-amber-100',
    3: 'bg-emerald-100',
    4: 'bg-red-100',
  };

  const handleEdit = () => {
    console.log('Edit', id);
    showEditDepartment(id);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Ștergi departamentul "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}`);
      await getDepartments();
      if (onDeleted) onDeleted();
    } catch (err) {
      alert(
        'Eroare la ștergere: ' + (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <>
      <tr
        className={`${levelColors[level]} border-b hover:bg-gray-50`}
        key={node.id}
      >
        <td
          className="px-2 py-2 whitespace-nowrap text-gray-900"
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
          onClick={hasChildren ? () => toggle(node.id) : undefined}
        >
          <span
            style={{
              width: 18,
              display: 'inline-flex',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            {hasChildren ? (isOpen ? '−' : '+') : '•'}
          </span>
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
          {id}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
          {name}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
          {parent_id || '-'}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">
          {code}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {is_active ? 'Activ' : 'Inactiv'}
          </span>
        </td>
        <td>
          <button
            className="inline-flex bg-blue-600 px-2 text-white hover:cursor-pointer font-bold"
            onClick={handleEdit}
          >
            Edit
          </button>
          &nbsp;
          <button
            className="inline-flex bg-red-600 px-2 text-white hover:cursor-pointer font-bold"
            onClick={handleDelete}
          >
            Delete
          </button>
        </td>
      </tr>
      {hasChildren && isOpen && (
        <>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onDeleted={onDeleted}
              showEditDepartment={showEditDepartment}
            />
          ))}
        </>
      )}
    </>
  );
};

export default function ListaDepartment() {
  const AddDepartmentModal = lazy(() => import('./addDepartment'));
  const EditDepartmentModal = lazy(() => import('./editDepartment.jsx'));

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [show, setShow] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Funcții pentru controlul stării
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setRefreshKey((k) => k + 1);
  };
  // const handleShow = () => setShow(true);

  const handleAdded = () => {
    setShow(false);
    setRefreshKey((k) => k + 1);
  };

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [success, setSuccess] = useState('');

  const showAddDepartment = () => {
    console.log('Add Department');
    setShow(true);
  };

  const showEditDepartment = (id) => {
    console.log('Edit Department');
    setEditId(id);
    setShowEditModal(true);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios(
          'http://localhost:5000/api/departments/subordonati/51/subtree',
        );

        if (response.status != 200)
          throw new Error('Failed to fetch departments');
        const { data } = await response.data;

        setDepartments(data.children);
        // setSuccess(true);
        setLoading(false);
      } catch (err) {
        setErrors(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [refreshKey]);

  return (
    <div className="flex flex-col p-1 items-center w-full">
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.map((err, i) => (
            <p key={i}>
              {err.field}: {err.message}
            </p>
          ))}
        </div>
      )}
      {loading ? (
        <div>
          <h1>LOADING ...</h1>
        </div>
      ) : (
        <>
          {departments && departments.length > 0 && (
            <div className="w-full px-25">
              <div className="flex justify-end mb-2 mt-3 gap-2">
                <span className="font-bold">LISTĂ DEPARTAMENTE</span>
                <Button variant="primary" onClick={showAddDepartment}>
                  <PlusSquare className="mr-1" size={16} />
                </Button>
              </div>
              <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                {/* Suspense este obligatoriu pentru lazy loading */}
                <React.Suspense fallback={<div>Se încarcă...</div>}>
                  {showEditModal && (
                    <EditDepartmentModal
                      id={editId}
                      show={showEditModal}
                      handleClose={handleCloseEditModal}
                    />
                  )}
                  {show && (
                    <AddDepartmentModal show={show} handleClose={handleAdded} />
                  )}
                </React.Suspense>
                <table className="w-full text-sm text-left rtl:text-right text-body">
                  <thead className="bg-blue-600 text-white uppercase text-sm tracking-wide">
                    <tr className="bg-neutral-primary border-b border-default">
                      <th className="px-2 py-2 font-semibold"></th>
                      <th className="px-2 py-2 font-semibold">ID</th>
                      <th className="px-2 py-2 font-semibold">Departament</th>
                      <th className="px-2 py-2 font-semibold">Parent ID</th>
                      <th className="px-2 py-2 font-semibold">Cod</th>
                      <th className="px-2 py-2 font-semibold">Activ</th>
                      <th className="px-2 py-2 font-semibold">Actiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments && (
                      <TreeAccordion
                        data={departments}
                        onDeleted={() => setRefreshKey((k) => k + 1)}
                        showEditDepartment={showEditDepartment}
                      />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
