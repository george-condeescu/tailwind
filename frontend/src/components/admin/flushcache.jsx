import { useState } from 'react';
import { AlertTriangle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function FlushCache() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error'

  const handleFlush = async () => {
    setLoading(true);
    setShowConfirm(false);
    try {
      await api.post('/admin/flush-cache');
      setResult('success');
      toast.success('Cache-ul a fost golit cu succes.');
    } catch (err) {
      console.log('Eroare la golirea cache-ului:', err);
      setResult('error');
      const msg =
        err.response?.data?.message || 'Eroare la golirea cache-ului.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-red-100 rounded-full p-4 mb-4">
            <Trash2 size={40} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Golire Cache Completă
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Acțiune administrativă ireversibilă
          </p>
        </div>

        {/* Warning box */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex gap-3 mb-6">
          <AlertTriangle
            size={22}
            className="text-yellow-600 shrink-0 mt-0.5"
          />
          <div className="text-sm text-yellow-800 space-y-1">
            <p className="font-semibold">Atenție! Această acțiune va:</p>
            <ul className="list-disc list-inside space-y-0.5 text-yellow-700">
              <li>Șterge complet toate datele din cache</li>
              <li>Forța reîncărcarea tuturor datelor din baza de date</li>
              <li>Putea cauza o încetinire temporară a aplicației</li>
              <li>Afecta toți utilizatorii conectați în acel moment</li>
            </ul>
          </div>
        </div>

        {/* Result feedback */}
        {result === 'success' && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex gap-3 mb-6">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">
              Cache-ul a fost golit cu succes.
            </p>
          </div>
        )}
        {result === 'error' && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex gap-3 mb-6">
            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">
              Operațiunea a eșuat. Verificați consola pentru detalii.
            </p>
          </div>
        )}

        {/* Confirm modal overlay */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-red-500" />
                <h2 className="text-lg font-bold text-gray-800">Confirmare</h2>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Ești sigur că vrei să golești complet cache-ul aplicației?
                Această acțiune nu poate fi anulată.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleFlush}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Da, golește cache-ul
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Se golește cache-ul...
            </>
          ) : (
            <>
              <Trash2 size={18} />
              Golește Cache Complet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
