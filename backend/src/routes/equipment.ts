import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all equipment with filtering and pagination
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      categoryId,
      condition,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
        { manufacturer: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (condition) where.condition = condition;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        include: { category: true },
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.equipment.count({ where }),
    ]);

    res.json({
      data: equipment,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get equipment needing maintenance
router.get('/needs-attention', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const equipment = await prisma.equipment.findMany({
      where: {
        OR: [
          { condition: 'NEEDS_REPAIR' },
          { condition: 'POOR' },
          { warrantyExpiry: { lte: new Date() } },
        ],
        isActive: true,
      },
      include: { category: true },
      orderBy: { condition: 'asc' },
    });
    res.json(equipment);
  } catch (error) {
    console.error('Get equipment needing attention error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single equipment
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!equipment) {
      res.status(404).json({ error: 'Equipment not found' });
      return;
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create equipment
router.post(
  '/',
  authenticate,
  [body('name').trim().notEmpty()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      if (req.body.serialNumber) {
        const existingSerial = await prisma.equipment.findUnique({
          where: { serialNumber: req.body.serialNumber },
        });

        if (existingSerial) {
          res.status(400).json({ error: 'Serial number already exists' });
          return;
        }
      }

      const equipment = await prisma.equipment.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          serialNumber: req.body.serialNumber,
          images: req.body.images || [],
          categoryId: req.body.categoryId,
          condition: req.body.condition || 'GOOD',
          purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : null,
          purchasePrice: req.body.purchasePrice,
          currentValue: req.body.currentValue,
          location: req.body.location,
          manufacturer: req.body.manufacturer,
          model: req.body.model,
          warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : null,
          notes: req.body.notes,
          isActive: req.body.isActive ?? true,
        },
        include: { category: true },
      });

      res.status(201).json(equipment);
    } catch (error) {
      console.error('Create equipment error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update equipment
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const equipment = await prisma.equipment.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        serialNumber: req.body.serialNumber,
        images: req.body.images,
        categoryId: req.body.categoryId,
        condition: req.body.condition,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
        purchasePrice: req.body.purchasePrice,
        currentValue: req.body.currentValue,
        location: req.body.location,
        manufacturer: req.body.manufacturer,
        model: req.body.model,
        warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined,
        notes: req.body.notes,
        isActive: req.body.isActive,
      },
      include: { category: true },
    });

    res.json(equipment);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete equipment
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.equipment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
