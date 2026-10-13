import { usePedidos } from '@/features/pedidos';

export function Boton({ texto }: { texto: string }) {
  const { total } = usePedidos();

  return (
    <button className="bg-[#1a73e8] p-[13px] text-white">
      {texto} ({total})
    </button>
  );
}
