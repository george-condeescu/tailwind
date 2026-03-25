export default function UserRow({ user, onEdit, onDelete }) {
  // const { user } = currentuser;
  return (
    <tr
      className="bg-sky-100 border-b-2 border-blue-500 hover:bg-gray-50"
      key={user.id}
    >
      <td className="px-2 py-2 whitespace-nowrap text-[16px] text-blue-900 ">
        {user.id}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900">
        {user.username}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900">
        {user.full_name}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900">
        {user.email}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900">
        {user.is_active ? 'Da' : 'Nu'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900">
        {user.is_admin ? 'Da' : 'Nu'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900">
        <button
          className="inline-flex bg-blue-600 px-2 text-white hover:cursor-pointer font-bold"
          onClick={() => onEdit(user.id)}
        >
          Edit
        </button>
        &nbsp;
        <button className="inline-flex bg-red-600 px-2 text-white hover:cursor-pointer font-bold"
        onClick={() => onDelete(user.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
