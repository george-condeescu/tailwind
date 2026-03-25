import React from 'react';

// Footer Component
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Despre Noi</h4>
            <p className="text-gray-300 text-sm">
              Consiliul Județean Teleorman este o instituție publică care
              gestionează activitățile administrative și legislative ale
              județului Teleorman.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Link-uri Rapide</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Acasă
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Servicii
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Produse
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Email: cjt@cjteleorman.ro</li>
              <li>Telefon: +40 247-311-201</li>
              <li>
                Adresă: Alexandria, str. Dunării, nr. 178, Teleorman, România
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>
            &copy; 2026 Consiliul Județean Teleorman. Toate drepturile
            rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
}
