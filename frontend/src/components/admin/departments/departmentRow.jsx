import React, {useState} from 'react';

const DepartmentRow = ({ department, level, isOpen, toggle }) => {
  const { name, type, parent_id, code, is_active, children } = department;
  const hasChildren = children && children.length > 0;
  const [open, setOpen]=useState(false);

  return (
    <>
    <tr className="border-b hover:bg-gray-50" key={department.id}>
        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900"
            style={{cursor: hasChildren ? 'pointer' : 'default',}} 
            onClick={hasChildren ? () => toggle(department.id) : undefined}>
            <span
                style={{ width: 18, display: 'inline-flex', justifyContent: 'center', }}
            >
                {hasChildren ? (isOpen ? '−' : '+') : '•'}
            </span>
        </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
        {name}
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
        {type}
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
        {parent_id || '-'}
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
        {code}
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <button
            className="inline-flex bg-blue-600 px-3 text-white hover:cursor-pointer font-bold"
            >Edit</button>&nbsp;
        <button
            className="inline-flex bg-red-600 px-3 text-white hover:cursor-pointer font-bold"
            >Delete</button>
        
      </td>
    </tr>
    {hasChildren && isOpen && (
        <div>
          {children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
      </>
  );
};

export default DepartmentRow;
