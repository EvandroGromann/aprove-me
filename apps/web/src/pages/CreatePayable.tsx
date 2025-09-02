import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Assignor, CreatePayableRequest, createPayable } from '../api/client';
import { isUuidV4, isEmail, isIsoDate, nonEmpty, maxLen, positiveNumber } from '../utils/validation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Select } from '../components/ui/Select';
import assignorService from '../api/assignorService';

function error(msg: string) { return msg; }

export default function CreatePayable() {
  const [id, setId] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [emissionDate, setEmissionDate] = useState('');
  const [assignor, setAssignor] = useState<Assignor>({ id: '', document: '', email: '', phone: '', name: '' });
  const [assignors, setAssignors] = useState<Assignor[]>([]);
  const [loadingAssignors, setLoadingAssignors] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignors = async () => {
      setLoadingAssignors(true);
      try {
        const data = await assignorService.getAll();
        console.log("Fetched assignors:", data);
        setAssignors(data);
      } catch (error) {
        console.error('Failed to fetch assignors:', error);
      } finally {
        setLoadingAssignors(false);
      }
    };

    fetchAssignors();
  }, []);

  function genUuidV4(): string {
    const c: any = (globalThis as any)?.crypto;
    if (c?.randomUUID) {
      return c.randomUUID();
    }
    const arr = new Uint8Array(16);
    if (c?.getRandomValues) {
      c.getRandomValues(arr);
    } else {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    // Set version and variant bits for RFC4122 v4
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return (
      toHex(arr[0]) +
      toHex(arr[1]) +
      toHex(arr[2]) +
      toHex(arr[3]) +
      '-' +
      toHex(arr[4]) +
      toHex(arr[5]) +
      '-' +
      toHex(arr[6]) +
      toHex(arr[7]) +
      '-' +
      toHex(arr[8]) +
      toHex(arr[9]) +
      '-' +
      toHex(arr[10]) +
      toHex(arr[11]) +
      toHex(arr[12]) +
      toHex(arr[13]) +
      toHex(arr[14]) +
      toHex(arr[15])
    );
  }

  function validate(): boolean {
    const errs: Record<string, string | null> = {};
    errs.id = !nonEmpty(id) ? error('ID é obrigatório') : !isUuidV4(id) ? error('ID deve ser UUID v4') : null;
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    errs.value = !isFinite(num) ? error('Valor é obrigatório') : !positiveNumber(num) ? error('Valor deve ser > 0') : null;
    errs.emissionDate = !nonEmpty(emissionDate) ? error('Data é obrigatória') : !isIsoDate(emissionDate) ? error('Data inválida (ISO)') : null;
    errs['assignor.id'] = !nonEmpty(assignor.id) ? error('ID do cedente é obrigatório') : !isUuidV4(assignor.id) ? error('ID do cedente deve ser UUID v4') : null;
    errs['assignor.document'] = !nonEmpty(assignor.document) ? error('Documento obrigatório') : !maxLen(assignor.document, 30) ? error('Documento até 30 chars') : null;
    errs['assignor.email'] = !nonEmpty(assignor.email) ? error('Email obrigatório') : !isEmail(assignor.email) ? error('Email inválido') : !maxLen(assignor.email, 140) ? error('Email até 140 chars') : null;
    errs['assignor.phone'] = !nonEmpty(assignor.phone) ? error('Telefone obrigatório') : !maxLen(assignor.phone, 20) ? error('Telefone até 20 chars') : null;
    errs['assignor.name'] = !nonEmpty(assignor.name) ? error('Nome obrigatório') : !maxLen(assignor.name, 140) ? error('Nome até 140 chars') : null;
    setErrors(errs);
    return Object.values(errs).every((v) => v == null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Clean up assignor object to only include the required fields
      const cleanAssignor = {
        id: assignor.id,
        document: assignor.document,
        email: assignor.email,
        phone: assignor.phone,
        name: assignor.name,
      };

      const payload: CreatePayableRequest = {
        id,
        value: typeof value === 'number' ? value : parseFloat(String(value)),
        emissionDate: new Date(emissionDate).toISOString(),
        assignor: cleanAssignor,
      };
      
      console.log("Payload being sent:", payload);
      const created = await createPayable(payload);
      navigate(`/payables/${created.id}`);
    } catch (err: any) {
      console.error("Error creating payable:", err);
      setSubmitError(err?.message || 'Erro ao cadastrar pagável');
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <section className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Pagável</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="id">ID (UUID v4)</Label>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setId(genUuidV4())}
                    disabled={submitting}
                    aria-label="Gerar UUID para o campo ID"
                    title="Gerar UUID"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5" aria-hidden="true">
                      <path d="M4.5 12a7.5 7.5 0 0 1 12.92-5.303" />
                      <path d="M19.5 12a7.5 7.5 0 0 1-12.92 5.303" />
                      <path d="M16.5 3v3h-3" />
                      <path d="M7.5 21v-3h3" />
                    </svg>
                    Gerar
                  </Button>
                </div>
                <Input id="id" value={id} onChange={(e) => setId(e.target.value)} disabled={submitting} />
                {errors.id && <small className="text-red-600">{errors.id}</small>}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="value">Valor</Label>
                <CurrencyInput
                  id="value"
                  value={value}
                  onChange={setValue}
                  disabled={submitting}
                  aria-describedby={errors.value ? "value-error" : undefined}
                />
                {errors.value && <small id="value-error" className="text-red-600">{errors.value}</small>}
              </div>
              <div className="grid gap-1 md:col-span-2">
                <Label htmlFor="emission">Data de emissão</Label>
                <Input id="emission" type="datetime-local" value={emissionDate} onChange={(e) => setEmissionDate(e.target.value)} disabled={submitting} />
                {errors.emissionDate && <small className="text-red-600">{errors.emissionDate}</small>}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="assignorSelect">Cedente</Label>
                <Link to="/create-assignor" className="text-sm text-indigo-600 hover:text-indigo-500">
                  + Cadastrar Novo Cedente
                </Link>
              </div>
              
              {loadingAssignors ? (
                <div className="py-2 text-gray-500">Carregando cedentes...</div>
              ) : (
                <Select
                  id="assignorSelect"
                  disabled={submitting || loadingAssignors}
                  value={assignor.id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const selectedAssignorId = e.target.value;
                    const selectedAssignor = assignors.find(a => a.id === selectedAssignorId);
                    if (selectedAssignor) {
                      // Only include the required fields from the assignor object
                      const { id, document, email, phone, name } = selectedAssignor;
                      setAssignor({ id, document, email, phone, name });
                    } else {
                      setAssignor({ id: '', document: '', email: '', phone: '', name: '' });
                    }
                  }}
                  options={assignors.map(a => ({ value: a.id, label: `${a.name} (${a.document})` }))}
                  error={errors['assignor.id'] || ''}
                  required
                />
              )}

              {assignor.id && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium mb-2">Dados do cedente selecionado:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Nome:</span> {assignor.name}</div>
                    <div><span className="font-medium">Documento:</span> {assignor.document}</div>
                    <div><span className="font-medium">Email:</span> {assignor.email}</div>
                    <div><span className="font-medium">Telefone:</span> {assignor.phone}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Cadastrar'}
              </Button>
              {submitError && <div className="text-sm text-red-600 self-center">{submitError}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
