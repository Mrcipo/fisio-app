"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patients/patient-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createPatient,
  deletePatient,
  listPatients,
  updatePatient,
  type Patient,
  type PatientInput,
} from "@/lib/patients-api";

const LIMIT = 20;

export function PatientsClient() {
  const hasMounted = useMounted();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  async function loadPatients(pageToLoad = page) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listPatients(pageToLoad, LIMIT);
      setPatients(response.patients);
      setTotal(response.total);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    void loadPatients(page);
  }, [hasMounted, page]);

  if (!hasMounted) {
    return <LoadingState label="Cargando pacientes..." />;
  }

  function openCreateForm() {
    setEditingPatient(null);
    setIsFormOpen(true);
  }

  function openEditForm(patient: Patient) {
    setEditingPatient(patient);
    setIsFormOpen(true);
  }

  async function handleSubmit(input: PatientInput) {
    if (editingPatient) {
      await updatePatient(editingPatient.id, input);
    } else {
      await createPatient(input);
    }

    setIsFormOpen(false);
    setEditingPatient(null);
    await loadPatients(page);
  }

  async function handleDelete() {
    if (!patientToDelete) {
      return;
    }

    await deletePatient(patientToDelete.id);
    setPatientToDelete(null);
    // If we deleted the last item on a non-first page, go back one page
    const remainingOnPage = patients.length - 1;
    const newPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
    if (newPage !== page) {
      setPage(newPage);
    } else {
      await loadPatients(page);
    }
  }

  return (
    <>
      <PageHeader
        title="Pacientes"
        description="Gestioná los datos administrativos básicos de tus pacientes."
        action={<Button onClick={openCreateForm}>Nuevo paciente</Button>}
      />

      {error ? (
        <Card className="border-red-200 bg-red-50 text-sm text-red-800">{error}</Card>
      ) : null}

      {isLoading ? <LoadingState label="Cargando pacientes..." /> : null}

      {!isLoading && patients.length === 0 ? (
        <EmptyState
          title="Todavía no hay pacientes"
          description="Creá el primer paciente para comenzar a cargar su historia clínica."
          action={<Button onClick={openCreateForm}>Nuevo paciente</Button>}
        />
      ) : null}

      {!isLoading && patients.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f6f8f5] text-xs uppercase text-[#66746e]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Paciente</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Documento</th>
                  <th className="px-4 py-3 font-semibold">Ocupación</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-t border-[#d9e1dc]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="font-semibold text-[#17211d] hover:text-[#0f766e]"
                      >
                        {patient.lastName}, {patient.firstName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#66746e]">
                      {patient.email ?? patient.phone ?? "Sin contacto"}
                    </td>
                    <td className="px-4 py-3 text-[#66746e]">
                      {patient.documentNumber ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-[#66746e]">
                      {patient.occupation ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => openEditForm(patient)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => setPatientToDelete(patient)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#d9e1dc] px-4 py-3">
            <p className="text-sm text-[#66746e]">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {isFormOpen ? (
        <ModalTitle
          title={editingPatient ? "Editar paciente" : "Nuevo paciente"}
          onClose={() => setIsFormOpen(false)}
        >
          <PatientForm
            patient={editingPatient}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </ModalTitle>
      ) : null}

      {patientToDelete ? (
        <ModalTitle title="Eliminar paciente" onClose={() => setPatientToDelete(null)}>
          <p className="text-sm leading-6 text-[#66746e]">
            Esta acción eliminará a {patientToDelete.firstName} {patientToDelete.lastName}.
            Confirmá solo si estás seguro.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPatientToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </ModalTitle>
      ) : null}
    </>
  );
}

function ModalTitle({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#17211d]">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}
