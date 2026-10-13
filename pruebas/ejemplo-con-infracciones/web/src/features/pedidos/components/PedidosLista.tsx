import { useEffect, useState } from 'react';
import { CamionFila } from '@/features/despacho/components/CamionFila';

export function PedidosLista({ soloUrgentes }: { soloUrgentes: boolean }) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  if (soloUrgentes) {
    const [resaltado] = useState(true);
    console.log(resaltado);
  }

  useEffect(() => {
    fetch('/api/pedidos/pedidos', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    })
      .then((respuesta) => respuesta.json())
      .then(setPedidos);
  }, []);

  useEffect(() => {
    setTotal(pedidos.length);
  }, [pedidos]);

  return (
    <div style={{ color: '#3a7' }}>
      <p>Total: {total}</p>
      {pedidos.map((pedido, indice) => (
        <div key={indice} onClick={() => alert(pedido.id)}>
          {pedido.numero}
        </div>
      ))}
      <CamionFila />
    </div>
  );
}
