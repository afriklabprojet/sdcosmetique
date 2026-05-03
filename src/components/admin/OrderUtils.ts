import { OrderDraft } from '@/lib/orders';

export function exportOrdersCSV(orders: OrderDraft[]) {
  const header = ['Numéro', 'Date', 'Client', 'Email', 'Total', 'Statut', 'Paiement', 'Livraison', 'Produits'];
  const rows = orders.map(o => [
    o.orderNumber,
    o.date,
    `${o.delivery.firstName} ${o.delivery.lastName}`,
    o.delivery.email,
    `${o.total}€`,
    o.status,
    o.paymentMethod,
    `${o.delivery.address || ''} ${o.delivery.city || ''}`.trim(),
    o.items.map(i => `${i.product.name} x${i.quantity}`).join('; ')
  ]);

  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}