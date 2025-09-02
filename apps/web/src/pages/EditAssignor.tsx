import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import assignorService, { CreateAssignorDto, Assignor } from '../api/assignorService';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';

export function EditAssignor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<CreateAssignorDto>({
    name: '',
    document: '',
    email: '',
    phone: '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignor = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const assignor = await assignorService.getById(id);
        setFormData({
          name: assignor.name,
          document: assignor.document,
          email: assignor.email,
          phone: assignor.phone,
        });
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch assignor:', err);
        setError(err?.message || 'Erro ao carregar dados do cedente');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignor();
  }, [id]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name) errors.name = 'Nome do cedente é obrigatório';
    if (!formData.document) errors.document = 'Documento é obrigatório';
    if (!formData.email) errors.email = 'Email é obrigatório';
    if (!formData.phone) errors.phone = 'Telefone é obrigatório';
    
    if (formData.document && !/^[\d\.\-\/]+$/.test(formData.document)) {
      errors.document = 'Documento deve conter apenas números, pontos, hifens ou barras';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    if (formData.phone && !/^[\d\s\(\)\-]+$/.test(formData.phone)) {
      errors.phone = 'Telefone deve conter apenas números, espaços, parênteses ou hifens';
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await assignorService.update(id, formData);
      navigate('/assignors');
    } catch (error) {
      console.error('Failed to update assignor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="w-[80%] mx-auto flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="w-[80%] mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-red-600 p-4 text-center">
                {error}
                <div className="mt-2">
                  <Button onClick={() => navigate('/assignors')} variant="outline">
                    Voltar para a lista
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="w-[80%] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Editar Cedente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Nome do Cedente</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Digite o nome completo do cedente"
                    required
                  />
                  {formErrors.name && <small className="text-red-600">{formErrors.name}</small>}
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
                  <Input 
                    id="document"
                    name="document"
                    value={formData.document}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Digite o CPF ou CNPJ (com ou sem pontuação)"
                    required
                  />
                  {formErrors.document && <small className="text-red-600">{formErrors.document}</small>}
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Digite o email de contato"
                    required
                  />
                  {formErrors.email && <small className="text-red-600">{formErrors.email}</small>}
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Ex: (11) 98765-4321"
                    required
                  />
                  {formErrors.phone && <small className="text-red-600">{formErrors.phone}</small>}
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/assignors')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
