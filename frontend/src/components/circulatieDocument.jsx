import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

import { Check, X } from 'lucide-react';

export default function CirculatiaDocumentului() {
  const { id } = useParams();
  const { user } = useAuth();

  //Queries
  const query = useQuery({
    queryKey: ['circulatii', id],
    queryFn: async () => {
      const response = await api.get(`/circulatie/document/${id}`);
      return response.data;
    },
  });

  const { data, isLoading, error } = query;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading circulatii</div>;
  }

  return (
    <div className="flex flex-col w-full  rounded">
      <h5 className="text-blue-700!">Circulația Documentului: {id}</h5>
      <div className="flex flex-col mb-3 bg-sky-100 p-3 rounded w-full min-w-full">
        <button
          className="btn btn-secondary w-24"
          onClick={() => window.history.back()}
        >
          Înapoi
        </button>
        <div className="divider" />
        <div className="flex flex-row w-full mt-3 overflow-x-auto">
          <table className="table  table-striped table-bordered w-full! min-w-full ">
            <thead>
              <tr>
                <th className="bg-blue-900! text-white!">Data intrare</th>
                <th className="bg-blue-900! text-white!">Ora intrare</th>
                <th className="bg-blue-900! text-white!">Sursa</th>
                <th className="bg-blue-900! text-white!">Data ieșire</th>
                <th className="bg-blue-900! text-white!">Ora ieșire</th>
                <th className="bg-blue-900! text-white!">Destinația</th>
                <th className="bg-blue-900! text-white!">Mod rezolvare</th>
                <th className="bg-blue-900! text-white!">Observații</th>
                <th className="bg-blue-900! text-white!">Numar zile</th>
                <th className="bg-blue-900! text-white!">Citit</th>
              </tr>
            </thead>
            <tbody>
              {data.map((circulatie) => (
                <tr key={circulatie.id}>
                  <td>
                    {new Date(circulatie.data_intrare).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(circulatie.data_intrare).toLocaleTimeString()}
                  </td>
                  <td>{circulatie.from_user}</td>
                  <td>
                    {circulatie.data_iesire
                      ? new Date(circulatie.data_iesire).toLocaleDateString()
                      : ''}
                  </td>
                  <td>
                    {circulatie.data_iesire
                      ? new Date(circulatie.data_iesire).toLocaleTimeString()
                      : ''}
                  </td>
                  <td>{circulatie.to_user}</td>
                  <td>{circulatie.action}</td>
                  <td>{circulatie.note}</td>
                  <td>
                    {circulatie.data_iesire
                      ? Math.ceil(
                          (new Date(circulatie.data_iesire) -
                            new Date(circulatie.data_intrare)) /
                            (1000 * 60 * 60 * 24),
                        )
                      : ''}
                  </td>
                  <td className="text-center">
                    {circulatie.citit ? (
                      <span className="badge badge-success bg-green-500! text-center">
                        <Check size={16} />
                      </span>
                    ) : (
                      <span className="badge badge-warning bg-red-500! text-center">
                        <X size={16} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
