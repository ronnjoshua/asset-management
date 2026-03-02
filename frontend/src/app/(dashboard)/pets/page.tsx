'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { PetDialog } from './pet-dialog';
import api from '@/lib/api';
import type { Pet, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-500',
  SOLD: 'bg-gray-500',
  RESERVED: 'bg-blue-500',
  NOT_FOR_SALE: 'bg-yellow-500',
};

const healthColors: Record<string, string> = {
  HEALTHY: 'bg-green-500',
  SICK: 'bg-red-500',
  RECOVERING: 'bg-yellow-500',
  QUARANTINE: 'bg-orange-500',
};

export default function PetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;

      const response = await api.getPets(params);
      setPets(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load pets');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPet(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setDialogOpen(false);
    setEditingPet(null);
    fetchPets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    try {
      await api.deletePet(id);
      toast.success('Pet deleted successfully');
      fetchPets();
    } catch (error) {
      toast.error('Failed to delete pet');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(value);

  const columns = [
    {
      key: 'name',
      header: 'Pet',
      render: (pet: Pet) => (
        <div className="flex items-center gap-3">
          {pet.images?.[0] ? (
            <img
              src={pet.images[0]}
              alt={pet.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted" />
          )}
          <div>
            <p className="font-medium">{pet.name}</p>
            <p className="text-sm text-muted-foreground">
              {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pet: Pet) => (
        <Badge className={statusColors[pet.status]}>{pet.status}</Badge>
      ),
    },
    {
      key: 'healthStatus',
      header: 'Health',
      render: (pet: Pet) => (
        <Badge className={healthColors[pet.healthStatus]}>{pet.healthStatus}</Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (pet: Pet) => formatCurrency(Number(pet.price)),
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (pet: Pet) => pet.quantity,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (pet: Pet) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(pet);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(pet.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pets</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pet
        </Button>
      </div>

      <DataTable
        data={pets}
        columns={columns}
        searchPlaceholder="Search pets..."
        onSearch={handleSearch}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

      <PetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pet={editingPet}
        onSave={handleSave}
      />
    </div>
  );
}
