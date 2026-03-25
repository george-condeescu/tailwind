import React from 'react';
import { FileText } from 'lucide-react';

export default // Main Content Component
function MainContent() {
  return (
    <main className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bine ai venit!
          </h2>
          <p className="text-gray-600">
            Acesta este conținutul principal al paginii tale responsive.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Utilizatori Activi',
              value: '1,234',
              change: '+12%',
              color: 'blue',
            },
            { label: 'Proiecte', value: '56', change: '+5%', color: 'green' },
            { label: 'Task-uri', value: '89', change: '-3%', color: 'yellow' },
            { label: 'Mesaje', value: '432', change: '+18%', color: 'purple' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </h3>
                <span
                  className={`text-sm font-semibold ${
                    stat.change.startsWith('+')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Activitate Recentă
            </h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      Document nou adăugat
                    </p>
                    <p className="text-xs text-gray-500">Acum {item} ore</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Task-uri Importante
            </h3>
            <div className="space-y-3">
              {[
                { task: 'Finalizare raport lunar', priority: 'high' },
                { task: 'Revizuire cod proiect', priority: 'medium' },
                { task: 'Meeting echipă', priority: 'low' },
                { task: 'Actualizare documentație', priority: 'medium' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="flex-1 text-gray-700">{item.task}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : item.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.priority === 'high'
                      ? 'Urgent'
                      : item.priority === 'medium'
                        ? 'Mediu'
                        : 'Scăzut'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
