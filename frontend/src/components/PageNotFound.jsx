import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className=" bg-slate-100 min-h-screen w-full flex items-center justify-center px-10 py-10 sm:py-32 lg:px-8 pt-[100px]">
      <div className="text-center">
        {/* Ilustrație/Iconiță */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <FileQuestion className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <p className="text-base font-semibold text-blue-600 text-xl">404</p>
        <h3 className="mt-4 font-bold tracking-tight text-gray-900 sm:text-5xl">
          Pagina nu a fost găsită
        </h3>


        <div className="mt-10 flex items-center justify-center gap-x-6">
          {/* Buton Înapoi */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </button>

          {/* Buton Acasă */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Acasă
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;