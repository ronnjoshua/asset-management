'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PawPrint, Package, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import type { DashboardStats, DashboardAlerts } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, alertsData] = await Promise.all([
          api.getDashboardStats(),
          api.getDashboardAlerts(),
        ]);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalPets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.availablePets || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.lowStockProducts || 0} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipment</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalEquipment || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.equipmentNeedsAttention || 0} needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (stats?.financials.productInventoryValue || 0) +
                  (stats?.financials.petInventoryValue || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total asset value</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Low Stock Products
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts?.lowStock && alerts.lowStock.length > 0 ? (
              <div className="space-y-2">
                {alerts.lowStock.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <Badge variant="destructive">{item.quantity} left</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No low stock items</p>
            )}
          </CardContent>
        </Card>

        {/* Equipment Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              Equipment Issues
            </CardTitle>
            <CardDescription>Equipment needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts?.equipmentIssues && alerts.equipmentIssues.length > 0 ? (
              <div className="space-y-2">
                {alerts.equipmentIssues.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/equipment/${item.id}`}
                    className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.location}</p>
                    </div>
                    <Badge variant="secondary">{item.condition.replace('_', ' ')}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No equipment issues</p>
            )}
          </CardContent>
        </Card>

        {/* Sick Pets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-red-500" />
              Pet Health Alerts
            </CardTitle>
            <CardDescription>Pets requiring medical attention</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts?.sickPets && alerts.sickPets.length > 0 ? (
              <div className="space-y-2">
                {alerts.sickPets.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/pets/${item.id}`}
                    className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.species}</p>
                    </div>
                    <Badge variant="destructive">{item.healthStatus}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All pets are healthy</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pets</CardTitle>
            <CardDescription>Latest pets added to inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recent.pets && stats.recent.pets.length > 0 ? (
              <div className="space-y-2">
                {stats.recent.pets.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/${pet.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {pet.images?.[0] ? (
                        <img
                          src={pet.images[0]}
                          alt={pet.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <PawPrint className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-sm text-muted-foreground">{pet.species}</p>
                      </div>
                    </div>
                    <Badge variant={pet.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                      {pet.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pets yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Latest products added to inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recent.products && stats.recent.products.length > 0 ? (
              <div className="space-y-2">
                {stats.recent.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(Number(product.price))}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No products yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
