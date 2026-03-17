'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, Suspense } from 'react';
import { fetchCards } from '@/lib/api';
import { CardFilters } from '@/lib/filters';
import { CardGrid } from '@/components/CardGrid';
import { SearchBar, SearchType } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';

const LIMIT_OPTIONS = [20, 40, 60, 80, 100];

function parseFiltersFromParams(searchParams: URLSearchParams): CardFilters {
  const filters: CardFilters = {};
  
  const filtersParam = searchParams.get('filters');
  if (filtersParam) {
    const params = new URLSearchParams(filtersParam);
    
    if (params.get('type')) filters.type = params.get('type')!.split(',');
    if (params.get('frame_type')) filters.frame_type = params.get('frame_type')!.split(',');
    if (params.get('attribute')) filters.attribute = params.get('attribute')!.split(',');
    if (params.get('race')) filters.race = params.get('race')!.split(',');
    if (params.get('archetype')) filters.archetype = params.get('archetype')!;
    if (params.get('atk_min')) filters.atk_min = parseInt(params.get('atk_min')!);
    if (params.get('atk_max')) filters.atk_max = parseInt(params.get('atk_max')!);
    if (params.get('def_min')) filters.def_min = parseInt(params.get('def_min')!);
    if (params.get('def_max')) filters.def_max = parseInt(params.get('def_max')!);
    if (params.get('level_min')) filters.level_min = parseInt(params.get('level_min')!);
    if (params.get('level_max')) filters.level_max = parseInt(params.get('level_max')!);
    if (params.get('linkval_min')) filters.linkval_min = parseInt(params.get('linkval_min')!);
    if (params.get('linkval_max')) filters.linkval_max = parseInt(params.get('linkval_max')!);
    if (params.get('scale_min')) filters.scale_min = parseInt(params.get('scale_min')!);
    if (params.get('scale_max')) filters.scale_max = parseInt(params.get('scale_max')!);
    if (params.get('linkmarkers')) filters.linkmarkers = params.get('linkmarkers')!.split(',');
    if (params.get('linkmarkers_op')) filters.linkmarkers_op = params.get('linkmarkers_op') as 'and' | 'or';
    if (params.get('typeline')) filters.typeline = params.get('typeline')!.split(',');
    if (params.get('typeline_op')) filters.typeline_op = params.get('typeline_op') as 'and' | 'or';
  }
  
  return filters;
}

function buildFiltersParam(filters: CardFilters): string {
  const params = new URLSearchParams();
  
  if (filters.type?.length) params.set('type', filters.type.join(','));
  if (filters.frame_type?.length) params.set('frame_type', filters.frame_type.join(','));
  if (filters.attribute?.length) params.set('attribute', filters.attribute.join(','));
  if (filters.race?.length) params.set('race', filters.race.join(','));
  if (filters.archetype) params.set('archetype', filters.archetype);
  if (filters.atk_min != null) params.set('atk_min', String(filters.atk_min));
  if (filters.atk_max != null) params.set('atk_max', String(filters.atk_max));
  if (filters.def_min != null) params.set('def_min', String(filters.def_min));
  if (filters.def_max != null) params.set('def_max', String(filters.def_max));
  if (filters.level_min != null) params.set('level_min', String(filters.level_min));
  if (filters.level_max != null) params.set('level_max', String(filters.level_max));
  if (filters.linkval_min != null) params.set('linkval_min', String(filters.linkval_min));
  if (filters.linkval_max != null) params.set('linkval_max', String(filters.linkval_max));
  if (filters.scale_min != null) params.set('scale_min', String(filters.scale_min));
  if (filters.scale_max != null) params.set('scale_max', String(filters.scale_max));
  if (filters.linkmarkers?.length) params.set('linkmarkers', filters.linkmarkers.join(','));
  if (filters.linkmarkers_op) params.set('linkmarkers_op', filters.linkmarkers_op);
  if (filters.typeline?.length) params.set('typeline', filters.typeline.join(','));
  if (filters.typeline_op) params.set('typeline_op', filters.typeline_op);
  
  return params.toString();
}

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const searchQuery = searchParams.get('search') || '';
  const searchType = (searchParams.get('searchType') || 'name') as SearchType;
  const filters = parseFiltersFromParams(searchParams);

  const hasFilters = Object.values(filters).some(v => {
    if (v === undefined || v === null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['cards', page, limit, searchQuery, searchType, filters],
    queryFn: () => fetchCards({ 
      page, 
      limit, 
      name: searchQuery || undefined,
      searchType: searchType || 'name',
      filters: hasFilters ? filters : undefined 
    }),
  });

  const updateParams = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleSearch = (query: string, searchType: SearchType) => {
    updateParams({ search: query, searchType, page: 1 });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ limit: newLimit, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const handleFiltersChange = (newFilters: CardFilters) => {
    const filterStr = buildFiltersParam(newFilters);
    if (filterStr) {
      updateParams({ filters: filterStr, page: 1 });
    } else {
      updateParams({ filters: null, page: 1 });
    }
  };

  const handleClearFilters = () => {
    updateParams({ filters: null, page: 1 });
  };

  const totalCards = data?.count || 0;
  const totalPages = Math.ceil(totalCards / limit);
  const showingFrom = totalCards === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, totalCards);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Yu-Gi-Oh! Card Database</h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} initialType={searchType} />
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Cards per page:</label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <FilterPanel 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="text-gray-400">Loading cards...</div>
        </div>
      )}

      {error && (
        <div className="flex justify-center py-12">
          <div className="text-red-400">Failed to load cards. Make sure the backend is running on port 3000.</div>
        </div>
      )}

      {data && (
        <>
          <p className="text-gray-400 mb-4">
            Showing {showingFrom}-{showingTo} of {totalCards} cards
          </p>
          <CardGrid cards={data.cards} />
          
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-gray-800 disabled:opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-1.5 bg-gray-800 disabled:opacity-50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-1.5 bg-gray-800 disabled:opacity-50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-gray-800 disabled:opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Last
                </button>
              </div>
              <span className="text-gray-400 text-sm">
                Page {page} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
