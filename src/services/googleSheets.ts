import { Product, SaleTransaction, StoreInfo } from '../types';

export interface SyncData {
  storeInfo: StoreInfo;
  products: Product[];
  transactions: SaleTransaction[];
}

export const syncToGoogleSheets = async (
  accessToken: string,
  data: SyncData
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `HS MINI MART - ລາຍງານຍອດຂາຍ & ສິນຄ້າ (${dateStr})`;

  // 1. Create a new Spreadsheet with 3 sheets
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        { properties: { title: 'ສະຫຼຸບລວມ_Summary' } },
        { properties: { title: 'ລາຍການຂາຍ_Sales' } },
        { properties: { title: 'ສາງສິນຄ້າ_Inventory' } },
      ],
    }),
  });

  if (!createResponse.ok) {
    const err = await createResponse.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Summary Sheet values
  const totalRevenue = data.transactions.reduce((sum, t) => sum + (t.status === 'COMPLETED' ? t.total : 0), 0);
  const totalSalesCount = data.transactions.filter(t => t.status === 'COMPLETED').length;
  const cashSales = data.transactions
    .filter(t => t.status === 'COMPLETED' && t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.total, 0);
  const transferSales = data.transactions
    .filter(t => t.status === 'COMPLETED' && t.paymentMethod === 'TRANSFER')
    .reduce((sum, t) => sum + t.total, 0);
  const lowStockCount = data.products.filter(p => p.stock <= p.minStockAlert).length;
  const totalStockValue = data.products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  const summaryValues = [
    ['HS MINI MART - ລະບົບ POS & ຈັດການສິນຄ້າ'],
    ['ຮ້ານ ນາງ ກັນຍາ ເພັດສະໜອນ'],
    [`ທີ່ຕັ້ງ: ${data.storeInfo.fullAddress}`],
    [`ເບີໂທ: ${data.storeInfo.phone1} / ${data.storeInfo.phone2}`],
    [`ບັນຊີຊຳລະເງິນ: ${data.storeInfo.bankAccount} (${data.storeInfo.bankName})`],
    [`ວັນທີສົ່ງອອກຂໍ້ມູນ: ${new Date().toLocaleString('lo-LA')}`],
    [''],
    ['ຫົວຂໍ້ສະຫຼຸບ', 'ມູນຄ່າ / ຈຳນວນ'],
    ['ຍອດຂາຍລວມທັງໝົດ (₭)', totalRevenue],
    ['ຈຳນວນບິນຂາຍທັງໝົດ', totalSalesCount],
    ['ຍອດຂາຍດ້ວຍເງິນສົດ (₭)', cashSales],
    ['ຍອດຂາຍດ້ວຍການໂອນ (BCEL One) (₭)', transferSales],
    ['ມູນຄ່າສິນຄ້າໃນສາງ (ລາຄາຕົ້ນທຶນ) (₭)', totalStockValue],
    ['ຈຳນວນລາຍການສິນຄ້າທັງໝົດ', data.products.length],
    ['ຈຳນວນສິນຄ້າໃກ້ໝົດສະຕັອກ', lowStockCount],
  ];

  // 3. Prepare Sales Sheet values
  const salesHeaders = [
    'ວັນທີ & ເວລາ',
    'ເລກບິນ (Receipt #)',
    'ປະເພດບິນ',
    'ວິທີຊຳລະ',
    'ຍອດລວມກ່ອນຫຼຸດ (₭)',
    'ສ່ວນຫຼຸດ (₭)',
    'ອາກອນ (₭)',
    'ຍອດຊຳລະສຸດທິ (₭)',
    'ຊື່ລູກຄ້າ',
    'ພະນັກງານຂາຍ',
    'ລາຍການສິນຄ້າ',
  ];

  const salesRows = data.transactions.map((t) => [
    t.timestamp,
    t.receiptNumber,
    t.receiptType === 'tax_invoice' ? 'ໃບກຳກັບພາສີ' : 'ໃບຮັບເງິນຫຍໍ້',
    t.paymentMethod === 'CASH' ? 'ເງິນສົດ' : t.paymentMethod === 'TRANSFER' ? 'ໂອນເງິນ' : 'ບັດເຄຣດິດ',
    t.subtotal,
    t.discount,
    t.tax,
    t.total,
    t.customerName || 'ລູກຄ້າທົ່ວໄປ',
    t.cashierName,
    t.items.map((i) => `${i.product.name} x${i.quantity}`).join('; '),
  ]);

  const salesValues = [salesHeaders, ...salesRows];

  // 4. Prepare Inventory Sheet values
  const inventoryHeaders = [
    'ລະຫັດບາໂຄດ (Barcode)',
    'ຊື່ສິນຄ້າ',
    'ໝວດໝູ່',
    'ລາຄາຂາຍ (₭)',
    'ລາຄາຕົ້ນທຶນ (₭)',
    'ຈຳນວນສະຕັອກ',
    'ແຈ້ງເຕືອນເມື່ອຕໍ່າກວ່າ',
    'ຫົວໜ່ວຍ',
    'ສະຖານະ',
    'ມູນຄ່າສະຕັອກ (₭)',
  ];

  const inventoryRows = data.products.map((p) => [
    p.barcode,
    p.name,
    p.category,
    p.price,
    p.costPrice,
    p.stock,
    p.minStockAlert,
    p.unit,
    p.stock <= 0 ? 'ໝົດສະຕັອກ' : p.stock <= p.minStockAlert ? 'ໃກ້ໝົດສະຕັອກ' : 'ປົກກະຕິ',
    p.stock * p.costPrice,
  ]);

  const inventoryValues = [inventoryHeaders, ...inventoryRows];

  // 5. Update data into the sheets using batchUpdate
  const batchUpdateRequest = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'ສະຫຼຸບລວມ_Summary!A1',
        values: summaryValues,
      },
      {
        range: 'ລາຍການຂາຍ_Sales!A1',
        values: salesValues,
      },
      {
        range: 'ສາງສິນຄ້າ_Inventory!A1',
        values: inventoryValues,
      },
    ],
  };

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchUpdateRequest),
    }
  );

  if (!updateResponse.ok) {
    const err = await updateResponse.json();
    throw new Error(err.error?.message || 'Failed to update Google Sheets data');
  }

  return { spreadsheetId, spreadsheetUrl };
};
