import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all pets with filtering and pagination
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      species,
      status,
      categoryId,
      healthStatus,
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
        { breed: { contains: search as string, mode: 'insensitive' } },
        { species: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (species) where.species = species;
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (healthStatus) where.healthStatus = healthStatus;

    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        include: { category: true },
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.pet.count({ where }),
    ]);

    res.json({
      data: pets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single pet
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!pet) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    res.json(pet);
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create pet
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('species').trim().notEmpty(),
    body('price').isNumeric(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const pet = await prisma.pet.create({
        data: {
          name: req.body.name,
          species: req.body.species,
          breed: req.body.breed,
          age: req.body.age ? parseInt(req.body.age) : null,
          ageUnit: req.body.ageUnit || 'MONTHS',
          gender: req.body.gender,
          price: req.body.price,
          costPrice: req.body.costPrice,
          healthStatus: req.body.healthStatus || 'HEALTHY',
          description: req.body.description,
          images: req.body.images || [],
          categoryId: req.body.categoryId,
          quantity: req.body.quantity || 1,
          status: req.body.status || 'AVAILABLE',
          weight: req.body.weight,
          color: req.body.color,
          vaccinated: req.body.vaccinated || false,
          neutered: req.body.neutered || false,
          microchipped: req.body.microchipped || false,
          notes: req.body.notes,
        },
        include: { category: true },
      });

      res.status(201).json(pet);
    } catch (error) {
      console.error('Create pet error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update pet
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pet = await prisma.pet.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        species: req.body.species,
        breed: req.body.breed,
        age: req.body.age !== undefined ? parseInt(req.body.age) : undefined,
        ageUnit: req.body.ageUnit,
        gender: req.body.gender,
        price: req.body.price,
        costPrice: req.body.costPrice,
        healthStatus: req.body.healthStatus,
        description: req.body.description,
        images: req.body.images,
        categoryId: req.body.categoryId,
        quantity: req.body.quantity,
        status: req.body.status,
        weight: req.body.weight,
        color: req.body.color,
        vaccinated: req.body.vaccinated,
        neutered: req.body.neutered,
        microchipped: req.body.microchipped,
        notes: req.body.notes,
      },
      include: { category: true },
    });

    res.json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete pet
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.pet.delete({ where: { id: req.params.id } });
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
