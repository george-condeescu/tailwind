import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDepartments } from '../hooks/useDepartment';
import { Link } from 'react-router-dom';
// import ShaderBackground from './ui/shader-background';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { getDepartmentByUserId } = useDepartments();
  const [department, setDepartment] = React.useState(null);

  React.useEffect(() => {
    const fetchDepartment = async () => {
      if (user) {
        try {
          const dept = await getDepartmentByUserId(user.id);
          // console.log('Departamentul utilizatorului:', dept);
          setDepartment(dept?.data ?? null);
        } catch (error) {
          console.error('Eroare la obținerea departamentului:', error);
        }
      }
    };

    fetchDepartment();
  }, [user, getDepartmentByUserId]);

  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen p-5 relative">
      {/* <ShaderBackground /> */}
      {/* Hero Section */}
      <header className="w-250 bg-blue-700 text-white py-5 px-4 rounded-xl shadow-lg border-t-5 border-green-300 hover:shadow-xl transition-shadow">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl font-bold mb-3 mt-1 tracking-tight">
            REGISTRATURĂ ALOP
          </h3>
          <p className="text-xl md:text-xl opacity-90 mb-8">
            Gestionarea eficientă a documentelor și fluxurilor de lucru.
          </p>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Autentificare
            </Link>
          ) : (
            <>
              <p className="text-lg font-medium">
                Bine ai venit,{' '}
                <span className="underline">
                  {user?.full_name || 'Utilizator'}
                  {user?.is_admin ? ' - Admin' : ''}
                </span>
              </p>
              <p className="text-lg font-medium">
                Departament:{' '}
                <span className="underline">{department?.name || 'N/A'}</span>
              </p>
            </>
          )}
        </div>
      </header>

      {/* Main Content - Grid Responsiv */}
      <main className="w-full max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Acțiuni Rapide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Intrări */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">Documente Intrare</h3>
            <p className="text-gray-600 mb-4">
              Înregistrează documentele primite prin poștă sau curier.
            </p>
            <button className="text-green-600 font-semibold hover:underline">
              <Link to="/inbox">Vezi detalii →</Link>
            </button>
          </div>

          {/* Card 2: Ieșiri */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">Documente Ieșire</h3>
            <p className="text-gray-600 mb-4">
              Evidența documentelor trimise către terți sau instituții.
            </p>
            <button className="text-red-600 font-semibold hover:underline">
              <Link to="/outbox">Vezi detalii →</Link>
            </button>
          </div>

          {/* Card 3: Arhivă */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">Căutare Arhivă</h3>
            <p className="text-gray-600 mb-4">
              Găsește rapid documente înregistrate folosind filtre avansate.
            </p>
            <button className="text-blue-600 font-semibold hover:underline">
              <Link to="/archive">Accesează Arhiva →</Link>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
