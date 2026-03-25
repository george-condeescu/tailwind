import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  const cards = [
    {
      icon: <MapPin size={28} className="text-blue-600" />,
      title: 'Adresă',
      lines: ['Strada Dunării, Nr. 178', 'Teleorman, România'],
    },
    {
      icon: <Phone size={28} className="text-blue-600" />,
      title: 'Telefon',
      lines: ['+40 123 456 789'],
    },
    {
      icon: <Mail size={28} className="text-blue-600" />,
      title: 'Email',
      lines: ['cjt@cjteleorman.ro'],
      link: 'mailto:cjt@cjteleorman.ro',
    },
    {
      icon: <Clock size={28} className="text-blue-600" />,
      title: 'Program',
      lines: ['Luni – Vineri', '08:00 – 16:30'],
    },
  ];

  return (
    <div className="flex-1 w-full bg-linear-to-br from-blue-50 to-slate-100 py-12 px-4">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-800 mb-3">
          Contactați-ne
        </h1>
        <p className="text-gray-500 text-lg">
          Suntem aici să vă ajutăm. Trimiteți-ne un mesaj sau vizitați-ne la sediu.
        </p>
      </div>

      {/* Info cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div className="bg-blue-50 rounded-full p-3 mb-3">{card.icon}</div>
            <h3 className="font-semibold text-gray-700 mb-1">{card.title}</h3>
            {card.lines.map((line, i) =>
              card.link && i === 0 ? (
                <a
                  key={i}
                  href={card.link}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {line}
                </a>
              ) : (
                <p key={i} className="text-gray-500 text-sm">
                  {line}
                </p>
              ),
            )}
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Send size={22} className="text-blue-600" />
          Trimite un mesaj
        </h2>

        {sent ? (
          <div className="flex flex-col items-center py-10 gap-3 text-green-600">
            <CheckCircle size={48} />
            <p className="text-lg font-semibold">Mesaj trimis cu succes!</p>
            <p className="text-gray-500 text-sm">Vă vom contacta în cel mai scurt timp.</p>
            <button
              className="mt-4 text-sm text-blue-600 hover:underline"
              onClick={() => setSent(false)}
            >
              Trimite alt mesaj
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ion Popescu"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@exemplu.ro"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mesaj
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Scrieți mesajul dvs. aici..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <button
              type="submit"
              className="self-end flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              <Send size={16} />
              Trimite
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
