import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import payableService, { Payable } from '../api/payableService';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';

export default function PayableDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Payable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setError('ID não fornecido');
          setLoading(false);
          return;
        }
        const res = await payableService.getById(id);
        setData(res);
      } catch (err) {
        setError('Erro ao carregar dados do pagável');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <MainLayout>
      <div className="w-[80%] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes do pagável...</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
  
  if (error) return (
    <MainLayout>
      <div className="w-[80%] mx-auto">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-4">
            <Link to="/payables">
              <Button variant="outline">Voltar para Lista</Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
  
  if (!data) return (
    <MainLayout>
      <div className="w-[80%] mx-auto">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Pagável não encontrado</h3>
          <p className="mt-2 text-gray-600">Não foi possível encontrar os dados do pagável solicitado.</p>
          <div className="mt-4">
            <Link to="/payables">
              <Button variant="outline">Voltar para Lista</Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );

  return (
  <MainLayout>
      <section className="w-[80%] mx-auto">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
          <h2 className="text-2xl font-medium text-gray-800">Detalhes do Pagável</h2>
          <Link to="/payables">
            <Button variant="outline">Voltar para Lista</Button>
          </Link>
        </div>        <div className="bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Cabeçalho com informações importantes do pagável */}
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-blue-200 text-blue-800">Informações do Pagável</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <p className="text-sm text-gray-500 mb-1">Identificador</p>
                <div className="overflow-x-auto whitespace-nowrap">
                  <p className="text-lg font-medium text-gray-800">{data.id}</p>
                </div>
              </div>
              <div className="col-span-1 text-center">
                <p className="text-sm text-gray-500 mb-1">Valor</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}
                </p>
              </div>
              <div className="col-span-1 text-right">
                <p className="text-sm text-gray-500 mb-1">Data de Emissão</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(data.emissionDate).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Conteúdo principal com duas colunas em telas maiores */}
          {/* Informações adicionais do Pagável - Datas de criação/atualização */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 mr-1">Criado em:</span>
                <span className="text-gray-700 font-medium">{new Date(data.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-sm text-gray-500 mr-1">Atualizado em:</span>
                <span className="text-gray-700 font-medium">{new Date(data.updatedAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
          
          {/* Detalhes do Cedente */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-blue-200 text-blue-800">Informações do Cedente</h3>
            
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-sm">
              {/* Informações principais do cedente em destaque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-4 border-b border-blue-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nome</p>
                  <p className="text-xl font-medium text-gray-800">{data.assignor.name}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Documento</p>
                  <p className="text-lg font-medium text-gray-800">{data.assignor.document}</p>
                </div>
              </div>
              
              {/* Informações adicionais do cedente em grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <p className="text-sm font-medium text-gray-500 mb-1">ID</p>
                  <div className="overflow-x-auto whitespace-nowrap">
                    <p className="text-gray-800">{data.assignor.id}</p>
                  </div>
                </div>
                <div className="sm:col-span-5">
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-gray-800 overflow-x-auto whitespace-nowrap">{data.assignor.email}</p>
                </div>
                <div className="sm:col-span-2 text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-500 mb-1">Telefone</p>
                  <p className="text-gray-800">{data.assignor.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  </MainLayout>
  );
}
