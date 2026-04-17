import React, { useState, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, File } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { Modal, Form } from 'react-bootstrap';
import { useQuery, useQueryClient } from '@tanstack/react-query';

//context
import { useAuth } from '../hooks/useAuth';
import { useDepartments } from '../hooks/useDepartment';
import { usePartner } from '../hooks/usePartner';
import api from '../api/axiosInstance';

//validare
import { documentCreateSchema } from '../validations/document.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function AdaugaDocumentIntern() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const AddPartnerModal = lazy(() => import('./admin/partner/addPartner'));

  const queryClient = useQueryClient();
  const { getDepartmentByUserId, getUserDirectie } = useDepartments();
  const { getAllPartners } = usePartner();

  const [showModal, setShowModal] = useState(true);
  const [partnerInput, setPartnerInput] = useState(''); // State pentru a controla afișarea modalului

  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false); // State pentru a controla afișarea modalului de adăugare partener

  const initialForm = {
    observatii: '',
    user_id: user.id,
    partener_id: '',
    obiectul: '',
    cod_ssi: '',
    cod_angajament: '',
    status: 'DRAFT',
  };

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(documentCreateSchema),
    defaultValues: initialForm,
    mode: 'onChange', // validare cand user da click in afara camp sau incearca sa submit form, nu in timp ce scrie
  });

  // Folosim useQuery pentru a obține departamentul utilizatorului curent
  const {
    data: userDepartmentData,
    isLoading: userDepartmentLoading,
    error: userDepartmentError,
  } = useQuery({
    queryKey: ['userDepartment', user.id],
    queryFn: () => getDepartmentByUserId(user.id),
  });

  // Folosim useQuery pentru a obține direcția utilizatorului curent
  const queryDirectie = useQuery({
    queryKey: ['userDirectie', user.id],
    queryFn: () => getUserDirectie(user.id),
  });

  const {
    data: userDirectieData,
    isLoading: userDirectieLoading,
    error: userDirectieError,
  } = queryDirectie;

  // Folosim useQuery pentru a obține partenerii
  const {
    data: partners,
    isLoading: partnersLoading,
    error: partnersError,
  } = useQuery({
    queryKey: ['partners', 'all'],
    queryFn: getAllPartners,
  });

  if (userDepartmentLoading || userDirectieLoading || partnersLoading) {
    return <p>Loading...</p>;
  }

  if (userDepartmentError) {
    return (
      <p className="text-red-500">
        Eroare la încărcarea departamentului: {userDepartmentError}
      </p>
    );
  }

  if (userDirectieError) {
    return (
      <p className="text-red-500">
        Eroare la încărcarea direcției: {userDirectieError}
      </p>
    );
  }

  if (partnersError) {
    return (
      <p className="text-red-500">
        Eroare la încărcarea partenerilor: {partnersError}
      </p>
    );
  }

  const handleClose = () => {
    setShowModal(false);
    navigate(-1);
  };

  const onSubmit = async (data) => {
    const validatedData = documentCreateSchema.parse(data);
    try {
      //Obtine ultimul nr_inreg și generează noul nr_inreg
      // console.log('Obțin ultimul nr_inreg pentru a genera noul nr_inreg');
      const year = new Date().getFullYear();
      const departament = userDirectieData?.data?.code || 'UNDEFINED'; // Folosim un cod default dacă directia.code nu este disponibil
      // const nr_inreg = await api.post('/nrinreg', { departament, year });
      // const newNrInreg = nr_inreg.data.nr_inreg;
      // setValue('nr_inreg', newNrInreg); // Setăm noul nr_inreg în formData și în react-hook-form
      // console.log('Noul nr_inreg generat:', newNrInreg);

      // Call API to create document with validatedData
      await api.post('/registru', {
        departament,
        year,
        observatii: validatedData.observatii,
        user_id: validatedData.user_id,
        partener_id: validatedData.partener_id,
        obiectul: validatedData.obiectul,
        cod_ssi: validatedData.cod_ssi,
        cod_angajament: validatedData.cod_angajament,
        status: validatedData.status,
      });

      toast.success('Registru adăugat cu succes!');
      queryClient.invalidateQueries({ queryKey: ['documents', user.id] });
      setShowModal(false); // Închidem modalul după ce registrul a fost adăugat cu succes
      navigate('/inbox'); // Redirecționăm utilizatorul către pagina de documente interne
    } catch (error) {
      console.error('Eroare la adăugarea registrului:', error);
      toast.error('Eroare la adăugarea registrului.');
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Adauga Document Intern</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-blue-700 font-bold">
                {userDirectieData?.data?.name}/{userDepartmentData?.data?.name}
              </span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Observatii
                </label>
                <textarea
                  id="observatii"
                  name="observatii"
                  placeholder="Observatii"
                  className="w-full border rounded px-3 py-2"
                  {...register('observatii')}
                />
                {errors.observatii && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.observatii.message}
                  </p>
                )}
              </div>
              <>
                {partnersLoading ? (
                  <p>Loading partners...</p>
                ) : partnersError ? (
                  <p className="text-red-500 text-sm mt-1">
                    Eroare la încărcarea partenerilor
                  </p>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Partener
                    </label>
                    <div className="flex flex-row items-center gap-2">
                      {/* <select
                        name="partener_id"
                        id="partener_id"
                        className="w-full border rounded px-3 py-2"
                        {...register('partener_id')}
                      >
                        <option value="" disabled>
                          -- selectează partenerul --
                        </option>
                        {partners.partners?.map((partner) => (
                          <option key={partner.id} value={partner.id}>
                            {partner.denumire}
                          </option>
                        ))}
                      </select> */}
                      <input
                        id="partner_search"
                        value={partnerInput}
                        onChange={(e) => {
                          const text = e.target.value;
                          setPartnerInput(text);
                          const match = partners.partners.find(
                            (p) => p.denumire === text,
                          );
                          setValue('partener_id', match ? match.id : null);
                        }}
                        list="partner-list"
                        placeholder="Alege partenerul..."
                        className="w-full border rounded px-3 py-2"
                      />
                      <input type="hidden" {...register('partener_id')} />

                      <datalist id="partner-list">
                        {partners.partners.map((opt) => (
                          <option key={opt.id} value={opt.denumire} />
                        ))}
                      </datalist>
                      <button
                        type="button"
                        className="mt-2 bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                      >
                        <div
                          className="flex flex-row items-center gap-1"
                          onClick={() => setShowAddPartnerModal(true)}
                        >
                          <Plus size={16} />
                          Add
                        </div>
                      </button>
                    </div>

                    {errors.partener_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.partener_id.message}
                      </p>
                    )}
                  </div>
                )}
              </>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Obiectul
                </label>
                <textarea
                  name="obiectul"
                  id="obiectul"
                  className="w-full border rounded px-3 py-2"
                  {...register('obiectul')}
                />
                {errors.obiectul && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.obiectul.message}
                  </p>
                )}
              </div>
              <div className="flex flex-row items-center gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cod SSI
                  </label>
                  <input
                    type="text"
                    name="cod_ssi"
                    id="cod_ssi"
                    className="w-full border rounded px-3 py-2"
                    {...register('cod_ssi')}
                  />
                  {errors.cod_ssi && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cod_ssi.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cod Angajament
                  </label>
                  <input
                    type="text"
                    name="cod_angajament"
                    id="cod_angajament"
                    className="w-full border rounded px-3 py-2"
                    {...register('cod_angajament')}
                  />
                  {errors.cod_angajament && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cod_angajament.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                // onClick={() => console.log('FormData la submit:')}
              >
                <Plus size={20} /> Adauga
              </button>
            </form>
          </>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="bg-secondary text-white py-2 px-4 rounded hover:bg-secondary-dark"
            onClick={handleClose}
          >
            Închide
          </button>
        </Modal.Footer>
      </Modal>
      <React.Suspense fallback={<div>Se încarcă...</div>}>
        {showAddPartnerModal && (
          <AddPartnerModal
            show={showAddPartnerModal}
            handleClose={() => {
              setShowAddPartnerModal(false);
              queryClient.invalidateQueries({ queryKey: ['partners', 'all'] });
            }}
          />
        )}
      </React.Suspense>
    </>
  );
}
