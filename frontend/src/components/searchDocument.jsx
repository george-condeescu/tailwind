import { useState } from 'react';

export default function SearchDocument({ onSearch, onReset }) {
  const [nrInreg, setNrInreg] = useState('');
  const [data_start, setDataStart] = useState('');
  const [data_end, setDataEnd] = useState('');
  const [partener, setPartener] = useState('');
  const [obiectul, setObiectul] = useState('');
  const [cod_ssi, setCodSsi] = useState('');
  const [cod_angajament, setCodAngajament] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');

  const handleSearch = () => {
    onSearch({ nrInreg, data_start, data_end, partener, from, status });
  };

  const handleReset = () => {
    setNrInreg('');
    setDataStart('');
    setDataEnd('');
    setPartener('');
    setObiectul('');
    setCodSsi('');
    setCodAngajament('');
    setStatus('');
    setFrom('');
    onReset();
  };

  return (
    <div className="p-2 bg-sky-100">
      <div className="flex flex-row items-center mb-2">
        <label htmlFor="nr_inreg" className="mr-2 font-medium text-gray-700">
          Nr. Inregistrare:
        </label>
        <input
          type="text"
          id="nr_inreg"
          name="nr_inreg"
          value={nrInreg}
          onChange={(e) => setNrInreg(e.target.value)}
          placeholder="Nr. inregistrare ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label htmlFor="data" className="mr-2 ml-4 font-medium text-gray-700">
          Din data:
        </label>
        <input
          type="date"
          id="data_start"
          name="data_start"
          value={data_start}
          onChange={(e) => setDataStart(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label
          htmlFor="data_end"
          className="mr-2 ml-4 font-medium text-gray-700"
        >
          Pana la data:
        </label>
        <input
          type="date"
          id="data_end"
          name="data_end"
          value={data_end}
          onChange={(e) => setDataEnd(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex flex-row items-center mb-2">
        <label htmlFor="partener" className="mr-2 font-medium text-gray-700">
          Partener:
        </label>
        <input
          type="text"
          id="partener"
          name="partener"
          value={partener}
          onChange={(e) => setPartener(e.target.value)}
          placeholder="Partener ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label
          htmlFor="obiectul"
          className="mr-2 ml-4 font-medium text-gray-700"
        >
          Obiectul:
        </label>
        <input
          type="text"
          id="obiectul"
          name="obiectul"
          value={obiectul}
          onChange={(e) => setObiectul(e.target.value)}
          placeholder="Obiectul ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex flex-row items-center mb-2">
        <label htmlFor="cod_ssi" className="mr-2 font-medium text-gray-700">
          CodSSI:
        </label>
        <input
          type="text"
          id="cod_ssi"
          name="cod_ssi"
          value={cod_ssi}
          onChange={(e) => setCodSsi(e.target.value)}
          placeholder="Cod SSI ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label
          htmlFor="cod_angajament"
          className="mr-2 ml-4 font-medium text-gray-700"
        >
          Cod Angajament:
        </label>
        <input
          type="text"
          id="cod_angajament"
          name="cod_angajament"
          value={cod_angajament}
          onChange={(e) => setCodAngajament(e.target.value)}
          placeholder="Cod angajament ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex flex-row items-center mb-2">
        <label htmlFor="status" className="mr-2 font-medium text-gray-700">
          Status:
        </label>
        <input
          type="text"
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Status ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label htmlFor="from" className="mr-2 ml-4 font-medium text-gray-700">
          From:
        </label>
        <input
          type="text"
          id="from"
          name="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex flex-row justify-end gap-2">
        <button
          onClick={handleReset}
          className="px-6 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
        >
          Resetează
        </button>
        <button
          onClick={handleSearch}
          className="px-10 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Caută
        </button>
      </div>
    </div>
  );
}
