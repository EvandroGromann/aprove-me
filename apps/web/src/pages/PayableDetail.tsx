import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PayableResponse, getPayable } from '../api/client';

export default function PayableDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PayableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getPayable(id);
        if (!ignore) setData(res);
      } catch (err: any) {
        if (!ignore) setError(err?.message || 'Erro ao carregar');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [id]);

  if (!id) return <div className="text-sm text-gray-600">Sem ID</div>;
  if (loading) return <div className="text-sm text-gray-600">Carregando…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return <div className="text-sm text-gray-600">Não encontrado</div>;

  return (
  <section className="max-w-3xl mx-auto">
      <h2 className="text-lg font-medium mb-4">Detalhe do Pagável</h2>
  <div className="grid gap-2 p-4 rounded border border-gray-200 bg-white text-gray-900">
        <div><span className="font-semibold">ID:</span> {data.id}</div>
        <div>
          <span className="font-semibold">Valor:</span>{' '}
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}
        </div>
        <div><span className="font-semibold">Emissão:</span> {new Date(data.emissionDate).toLocaleString()}</div>
        <div><span className="font-semibold">Criado em:</span> {new Date(data.createdAt).toLocaleString()}</div>
        <div><span className="font-semibold">Atualizado em:</span> {new Date(data.updatedAt).toLocaleString()}</div>
        <h3 className="text-base font-semibold mt-2">Cedente</h3>
        <div><span className="font-semibold">ID:</span> {data.assignor.id}</div>
        <div><span className="font-semibold">Documento:</span> {data.assignor.document}</div>
        <div><span className="font-semibold">Email:</span> {data.assignor.email}</div>
        <div><span className="font-semibold">Telefone:</span> {data.assignor.phone}</div>
        <div><span className="font-semibold">Nome:</span> {data.assignor.name}</div>
      </div>
    </section>
  );
}
