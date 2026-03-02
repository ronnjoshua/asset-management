import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all products with filtering and pagination
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      categoryId,
      lowStock,
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
        { sku: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (lowStock === 'true') {
      where.quantity = { lte: prisma.product.fields.minStockLevel };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get low stock products
router.get('/low-stock', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.$queryRaw`
      SELECT * FROM products
      WHERE quantity <= "minStockLevel" AND "isActive" = true
      ORDER BY quantity ASC
    `;
    res.json(products);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('sku').trim().notEmpty(),
    body('price').isNumeric(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const existingSku = await prisma.product.findUnique({
        where: { sku: req.body.sku },
      });

      if (existingSku) {
        res.status(400).json({ error: 'SKU already exists' });
        return;
      }

      const product = await prisma.product.create({
        data: {
          name: req.body.name,
          sku: req.body.sku,
          description: req.body.description,
          price: req.body.price,
          costPrice: req.body.costPrice,
          images: req.body.images || [],
          categoryId: req.body.categoryId,
          quantity: req.body.quantity || 0,
          minStockLevel: req.body.minStockLevel || 5,
          unit: req.body.unit,
          brand: req.body.brand,
          supplier: req.body.supplier,
          barcode: req.body.barcode,
          isActive: req.body.isActive ?? true,
        },
        include: { category: true },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update product
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        sku: req.body.sku,
        description: req.body.description,
        price: req.body.price,
        costPrice: req.body.costPrice,
        images: req.body.images,
        categoryId: req.body.categoryId,
        quantity: req.body.quantity,
        minStockLevel: req.body.minStockLevel,
        unit: req.body.unit,
        brand: req.body.brand,
        supplier: req.body.supplier,
        barcode: req.body.barcode,
        isActive: req.body.isActive,
      },
      include: { category: true },
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update stock quantity
router.patch('/:id/stock', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adjustment, type } = req.body; // type: 'add' | 'subtract' | 'set'

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    let newQuantity: number;
    if (type === 'add') {
      newQuantity = product.quantity + adjustment;
    } else if (type === 'subtract') {
      newQuantity = Math.max(0, product.quantity - adjustment);
    } else {
      newQuantity = adjustment;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { quantity: newQuantity },
      include: { category: true },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
