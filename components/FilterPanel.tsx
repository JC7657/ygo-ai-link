'use client';

import { useState } from 'react';
import { CardFilters, ATTRIBUTES, LINK_MARKERS, TYPELINE } from '@/lib/filters';

interface FilterPanelProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  onClear: () => void;
}

function OperatorToggle({ value, onChange }: { value?: 'and' | 'or', onChange: (op: 'and' | 'or') => void }) {
  return (
    <div className="flex gap-1 ml-auto">
      <button
        onClick={() => onChange('or')}
        className={`px-2 py-0.5 text-xs rounded transition-colors ${
          (value === 'or' || !value)
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        Any
      </button>
      <button
        onClick={() => onChange('and')}
        className={`px-2 py-0.5 text-xs rounded transition-colors ${
          value === 'and'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        All
      </button>
    </div>
  );
}

function ArrayFilterSection({
  label,
  options,
  selected,
  operator,
  onToggle,
  onOperatorChange,
  color = 'blue'
}: {
  label: string;
  options: string[];
  selected?: string[];
  operator?: 'and' | 'or';
  onToggle: (value: string) => void;
  onOperatorChange: (op: 'and' | 'or') => void;
  color?: 'blue' | 'purple';
}) {
  const colorClasses = {
    blue: {
      selected: 'bg-blue-600 text-white',
      unselected: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    },
    purple: {
      selected: 'bg-purple-600 text-white',
      unselected: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }
  };

  return (
    <div>
      <div className="flex items-center mb-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        {selected && selected.length > 1 && (
          <OperatorToggle value={operator} onChange={onOperatorChange} />
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selected?.includes(opt)
                ? colorClasses[color].selected
                : colorClasses[color].unselected
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onFiltersChange, onClear }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleArrayFilter = (key: keyof CardFilters, value: string) => {
    const current = filters[key] as string[] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
  };

  const handleNumberChange = (key: keyof CardFilters, value: string) => {
    const num = value === '' ? undefined : parseInt(value);
    onFiltersChange({ ...filters, [key]: num });
  };

  const handleOperatorChange = (key: 'linkmarkers_op' | 'typeline_op', op: 'and' | 'or') => {
    onFiltersChange({ ...filters, [key]: op });
  };

  const activeFilterCount = Object.entries(filters).filter(([_, v]) => {
    if (v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Advanced Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ArrayFilterSection
              label="Attribute"
              options={ATTRIBUTES}
              selected={filters.attribute}
              onToggle={(v) => toggleArrayFilter('attribute', v)}
              onOperatorChange={() => {}}
              color="blue"
            />

            <ArrayFilterSection
              label="Link Markers"
              options={LINK_MARKERS}
              selected={filters.linkmarkers}
              operator={filters.linkmarkers_op}
              onToggle={(v) => toggleArrayFilter('linkmarkers', v)}
              onOperatorChange={(op) => handleOperatorChange('linkmarkers_op', op)}
              color="purple"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ATK Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.atk_min ?? ''}
                  onChange={(e) => handleNumberChange('atk_min', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.atk_max ?? ''}
                  onChange={(e) => handleNumberChange('atk_max', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">DEF Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.def_min ?? ''}
                  onChange={(e) => handleNumberChange('def_min', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.def_max ?? ''}
                  onChange={(e) => handleNumberChange('def_max', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Level/Rank Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.level_min ?? ''}
                  onChange={(e) => handleNumberChange('level_min', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.level_max ?? ''}
                  onChange={(e) => handleNumberChange('level_max', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Link Rating Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.linkval_min ?? ''}
                  onChange={(e) => handleNumberChange('linkval_min', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.linkval_max ?? ''}
                  onChange={(e) => handleNumberChange('linkval_max', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pendulum Scale Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.scale_min ?? ''}
                  onChange={(e) => handleNumberChange('scale_min', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.scale_max ?? ''}
                  onChange={(e) => handleNumberChange('scale_max', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Archetype</label>
              <input
                type="text"
                placeholder="Search archetype..."
                value={filters.archetype ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, archetype: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500"
              />
            </div>

            <ArrayFilterSection
              label="Type/Subtype"
              options={TYPELINE}
              selected={filters.typeline}
              operator={filters.typeline_op}
              onToggle={(v) => toggleArrayFilter('typeline', v)}
              onOperatorChange={(op) => handleOperatorChange('typeline_op', op)}
              color="purple"
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-2 border-t border-gray-700">
              <button
                onClick={onClear}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
