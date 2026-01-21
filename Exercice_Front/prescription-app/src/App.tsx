import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionList } from './components/PrescriptionList';
import { PrescriptionFilters } from './components/PrescriptionFilters';
import { PrescriptionForm } from './components/PrescriptionForm';
import { usePrescriptions } from './hooks/usePrescriptions';
import type { PrescriptionFilters as Filters } from './types';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrescriptionApp() {
  const [filters, setFilters] = useState<Filters>({});
  const [showForm, setShowForm] = useState(false);
  
  const { data: prescriptions = [], isLoading, error, refetch } = usePrescriptions(filters);

  return (
    <div className="app">
      <header className="app-header">
        <h1>💊 Gestion des Prescriptions</h1>
        <p className="subtitle">AP-HP - Cohort360</p>
      </header>

      <main className="app-main">
        {/* Section Formulaire */}
        <section className="section">
          <button 
            className="btn btn-primary toggle-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '📋 Masquer le formulaire' : '➕ Nouvelle prescription'}
          </button>
          
          {showForm && (
            <PrescriptionForm 
              onSuccess={() => {
                refetch();
              }} 
            />
          )}
        </section>

        {/* Section Filtres */}
        <section className="section">
          <PrescriptionFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
        </section>

        {/* Section Liste */}
        <section className="section">
          <h2>📋 Liste des Prescriptions</h2>
          
          {error && (
            <div className="error-banner" role="alert">
              Erreur lors du chargement des prescriptions. 
              <button onClick={() => refetch()} className="btn btn-sm">
                Réessayer
              </button>
            </div>
          )}
          
          <PrescriptionList 
            prescriptions={prescriptions} 
            isLoading={isLoading} 
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2025 AP-HP - Exercice technique Full-Stack</p>
      </footer>
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
