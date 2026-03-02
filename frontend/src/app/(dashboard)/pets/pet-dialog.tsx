'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/image-upload';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Pet, Category } from '@/types';

interface PetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: Pet | null;
  onSave: () => void;
}

const defaultPet = {
  name: '',
  species: '',
  breed: '',
  age: '',
  ageUnit: 'MONTHS',
  gender: '',
  price: '',
  costPrice: '',
  healthStatus: 'HEALTHY',
  description: '',
  images: [] as string[],
  categoryId: '',
  quantity: '1',
  status: 'AVAILABLE',
  weight: '',
  color: '',
  vaccinated: false,
  neutered: false,
  microchipped: false,
  notes: '',
};

export function PetDialog({ open, onOpenChange, pet, onSave }: PetDialogProps) {
  const [form, setForm] = useState(defaultPet);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        ageUnit: pet.ageUnit,
        gender: pet.gender || '',
        price: pet.price?.toString() || '',
        costPrice: pet.costPrice?.toString() || '',
        healthStatus: pet.healthStatus,
        description: pet.description || '',
        images: pet.images || [],
        categoryId: pet.categoryId || '',
        quantity: pet.quantity?.toString() || '1',
        status: pet.status,
        weight: pet.weight?.toString() || '',
        color: pet.color || '',
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
        microchipped: pet.microchipped,
        notes: pet.notes || '',
      });
    } else {
      setForm(defaultPet);
    }
  }, [pet]);

  useEffect(() => {
    api.getCategories('PET').then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: Partial<Pet> = {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        ageUnit: form.ageUnit as Pet['ageUnit'],
        gender: form.gender as Pet['gender'] || undefined,
        price: parseFloat(form.price),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        healthStatus: form.healthStatus as Pet['healthStatus'],
        description: form.description || undefined,
        images: form.images,
        categoryId: form.categoryId || undefined,
        quantity: parseInt(form.quantity),
        status: form.status as Pet['status'],
        weight: form.weight ? parseFloat(form.weight) : undefined,
        color: form.color || undefined,
        vaccinated: form.vaccinated,
        neutered: form.neutered,
        microchipped: form.microchipped,
        notes: form.notes || undefined,
      };

      if (pet) {
        await api.updatePet(pet.id, data);
        toast.success('Pet updated successfully');
      } else {
        await api.createPet(data);
        toast.success('Pet created successfully');
      }

      onSave();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUpload
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
            folder="petshop/pets"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input
                id="species"
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                placeholder="Dog, Cat, Bird, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) => setForm({ ...form, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <div className="flex gap-2">
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={form.ageUnit}
                  onValueChange={(value) => setForm({ ...form, ageUnit: value })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAYS">Days</SelectItem>
                    <SelectItem value="WEEKS">Weeks</SelectItem>
                    <SelectItem value="MONTHS">Months</SelectItem>
                    <SelectItem value="YEARS">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(value) => setForm({ ...form, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="NOT_FOR_SALE">Not For Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={form.healthStatus}
                onValueChange={(value) => setForm({ ...form, healthStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEALTHY">Healthy</SelectItem>
                  <SelectItem value="SICK">Sick</SelectItem>
                  <SelectItem value="RECOVERING">Recovering</SelectItem>
                  <SelectItem value="QUARANTINE">Quarantine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.vaccinated}
                onChange={(e) => setForm({ ...form, vaccinated: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm">Vaccinated</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.neutered}
                onChange={(e) => setForm({ ...form, neutered: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm">Neutered/Spayed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.microchipped}
                onChange={(e) => setForm({ ...form, microchipped: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm">Microchipped</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : pet ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
