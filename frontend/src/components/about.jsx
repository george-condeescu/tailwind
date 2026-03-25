import { Building2, Users, Target, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Angajați', value: '150+' },
  { label: 'Departamente', value: '18' },
  { label: 'Proiecte active', value: '34' },
  { label: 'Ani de activitate', value: '30+' },
];

const values = [
  {
    icon: <Building2 size={28} className="text-blue-600" />,
    title: 'Administrație publică',
    desc: 'Gestionăm eficient resursele județului pentru binele comunității.',
  },
  {
    icon: <Users size={28} className="text-blue-600" />,
    title: 'Echipă dedicată',
    desc: 'Profesioniști angajați în îmbunătățirea vieții cetățenilor zilnic.',
  },
  {
    icon: <Target size={28} className="text-blue-600" />,
    title: 'Misiune clară',
    desc: 'Servicii publice de calitate și transparență în toate activitățile.',
  },
  {
    icon: <TrendingUp size={28} className="text-blue-600" />,
    title: 'Dezvoltare durabilă',
    desc: 'Investiții strategice pentru creșterea economică a județului.',
  },
];

export default function About() {
  return (
    <div className="flex-1 w-full bg-linear-to-br from-blue-50 to-slate-100 py-12 px-4">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-800 mb-3">
          Consiliul Județean Teleorman
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Instituția publică responsabilă pentru administrarea și dezvoltarea
          județului Teleorman — în slujba comunității din 1994.
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <p className="text-3xl font-bold text-blue-700">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Despre noi</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Consiliul Județean Teleorman este instituția publică responsabilă
          pentru administrarea și dezvoltarea județului Teleorman. Misiunea
          noastră este de a asigura servicii publice de calitate, de a promova
          dezvoltarea economică și socială a județului și de a sprijini
          comunitățile locale în atingerea obiectivelor lor.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Echipa noastră este formată din profesioniști dedicați, care lucrează
          împreună pentru a îmbunătăți viața cetățenilor și pentru a crea un
          mediu propice pentru investiții și dezvoltare durabilă.
        </p>
      </div>

      {/* Values */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {values.map((v) => (
          <div
            key={v.title}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div className="bg-blue-50 rounded-full p-3 mb-3">{v.icon}</div>
            <h3 className="font-semibold text-gray-700 mb-1">{v.title}</h3>
            <p className="text-gray-500 text-sm">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
