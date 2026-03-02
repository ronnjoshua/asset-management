import { Router, Response } from 'express';
import prisma from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalPets,
      availablePets,
      totalProducts,
      totalEquipment,
      lowStockProducts,
      equipmentNeedsAttention,
      recentPets,
      recentProducts,
    ] = await Promise.all([
      prisma.pet.count(),
      prisma.pet.count({ where: { status: 'AVAILABLE' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.equipment.count({ where: { isActive: true } }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM products
        WHERE quantity <= "minStockLevel" AND "isActive" = true
      `,
      prisma.equipment.count({
        where: {
          OR: [
            { condition: 'NEEDS_REPAIR' },
            { condition: 'POOR' },
          ],
          isActive: true,
        },
      }),
      prisma.pet.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          species: true,
          status: true,
          price: true,
          images: true,
          createdAt: true,
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          price: true,
          images: true,
          createdAt: true,
        },
      }),
    ]);

    const lowStockCount = Number(lowStockProducts[0]?.count || 0);

    // Calculate inventory value
    const inventoryValue = await prisma.$queryRaw<{ total: number }[]>`
      SELECT
        COALESCE(SUM(CAST(price AS DECIMAL) * quantity), 0) as total
      FROM products
      WHERE "isActive" = true
    `;

    const petInventoryValue = await prisma.$queryRaw<{ total: number }[]>`
      SELECT
        COALESCE(SUM(CAST(price AS DECIMAL) * quantity), 0) as total
      FROM pets
      WHERE status = 'AVAILABLE'
    `;

    res.json({
      overview: {
        totalPets,
        availablePets,
        totalProducts,
        totalEquipment,
        lowStockProducts: lowStockCount,
        equipmentNeedsAttention,
      },
      financials: {
        productInventoryValue: Number(inventoryValue[0]?.total || 0),
        petInventoryValue: Number(petInventoryValue[0]?.total || 0),
      },
      recent: {
        pets: recentPets,
        products: recentProducts,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get alerts
router.get('/alerts', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [lowStockProducts, equipmentIssues, sickPets] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT id, name, sku, quantity, "minStockLevel"
        FROM products
        WHERE quantity <= "minStockLevel" AND "isActive" = true
        ORDER BY quantity ASC
        LIMIT 10
      `,
      prisma.equipment.findMany({
        where: {
          OR: [
            { condition: 'NEEDS_REPAIR' },
            { condition: 'POOR' },
            { condition: 'OUT_OF_SERVICE' },
          ],
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          condition: true,
          location: true,
        },
        take: 10,
      }),
      prisma.pet.findMany({
        where: {
          OR: [
            { healthStatus: 'SICK' },
            { healthStatus: 'QUARANTINE' },
          ],
        },
        select: {
          id: true,
          name: true,
          species: true,
          healthStatus: true,
        },
        take: 10,
      }),
    ]);

    res.json({
      lowStock: lowStockProducts,
      equipmentIssues,
      sickPets,
    });
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
