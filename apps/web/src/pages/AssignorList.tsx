import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import assignorService, { Assignor, PaginatedResponse } from '../api/assignorService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';
import { EditIcon, TrashIcon } from '../components/ui/Icons';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

export default function AssignorList() {
  const [assignors, setAssignors] = useState<Assignor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignorToDelete, setAssignorToDelete] = useState<string | null>(null);

  const fetchAssignors = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await assignorService.getAll(page);
      setAssignors(response.data);
      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        hasNext: response.meta.hasNext,
        hasPrev: response.meta.hasPrev
      });
    } catch (err: any) {
      console.error('Failed to fetch assignors:', err);
      setError(err?.message || 'Erro ao carregar cedentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignors();
  }, []);

  const handleDeleteClick = (id: string) => {
    setAssignorToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!assignorToDelete) return;
    
    try {
      await assignorService.delete(assignorToDelete);
      // Recarregar a lista após excluir
      fetchAssignors(pagination.page);
      setIsDeleteDialogOpen(false);
      setAssignorToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete assignor:', err);
      setError(err?.message || 'Erro ao excluir cedente');
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setAssignorToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    fetchAssignors(newPage);
  };

  return (
    <MainLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cedentes</h1>
          <Link to="/create-assignor">
            <Button>
              Novo Cedente
            </Button>
          </Link>
        </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600 p-4 text-center">
              {error}
              <div className="mt-2">
                <Button onClick={() => fetchAssignors()} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : assignors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum cedente encontrado</p>
            <Link to="/create-assignor">
              <Button>Cadastrar primeiro cedente</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignors.map((assignor) => (
                      <tr key={assignor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignor.document}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignor.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-4">
                            <Link 
                              to={`/edit-assignor/${assignor.id}`} 
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar"
                            >
                              <EditIcon />
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(assignor.id)}
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

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {assignors.length} de {pagination.total} cedentes
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Anterior
              </Button>
              <span className="px-3 py-1 border rounded bg-gray-50">
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
        title="Excluir Cedente"
        message="Tem certeza que deseja excluir este cedente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      </div>
    </MainLayout>
  );
}
