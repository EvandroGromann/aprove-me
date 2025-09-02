import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import payableService, { Payable, PaginatedResponse } from '../api/payableService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';
import { EyeIcon, EditIcon, TrashIcon } from '../components/ui/Icons';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export default function PayableList() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [payableToDelete, setPayableToDelete] = useState<string | null>(null);

  const fetchPayables = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await payableService.getAll(page);
      setPayables(response.data);
      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        hasNext: response.meta.hasNext,
        hasPrev: response.meta.hasPrev
      });
    } catch (err: any) {
      console.error('Failed to fetch payables:', err);
      setError(err?.message || 'Erro ao carregar pagáveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePageChange = (newPage: number) => {
    fetchPayables(newPage);
  };
  
  const handleEdit = (id: string) => {
    navigate(`/payables/edit/${id}`);
  };
  
  const handleDeleteClick = (id: string) => {
    setPayableToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!payableToDelete) return;
    
    try {
      await payableService.delete(payableToDelete);
      // Atualiza a lista após exclusão
      fetchPayables(pagination.page);
      setIsDeleteDialogOpen(false);
      setPayableToDelete(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir pagável');
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setPayableToDelete(null);
  };

  return (
    <MainLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pagáveis</h1>
          <Link to="/create-payable">
            <Button>
              Novo Pagável
            </Button>
          </Link>
        </div>

      {loading ? (
        <div className="flex justify-center my-8 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando pagáveis...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchPayables()} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : payables.length === 0 ? (
        <Card className="w-full">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum pagável encontrado</p>
            <Link to="/create-payable">
              <Button>Cadastrar primeiro pagável</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                        Data de Emissão
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                        Cedente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payables.map((payable) => (
                      <tr key={payable.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-mono" title={payable.id}>{payable.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payable.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payable.emissionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payable.assignor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <Link 
                              to={`/payables/${payable.id}`} 
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Detalhes"
                            >
                              <EyeIcon />
                            </Link>
                            <button
                              onClick={() => handleEdit(payable.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(payable.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 w-full">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Mostrando {payables.length} de {pagination.total} pagáveis
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 border rounded bg-gray-50 min-w-[80px] text-center">
                {pagination.page} de {pagination.totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
      
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Excluir Pagável"
        message="Tem certeza que deseja excluir este pagável? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      </div>
    </MainLayout>
  );
}
