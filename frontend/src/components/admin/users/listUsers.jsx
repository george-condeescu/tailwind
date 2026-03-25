import { useEffect, useState, lazy } from 'react';
import { Button } from 'react-bootstrap';
import api from '../../../api/axiosInstance';
import { UserPlus } from 'lucide-react';

const UserRow = lazy(() => import('./userRow'));
const EditUser = lazy(() => import('./editUser'));
const AddUserModal = lazy(() => import('./addUser'));

const PAGE_SIZE = 5;

export default function ListUsers({ refreshKey, onDeleteUser, onAddUser }) {
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshUsersKey, setRefreshUsersKey] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // modal edituser
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // modal adduser
  const [showAdd, setShowAdd] = useState(false);

  const handleUserAddedFromList = () => {
    console.log('User added, refreshing count...');
    setRefreshUsersKey((prevKey) => prevKey + 1);
    if (onAddUser) onAddUser();
  };

  const handleSaved = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );
    setShowEdit(false);
    setSelectedUserId(null);
  };

  const handleEdit = (id) => {
    setSelectedUserId(id);
    setShowEdit(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`/auth/admin/users/${id}`);

      if (response.status != 200) throw new Error('Failed to delete user');
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      if (onDeleteUser) onDeleteUser();
    } catch (error) {
      setErrors([{ message: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const closeEdit = () => {
    setShowEdit(false);
    setSelectedUserId(null);
  };

  const closeAdd = () => {
    setShowAdd(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api('/auth/admin/users');

        if (response.status != 200) throw new Error('Failed to fetch users');
        const data = await response.data.users;
        setUsers(data);
        setCurrentPage(1);
      } catch (error) {
        setErrors([{ message: error.message }]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [refreshKey, refreshUsersKey]);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="w-full">
      <div className="w-full">
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
            <div className="flex justify-end mb-2 mt-4 mr-4 gap-2 items-center">
              <h5 className="text-xl font-bold text-gray-800">
                Lista Utilizatori
              </h5>
              <Button
                variant="primary"
                onClick={() => {
                  console.log('Opening add user modal...');
                  setShowAdd(true);
                  console.log('showAdd state:', showAdd);
                }}
                className="ml-4 mr-4"
              >
                <UserPlus className="w-4 h-4 ml-2 mr-2" />
              </Button>
            </div>
            {users.length > 0 && (
              <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table className="w-full text-[16px] text-left rtl:text-right text-body">
                  <thead className="bg-blue-600 text-white uppercase text-[16px] tracking-wide">
                    <tr className="bg-neutral-primary border-b border-default">
                      <th className="px-2 py-2 font-semibold">ID</th>
                      <th className="px-2 py-2 font-semibold">Username</th>
                      <th className="px-2 py-2 font-semibold">Nume Complet</th>
                      <th className="px-2 py-2 font-semibold">Email</th>
                      <th className="px-2 py-2 font-semibold">Activ</th>
                      <th className="px-2 py-2 font-semibold">Administrator</th>
                      <th className="px-2 py-2 font-semibold">Actiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 py-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
                    >
                      &laquo;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded border text-sm ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
                    >
                      &raquo;
                    </button>
                  </div>
                )}
                {showEdit && selectedUserId && (
                  <EditUser
                    userId={selectedUserId}
                    onHide={closeEdit}
                    show={showEdit}
                    onSaved={handleSaved}
                  />
                )}
                {showAdd && (
                  <AddUserModal
                    showAdd={showAdd}
                    handleCloseAdd={closeAdd}
                    onSubmit={handleUserAddedFromList}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
