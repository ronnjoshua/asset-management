import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;

    const where: any = {};
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            pets: true,
            products: true,
            equipment: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get category tree (hierarchical)
router.get('/tree', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;

    const where: any = { parentId: null };
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: {
                pets: true,
                products: true,
                equipment: true,
              },
            },
          },
        },
        _count: {
          select: {
            pets: true,
            products: true,
            equipment: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single category
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            pets: true,
            products: true,
            equipment: true,
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['PET', 'PRODUCT', 'EQUIPMENT']),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const existing = await prisma.category.findFirst({
        where: {
          name: req.body.name,
          type: req.body.type,
        },
      });

      if (existing) {
        res.status(400).json({ error: 'Category with this name already exists for this type' });
        return;
      }

      const category = await prisma.category.create({
        data: {
          name: req.body.name,
          type: req.body.type,
          description: req.body.description,
          parentId: req.body.parentId,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update category
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        parentId: req.body.parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if category has children
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        children: true,
        _count: {
          select: {
            pets: true,
            products: true,
            equipment: true,
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    if (category.children.length > 0) {
      res.status(400).json({ error: 'Cannot delete category with subcategories' });
      return;
    }

    const totalItems = category._count.pets + category._count.products + category._count.equipment;
    if (totalItems > 0) {
      res.status(400).json({ error: 'Cannot delete category with associated items' });
      return;
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
