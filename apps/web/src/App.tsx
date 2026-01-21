import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Filter, Plus, X, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { PrescriptionTable } from '@/components/PrescriptionTable';
import { PrescriptionFiltersForm } from '@/components/PrescriptionFiltersForm';
import { PrescriptionFormDialog } from '@/components/PrescriptionFormDialog';
import { AppPagination } from '@/components/AppPagination';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

import { usePrescriptions, useUpdatePrescription } from '@/hooks/usePrescriptions';
import { usePrescriptionFiltersUrl } from '@/hooks/usePrescriptionFiltersUrl';
import { DEFAULT_PAGE_SIZE, type Prescription } from '@/types';
import logoAphp from '@/assets/logo-aphp-white.png';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrescriptionApp() {
  const { t } = useTranslation();
  const { filters, setFilters, page, setPage } = usePrescriptionFiltersUrl();
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | undefined>();
  const [showFilters, setShowFilters] = useState(true);
  
  const { data, isLoading, error, refetch } = usePrescriptions(filters, { page });
  const deleteMutation = useUpdatePrescription();
  
  const prescriptions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  const handleDelete = async (prescription: Prescription) => {
    // Soft delete: PATCH with status = 'suppr'
    try {
      await deleteMutation.mutateAsync({ id: prescription.id, data: { status: 'suppr' } });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleFormClose = (open: boolean) => {
    setShowForm(open);
    if (!open) {
      setEditingPrescription(undefined);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header AP-HP */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0063AF] to-[#004d8a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoAphp} alt="AP-HP" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-white font-heading">
                  {t('header.title')}
                </h1>
                <p className="text-sm text-white/80">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          
          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-[#0063AF] hover:bg-[#004d8a]"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('prescription.new')}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="mr-2 h-4 w-4" />
                {t('filters.title')}
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-[#ED6D91] text-white"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {totalCount > 0 && t('prescription.count', { count: totalCount })}
            </div>
          </div>

          {/* Filters Card */}
          {showFilters && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {t('filters.title')}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PrescriptionFiltersForm 
                  filters={filters} 
                  onFiltersChange={handleFiltersChange} 
                />
              </CardContent>
            </Card>
          )}

          {/* Prescriptions Table Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('prescription.title')}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <p>{t('errors.loadFailed')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="mt-2"
                  >
                    {t('common.reset')}
                  </Button>
                </div>
              ) : (
                <>
                  <PrescriptionTable 
                    prescriptions={prescriptions} 
                    isLoading={isLoading}
                    pagination={{
                      page,
                      pageSize: DEFAULT_PAGE_SIZE,
                      total: totalCount,
                      onPageChange: handlePageChange,
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © 2025 AP-HP - Exercice technique Full-Stack
        </div>
      </footer>

      {/* Form Dialog - Create or Edit */}
      <PrescriptionFormDialog 
        open={showForm} 
        onOpenChange={handleFormClose}
        prescription={editingPrescription}
        onSuccess={() => {
          refetch();
          setShowForm(false);
          setEditingPrescription(undefined);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrescriptionApp />
    </QueryClientProvider>
  );
}

export default App;
