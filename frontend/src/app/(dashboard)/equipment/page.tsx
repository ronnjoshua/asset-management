'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { EquipmentDialog } from './equipment-dialog';
import api from '@/lib/api';
import type { Equipment } from '@/types';
import { toast } from 'sonner';

const conditionColors: Record<string, string> = {
  EXCELLENT: 'bg-green-500',
  GOOD: 'bg-blue-500',
  FAIR: 'bg-yellow-500',
  POOR: 'bg-orange-500',
  NEEDS_REPAIR: 'bg-red-500',
  OUT_OF_SERVICE: 'bg-gray-500',
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;

      const response = await api.getEquipment(params);
      setEquipment(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingEquipment(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    setDialogOpen(false);
    setEditingEquipment(null);
    fetchEquipment();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await api.deleteEquipment(id);
      toast.success('Equipment deleted successfully');
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to delete equipment');
    }
  };

  const formatCurrency = (value: number | undefined) =>
    value
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(value)
      : '-';

  const columns = [
    {
      key: 'name',
      header: 'Equipment',
      render: (item: Equipment) => (
        <div className="flex items-center gap-3">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-muted" />
          )}
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.serialNumber || 'No S/N'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'manufacturer',
      header: 'Manufacturer',
      render: (item: Equipment) => item.manufacturer || '-',
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: Equipment) => item.location || '-',
    },
    {
      key: 'condition',
      header: 'Condition',
      render: (item: Equipment) => (
        <Badge className={conditionColors[item.condition]}>
          {item.condition.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'currentValue',
      header: 'Value',
      render: (item: Equipment) => formatCurrency(Number(item.currentValue)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Equipment) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Equipment) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
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
        <h1 className="text-3xl font-bold">Equipment</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      <DataTable
        data={equipment}
        columns={columns}
        searchPlaceholder="Search equipment..."
        onSearch={handleSearch}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editingEquipment}
        onSave={handleSave}
      />
    </div>
  );
}
