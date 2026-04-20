import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Users,
  Building2,
  Handshake,
  Printer,
} from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

const rapoarte = [
  {
    titlu: 'Lista Registre',
    descriere: 'Vizualizează toate registrele înregistrate în sistem.',
    link: '/lista-registre',
    printType: 'registre',
    culoare: 'border-blue-500',
    text: 'text-blue-600',
    icon: <BookOpen size={28} />,
  },
  {
    titlu: 'Lista Documente',
    descriere: 'Consultă toate documentele din sistem cu filtre avansate.',
    link: '/lista-documente',
    printType: 'documente',
    culoare: 'border-green-500',
    text: 'text-green-600',
    icon: <FileText size={28} />,
  },
  {
    titlu: 'Lista Parteneri',
    descriere: 'Evidența partenerilor externi asociați documentelor.',
    link: '/admin/partners',
    printType: 'parteneri',
    culoare: 'border-yellow-500',
    text: 'text-yellow-600',
    icon: <Handshake size={28} />,
  },
  {
    titlu: 'Lista Utilizatori',
    descriere: 'Gestionarea conturilor de utilizatori din aplicație.',
    link: '/admin/users',
    printType: 'utilizatori',
    culoare: 'border-purple-500',
    text: 'text-purple-600',
    icon: <Users size={28} />,
    adminOnly: true,
  },
  {
    titlu: 'Lista Departamente',
    descriere: 'Structura organizatorică — departamente și unități.',
    link: '/admin/departments',
    printType: 'departamente',
    culoare: 'border-red-500',
    text: 'text-red-600',
    icon: <Building2 size={28} />,
    adminOnly: true,
  },
];

const fmt = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const printStyles = `
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 20px; }
  h2 { font-size: 16px; margin-bottom: 4px; }
  p.subtitle { color: #555; font-size: 11px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1d4ed8; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-yellow { background: #fef9c3; color: #713f12; }
  .badge-gray { background: #f3f4f6; color: #374151; }
`;

function flattenDepts(nodes, result = []) {
  for (const node of nodes) {
    result.push(node);
    if (node.children?.length) flattenDepts(node.children, result);
  }
  return result;
}

function buildPrintHtml(titlu, headings, rows) {
  const now = new Date().toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const thead = headings.map((h) => `<th>${h}</th>`).join('');
  const tbody = rows
    .map(
      (cells) =>
        `<tr>${cells.map((c) => `<td>${c ?? '-'}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${titlu}</title><style>${printStyles}</style></head><body>
    <h2>${titlu}</h2><p class="subtitle">Generat la: ${now} &nbsp;|&nbsp; ${rows.length} înregistrări</p>
    <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
    <script>window.onload=()=>{window.print();}</script></body></html>`;
}

const Raports = () => {
  const { user } = useAuth();

  const handlePrint = async (printType) => {
    try {
      let html = '';

      if (printType === 'registre') {
        const res = await api.get('/registru');
        const data = res.data.filter((r) => r.user_id === user.id);
        html = buildPrintHtml(
          'Lista Registre',
          [
            'Nr. Înreg.',
            'Obiectul',
            'Cod SSI',
            'Cod Angajament',
            'Status',
            'Data creare',
          ],
          data.map((r) => [
            r.nr_inreg,
            r.obiectul,
            r.cod_ssi,
            r.cod_angajament,
            r.status,
            fmt(r.createdAt),
          ]),
        );
      } else if (printType === 'documente') {
        const res = await api.get(`/documents/user/${user.id}/all`);
        const data = res.data;
        html = buildPrintHtml(
          'Lista Documente',
          [
            'Nr. Înreg./Rev.',
            'Data',
            'Partener',
            'Obiect',
            'Proveniență',
            'Utilizator curent',
            'Stare',
          ],
          data.map((d) => [
            `${d.nr_inreg}/${d.nr_revizie}`,
            fmt(d.data_creare),
            d.partener,
            d.obiectul,
            d.provenienta,
            d.utilizator_curent,
            d.citit ? 'Citit' : 'Necitit',
          ]),
        );
      } else if (printType === 'parteneri') {
        const res = await api.get('/partners?all=true');
        const data = res.data.partners;
        html = buildPrintHtml(
          'Lista Parteneri',
          [
            'ID',
            'Denumire',
            'CUI',
            'Reg. Com.',
            'Localitate',
            'Județ',
            'Telefon',
            'Email',
            'Contact',
          ],
          data.map((p) => [
            p.id,
            p.denumire,
            p.cui,
            p.reg_com,
            p.localitate,
            p.judet,
            p.telefon,
            p.email,
            p.contact,
          ]),
        );
      } else if (printType === 'utilizatori') {
        const res = await api.get('/auth/admin/users');
        const data = res.data.users;
        html = buildPrintHtml(
          'Lista Utilizatori',
          ['ID', 'Username', 'Nume Complet', 'Email', 'Activ', 'Administrator'],
          data.map((u) => [
            u.id,
            u.username,
            u.full_name,
            u.email,
            u.is_active ? 'Da' : 'Nu',
            u.is_admin ? 'Da' : 'Nu',
          ]),
        );
      } else if (printType === 'departamente') {
        const res = await api.get('/departments/subordonati/51/subtree');
        const flat = flattenDepts(res.data.data.children);
        html = buildPrintHtml(
          'Lista Departamente',
          ['ID', 'Denumire', 'Parent ID', 'Cod', 'Activ'],
          flat.map((d) => [
            d.id,
            d.name,
            d.parent_id,
            d.code,
            d.is_active ? 'Activ' : 'Inactiv',
          ]),
        );
      }

      if (!html) return;
      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(html);
      win.document.close();
      // document.write is intentional here — we're populating a blank popup window
    } catch (err) {
      console.error('Eroare la generarea raportului:', err);
      alert(
        'Nu s-a putut genera raportul: ' +
          (err.response?.data?.error || err.message),
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen p-4">
      <header className="w-full max-w-4xl bg-blue-700 text-white py-4 px-4 rounded-xl shadow-lg border-t-4 border-green-300 mb-10 text-center">
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
          Rapoarte
        </h3>
        <p className="text-lg opacity-90 mt-2">
          Accesează rapid listele și rapoartele disponibile în sistem.
        </p>
      </header>

      <main className="w-full max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rapoarte.filter((r) => !r.adminOnly || user?.is_admin || user?.role === 'manager').map((r) => (
            <Link
              key={r.link}
              to={r.link}
              className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${r.culoare} hover:shadow-xl transition-shadow flex flex-col gap-3`}
            >
              <div className={`${r.text}`}>{r.icon}</div>
              <h5 className="text-lg font-bold text-gray-800">{r.titlu}</h5>
              <p className="text-gray-600 text-sm flex-1">{r.descriere}</p>
              {r.printType && (
                <button
                  className={`${r.text} font-semibold text-sm flex items-center gap-1 hover:underline w-fit`}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrint(r.printType);
                  }}
                >
                  <Printer size={14} /> Tipărire PDF
                </button>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Raports;
