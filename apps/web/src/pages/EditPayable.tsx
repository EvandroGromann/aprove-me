import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import payableService, { Payable } from '../api/payableService';
import assignorService, { Assignor } from '../api/assignorService';
import { isUuidV4, isIsoDate, nonEmpty, maxLen, positiveNumber } from '../utils/validation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Select } from '../components/ui/Select';
import MainLayout from '../components/layout/MainLayout';

function error(msg: string) { return msg; }

export default function EditPayable() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [value, setValue] = useState<number | ''>('');
  const [emissionDate, setEmissionDate] = useState('');
  const [assignor, setAssignor] = useState<Assignor>({ id: '', document: '', email: '', phone: '', name: '' });
  const [assignors, setAssignors] = useState<Assignor[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingAssignors, setLoadingAssignors] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Buscar dados do pagável
  useEffect(() => {
    const fetchPayable = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const payable = await payableService.getById(id);
        
        setValue(payable.value);
        
        // Converter a data ISO para formato de entrada datetime-local
        const date = new Date(payable.emissionDate);
        const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          .toISOString()
          .slice(0, 16);
        setEmissionDate(isoString);
        
        setAssignor(payable.assignor);
      } catch (error: any) {
        console.error('Erro ao buscar pagável:', error);
        setSubmitError(error?.message || 'Erro ao carregar dados do pagável');
      } finally {
        setLoading(false);
      }
    };

    fetchPayable();
  }, [id]);

  // Buscar cedentes
  useEffect(() => {
    const fetchAssignors = async () => {
      setLoadingAssignors(true);
      try {
        const response = await assignorService.getAll();
        console.log("Cedentes carregados:", response);
        setAssignors(response.data);
      } catch (error) {
        console.error('Erro ao buscar cedentes:', error);
      } finally {
        setLoadingAssignors(false);
      }
    };

    fetchAssignors();
  }, []);

  function validate(): boolean {
    const errs: Record<string, string | null> = {};
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    errs.value = !isFinite(num) ? error('Valor é obrigatório') : !positiveNumber(num) ? error('Valor deve ser > 0') : null;
    errs.emissionDate = !nonEmpty(emissionDate) ? error('Data é obrigatória') : !isIsoDate(emissionDate) ? error('Data inválida (ISO)') : null;
    errs['assignor.id'] = !nonEmpty(assignor.id) ? error('ID do cedente é obrigatório') : !isUuidV4(assignor.id) ? error('ID do cedente deve ser UUID v4') : null;
    
    setErrors(errs);
    return Object.values(errs).every((v) => v == null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id || !validate()) return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const payload = {
        value: typeof value === 'number' ? value : parseFloat(String(value)),
        emissionDate: new Date(emissionDate).toISOString(),
        assignor: {
          id: assignor.id,
          name: assignor.name,
          document: assignor.document,
          email: assignor.email,
          phone: assignor.phone
        }
      };
      
      await payableService.update(id, payload);
      navigate(`/payables`);
    } catch (err: any) {
      console.error("Erro ao atualizar pagável:", err);
      setSubmitError(err?.message || 'Erro ao atualizar pagável');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-[80%] mx-auto flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="w-[80%] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Editar Pagável</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="id">ID</Label>
                  <Input 
                    id="id" 
                    value={id || ''} 
                    disabled={true} 
                    className="bg-gray-100"
                  />
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
                  <Input 
                    id="emission" 
                    type="datetime-local" 
                    value={emissionDate} 
                    onChange={(e) => setEmissionDate(e.target.value)} 
                    disabled={submitting} 
                  />
                  {errors.emissionDate && <small className="text-red-600">{errors.emissionDate}</small>}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="assignorSelect">Cedente</Label>
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
                        setAssignor(selectedAssignor);
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

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/payables')}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? 'Salvando…' : 'Salvar'}
                </Button>
                
                {submitError && <div className="text-sm text-red-600 self-center ml-4">{submitError}</div>}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
