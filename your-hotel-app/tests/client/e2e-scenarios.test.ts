import { api } from '../../src/client/src/services/api';
import { calculateBilling } from '../../src/client/src/utils/billing';

export async function runE2EScenarioTests() {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  async function testAsync(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (e: any) {
      results.push({ name, passed: false, error: e?.message || String(e) });
    }
  }

  // Scenario 1: Check-in flow
  await testAsync('E2E Flow: Admin Authentication and Guest Check-In Transition', async () => {
    // 1. Authenticate as Admin
    const auth = await api.auth.login('admin', 'password123');
    if (auth.user.role !== 'Admin') {
      throw new Error(`Expected role Admin, got ${auth.user.role}`);
    }

    // 2. Fetch reservations
    const reservations = await api.reservations.getAll();
    if (reservations.length === 0) throw new Error('No reservations found');
    const target = reservations[0];

    // 3. Toggle check-in to true
    const ok = await api.reservations.toggleCheckIn(target.id, true);
    if (!ok) throw new Error('Failed to toggle check-in');

    // 4. Verify room matrix status reflects occupancy
    const rooms = await api.rooms.getMatrix();
    const roomUnit = rooms.find(r => r.roomNumber === target.roomNumber);
    if (roomUnit && roomUnit.status !== 'Occupied') {
      throw new Error(`Expected room status Occupied, got ${roomUnit.status}`);
    }
  });

  // Scenario 2: Kitchen flow
  await testAsync('E2E Flow: Kitchen "On The Line" Order Fulfillment', async () => {
    // 1. Authenticate as Kitchen
    const auth = await api.auth.login('kitchen', 'password123');
    if (auth.user.role !== 'Kitchen') {
      throw new Error(`Expected role Kitchen, got ${auth.user.role}`);
    }

    // 2. Fetch active orders
    const orders = await api.kitchen.getOrders();
    if (orders.length === 0) throw new Error('No kitchen orders found');
    const targetOrder = orders[0];

    // 3. Mark order as served
    const ok = await api.kitchen.updateOrderStatus(targetOrder.orderId, true);
    if (!ok) throw new Error('Failed to mark order served');

    // 4. Verify status updated
    const refreshed = await api.kitchen.getOrders();
    const updated = refreshed.find(o => o.orderId === targetOrder.orderId);
    if (updated && !updated.supplyStatus) {
      throw new Error('Order supplyStatus should be true (Served)');
    }
  });

  // Scenario 3: Billing flow
  await testAsync('E2E Flow: Folio Invoice Calculation & Tax Transparency', async () => {
    const reservations = await api.reservations.getAll();
    const target = reservations[0];
    const invoice = await api.reservations.getInvoice(target.id);
    if (!invoice) throw new Error('Invoice was not generated');

    // Verify mathematical integrity: Tax = 7% on subtotal, Final = Subtotal + Tax
    const subtotal = invoice.roomSubtotal + invoice.guestSurcharge + invoice.foodTotal;
    const expectedTax = Math.round(subtotal * 0.07 * 100) / 100;
    const expectedFinal = Math.round((subtotal + expectedTax) * 100) / 100;

    if (Math.abs(invoice.taxAmount - expectedTax) > 0.02) {
      throw new Error(`Tax mismatch: Expected ${expectedTax}, got ${invoice.taxAmount}`);
    }
    if (Math.abs(invoice.finalTotal - expectedFinal) > 0.02) {
      throw new Error(`Total mismatch: Expected ${expectedFinal}, got ${invoice.finalTotal}`);
    }
  });

  return results;
}
