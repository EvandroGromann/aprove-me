import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import assignorService, { CreateAssignorDto } from '../api/assignorService'

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Label } from '../components/ui/Label'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import MainLayout from '../components/layout/MainLayout'

export function CreateAssignor() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<CreateAssignorDto & { id?: string }>({
    name: '',
    document: '',
    email: '',
    phone: '',
    id: '',
  })
  
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
  
  useEffect(() => {
    setFormData(prev => ({ ...prev, id: genUuidV4() }));
  }, [])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.id) errors.id = 'ID é obrigatório'
    if (!formData.name) errors.name = 'Nome do cedente é obrigatório'
    if (!formData.document) errors.document = 'Documento é obrigatório'
    if (!formData.email) errors.email = 'Email é obrigatório'
    if (!formData.phone) errors.phone = 'Telefone é obrigatório'
    
    if (formData.document && !/^[\d\.\-\/]+$/.test(formData.document)) {
      errors.document = 'Documento deve conter apenas números, pontos, hifens ou barras'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Formato de email inválido'
    }
    
    if (formData.phone && !/^[\d\s\(\)\-]+$/.test(formData.phone)) {
      errors.phone = 'Telefone deve conter apenas números, espaços, parênteses ou hifens'
    }

    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await assignorService.create(formData)
      
      navigate('/assignors')
    } catch (error) {
      console.error('Failed to create assignor:', error)
      
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <section className="w-[80%] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Cedente</CardTitle>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="id">ID (UUID v4)</Label>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, id: genUuidV4() })}
                    disabled={isSubmitting}
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
                <Input 
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.id && <small className="text-red-600">{formErrors.id}</small>}
              </div>
              
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
  )
}
