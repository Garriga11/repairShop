import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
// 1. Create Roles (using actual database role names)
const [adminRole, techRole] = await Promise.all([
prisma.role.upsert({
where: { name: 'Admin User' },
update: {},
create: { name: 'Admin User' },
}),
prisma.role.upsert({
where: { name: 'Tech User' },
update: {},
create: { name: 'Tech User' },
}),
]);

// 2. Create Users (Admin + Tech)
const [adminUser, techUser] = await Promise.all([
prisma.user.upsert({
where: { email: 'admin@example.com' },
update: {},
create: {
name: 'Admin User',
email: 'admin@example.com',
password: await bcrypt.hash('adminpass123', 10),
roleId: adminRole.id,
},
}),
prisma.user.upsert({
where: { email: 'tech@example.com' },
update: {},
create: {
name: 'Tech User',
email: 'tech@example.com',
password: await bcrypt.hash('techpass123', 10),
roleId: techRole.id,
},
}),
]);

// 3. Create Accounts (acts as internal or customer account)
const accounts = await Promise.all([
  prisma.account.create({
    data: {
      name: 'John Doe',
      balance: 0,
    },
  }),
  prisma.account.create({
    data: {
      name: 'Jane Smith',
      balance: 150.50,
    },
  }),
  prisma.account.create({
    data: {
      name: 'Tech Solutions LLC',
      balance: 0,
    },
  }),
  prisma.account.create({
    data: {
      name: 'Corporate Client A',
      balance: 500.00,
    },
  }),
]);

const account = accounts[0]; // Use first account for the sample ticket

// 4. Create Repair Types
const repairTypes = await Promise.all([
  prisma.repairType.create({
    data: {
      name: 'iPhone 13 Screen Replacement',
      description: 'Replace broken or damaged iPhone 13 screen',
      deviceType: 'iPhone',
      deviceModel: 'iPhone 13',
      category: 'Screen Repair',
      laborPrice: 80.00,
    },
  }),
  prisma.repairType.create({
    data: {
      name: 'iPhone 13 Charging Port Replacement',
      description: 'Replace faulty charging port for iPhone 13',
      deviceType: 'iPhone',
      deviceModel: 'iPhone 13',
      category: 'Port Replacement',
      laborPrice: 60.00,
    },
  }),
  prisma.repairType.create({
    data: {
      name: 'Samsung Galaxy S21 Screen Replacement',
      description: 'Replace broken or damaged Galaxy S21 screen',
      deviceType: 'Samsung',
      deviceModel: 'Galaxy S21',
      category: 'Screen Repair',
      laborPrice: 90.00,
    },
  }),
  prisma.repairType.create({
    data: {
      name: 'iPad Air Battery Replacement',
      description: 'Replace degraded iPad Air battery',
      deviceType: 'iPad',
      deviceModel: 'iPad Air',
      category: 'Battery Replacement',
      laborPrice: 100.00,
    },
  }),
]);

// 5. Create Inventory Items
const inventoryItems = await Promise.all([
  prisma.inventoryItem.create({
    data: {
      sku: 'IPH13-SCR-001',
      name: 'iPhone 13 OLED Screen Assembly',
      description: 'High quality OLED screen assembly for iPhone 13',
      category: 'Screens',
      deviceModel: 'iPhone 13',
      quantity: 15,
      reorderLevel: 5,
      cost: 120.00,
      sellPrice: 200.00,
      location: 'Shelf A1',
      binNumber: 'A1-001',
    },
  }),
  prisma.inventoryItem.create({
    data: {
      sku: 'IPH13-PORT-001',
      name: 'iPhone 13 Charging Port Flex Cable',
      description: 'Lightning charging port flex cable for iPhone 13',
      category: 'Charging Ports',
      deviceModel: 'iPhone 13',
      quantity: 8,
      reorderLevel: 3,
      cost: 25.00,
      sellPrice: 50.00,
      location: 'Shelf B2',
      binNumber: 'B2-003',
    },
  }),
  prisma.inventoryItem.create({
    data: {
      sku: 'SAM-S21-SCR-001',
      name: 'Samsung Galaxy S21 AMOLED Screen',
      description: 'Original AMOLED screen for Samsung Galaxy S21',
      category: 'Screens',
      deviceModel: 'Galaxy S21',
      quantity: 3,
      reorderLevel: 5,
      cost: 150.00,
      sellPrice: 250.00,
      location: 'Shelf A2',
      binNumber: 'A2-001',
      needsReorder: true,
    },
  }),
  prisma.inventoryItem.create({
    data: {
      sku: 'IPAD-AIR-BAT-001',
      name: 'iPad Air Battery (4th Gen)',
      description: 'Replacement battery for iPad Air 4th generation',
      category: 'Batteries',
      deviceModel: 'iPad Air',
      quantity: 0,
      reorderLevel: 2,
      cost: 45.00,
      sellPrice: 80.00,
      location: 'Shelf C1',
      binNumber: 'C1-002',
      needsReorder: true,
    },
  }),
  prisma.inventoryItem.create({
    data: {
      sku: 'TOOL-SCREWSET-001',
      name: 'Phone Repair Screwdriver Set',
      description: 'Precision screwdriver set for phone repairs',
      category: 'Tools',
      quantity: 5,
      reorderLevel: 2,
      cost: 15.00,
      sellPrice: 30.00,
      location: 'Tool Cabinet',
      binNumber: 'TC-001',
    },
  }),
]);

// 6. Associate repair types with inventory items
await Promise.all([
  // iPhone 13 Screen Replacement uses screen part
  prisma.repairType.update({
    where: { id: repairTypes[0].id },
    data: {
      parts: {
        connect: { id: inventoryItems[0].id }, // iPhone 13 screen
      },
    },
  }),
  // iPhone 13 Port Replacement uses port part
  prisma.repairType.update({
    where: { id: repairTypes[1].id },
    data: {
      parts: {
        connect: { id: inventoryItems[1].id }, // iPhone 13 port
      },
    },
  }),
  // Samsung S21 Screen Replacement uses screen part
  prisma.repairType.update({
    where: { id: repairTypes[2].id },
    data: {
      parts: {
        connect: { id: inventoryItems[2].id }, // Samsung S21 screen
      },
    },
  }),
  // iPad Battery Replacement uses battery part
  prisma.repairType.update({
    where: { id: repairTypes[3].id },
    data: {
      parts: {
        connect: { id: inventoryItems[3].id }, // iPad Air battery
      },
    },
  }),
]);

// 7. Create Ticket with repair type
const ticket = await prisma.ticket.create({
data: {
accountId: account.id,
userId: techUser.id,
description: 'iPhone 13 charging port replacement',
device: 'iPhone 13',
deviceSN: 'SN-APPLE-123456',
location: 'Bench 3',
status: 'OPEN',
repairTypeId: repairTypes[1].id, // iPhone 13 Port Replacement
},
});

// 8. Create Deposit (Payment, not yet linked to invoice)
const deposit = await prisma.payment.create({
data: {
accountId: account.id,
amount: 50,
method: 'cash',
},
});

// 9. Generate Invoice (after closing ticket)
const totalCost = 120;
const invoice = await prisma.invoice.create({
data: {
accountId: account.id,
ticketId: ticket.id,
total: totalCost,
paidAmount: deposit.amount,
dueAmount: totalCost - deposit.amount,
},
});

// 10. Apply Invoice ID to the payment (link it manually)
await prisma.payment.update({
where: { id: deposit.id },
data: {
invoiceId: invoice.id,
},
});

// 11. Update Account Balance
await prisma.account.update({
where: { id: account.id },
data: {
balance: totalCost - deposit.amount,
},
});

// 12. Create stock movements for initial inventory
await Promise.all(
  inventoryItems.map((item) =>
    prisma.stockMovement.create({
      data: {
        inventoryId: item.id,
        type: 'STOCK_IN',
        quantity: item.quantity,
        reason: 'Initial inventory',
        userId: adminUser.id,
      },
    })
  )
);

console.log('✅ Seed completed.');
}

main()
.catch((e) => {
console.error('❌ Seed failed:', e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});