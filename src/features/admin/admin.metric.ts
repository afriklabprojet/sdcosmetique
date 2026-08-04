/*
 * Calculs du tableau de bord et des tableaux paginés. Extraits de
 * `admin.view.tsx` (F-110) : ils etaient declares au niveau module et sont
 * appeles par les onglets sortis en vague `split`. Aucun etat entre deux
 * appels.
 */
import type { OrderDraft } from '@/features/orders/order.store';
import type { EditableProduct, ReviewRow } from '@/features/admin/admin.type';

export function calculateDashboardMetrics(orders: OrderDraft[], _editableProducts: EditableProduct[], _reviews: ReviewRow[]) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const revenueThisMonth = orders
    .filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + order.total, 0);
    
  const ordersInProgress = orders.filter(order => 
    ['pending', 'processing', 'shipped'].includes(order.status)
  ).length;
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  return {
    totalRevenue,
    revenueThisMonth, 
    ordersInProgress,
    recentOrders
  };
}

export function calculateLast7DaysData(orders: OrderDraft[]) {
  const now = new Date();
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === date.toDateString();
    });
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    
    last7Days.push({
      label: date.toLocaleDateString('fr-FR', { weekday: 'narrow' }),
      value: dayRevenue
    });
  }
  
  const maxDay = Math.max(...last7Days.map(d => d.value), 1);
  return { last7Days, maxDay };
}

export function filterOrdersData(orders: OrderDraft[], searchTerm: string, statusFilter: string) {
  return orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.delivery.firstName} ${order.delivery.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}

export function paginateData<T>(data: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedData = data.slice(start, end);
  const pageCount = Math.ceil(data.length / pageSize);
  
  return { pagedData, pageCount };
}

export function filterProductsData(products: EditableProduct[], searchTerm: string, categoryFilter: string) {
  return products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
}