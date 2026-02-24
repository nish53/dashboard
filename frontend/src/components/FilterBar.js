import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Button } from '../components/ui/button';
import { CalendarDays, Filter, X, ChevronDown, Search } from 'lucide-react';

function SearchableSelect({ value, options, onChange, placeholder, testId }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!open) setSearch('');
  }, [open]);

  const filtered = search
    ? options.filter(p => p.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-8 px-3 text-xs border border-[#E7E5E4] rounded-md bg-white text-[#57534E] flex items-center gap-1.5 min-w-[200px] hover:bg-[#F5F5F4] transition-colors"
        data-testid={testId}
      >
        <Search className="w-3 h-3 flex-shrink-0 text-[#A8A29E]" />
        <span className="truncate flex-1 text-left">{value || placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 45 }} onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#E7E5E4] rounded-lg shadow-lg min-w-[280px] max-w-[360px]" style={{ zIndex: 46 }}>
            <div className="p-2 border-b border-[#E7E5E4]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A29E]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full h-8 pl-8 pr-3 text-xs border border-[#E7E5E4] rounded-md bg-[#F9F8F6] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                  data-testid={`${testId}-search`}
                />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F4] text-[#1C1917] font-medium border-b border-[#F5F5F4]"
              >
                {placeholder}
              </button>
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-xs text-[#A8A29E] text-center">No results found</div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p}
                    onClick={() => { onChange(p); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F4] transition-colors ${value === p ? 'bg-[#FEF3C7] text-[#D97706] font-medium' : 'text-[#57534E]'}`}
                  >
                    {p}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SimpleSelect({ value, options, onChange, placeholder, testId }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-8 px-3 text-xs border border-[#E7E5E4] rounded-md bg-white text-[#57534E] flex items-center gap-1.5 min-w-[150px] hover:bg-[#F5F5F4] transition-colors"
        data-testid={testId}
      >
        <span className="truncate flex-1 text-left">{value || placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 45 }} onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#E7E5E4] rounded-lg shadow-lg max-h-[250px] overflow-y-auto min-w-[180px]" style={{ zIndex: 46 }}>
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F4] text-[#1C1917] font-medium"
            >
              {placeholder}
            </button>
            {options.map((item) => (
              <button
                key={item}
                onClick={() => { onChange(item); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F5F5F4] ${value === item ? 'bg-[#FEF3C7] text-[#D97706] font-medium' : 'text-[#57534E]'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FilterBar({ filters, filterOptions, onFilterChange }) {
  const [dateFrom, setDateFrom] = useState(undefined);
  const [dateTo, setDateTo] = useState(undefined);

  const handleDateFromSelect = (date) => {
    setDateFrom(date);
    onFilterChange({ date_from: date ? format(date, 'yyyy-MM-dd') : null });
  };

  const handleDateToSelect = (date) => {
    setDateTo(date);
    onFilterChange({ date_to: date ? format(date, 'yyyy-MM-dd') : null });
  };

  const handleQuickDate = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from);
    setDateTo(to);
    onFilterChange({ date_from: format(from, 'yyyy-MM-dd'), date_to: format(to, 'yyyy-MM-dd') });
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange({ date_from: null, date_to: null, product: null, category: null, account: null });
  };

  const hasFilters = filters.date_from || filters.date_to || filters.product || filters.category || filters.account;

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-4 shadow-sm" data-testid="filter-bar">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-[#57534E]" strokeWidth={1.5} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Filters</span>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-xs text-[#BE123C] hover:text-[#BE123C] hover:bg-[#BE123C]/10 gap-1 h-7 px-2"
            data-testid="clear-filters-button"
          >
            <X className="w-3 h-3" /> Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {/* Quick Date Buttons */}
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={() => handleQuickDate(7)}
            className="h-8 px-3 text-xs border-[#E7E5E4] text-[#57534E] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all"
            data-testid="quick-date-7D">7D</Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickDate(30)}
            className="h-8 px-3 text-xs border-[#E7E5E4] text-[#57534E] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all"
            data-testid="quick-date-30D">30D</Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickDate(90)}
            className="h-8 px-3 text-xs border-[#E7E5E4] text-[#57534E] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all"
            data-testid="quick-date-90D">90D</Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickDate(180)}
            className="h-8 px-3 text-xs border-[#E7E5E4] text-[#57534E] hover:bg-[#1C1917] hover:text-white hover:border-[#1C1917] transition-all"
            data-testid="quick-date-6M">6M</Button>
        </div>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm"
              className="h-8 px-3 text-xs border-[#E7E5E4] text-[#57534E] gap-1.5"
              data-testid="date-from-picker">
              <CalendarDays className="w-3.5 h-3.5" />
              {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={handleDateFromSelect} initialFocus />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm"
              className="h-8 px-3 text-xs border-[#E7E5E4] text-[#57534E] gap-1.5"
              data-testid="date-to-picker">
              <CalendarDays className="w-3.5 h-3.5" />
              {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={handleDateToSelect} initialFocus />
          </PopoverContent>
        </Popover>

        {/* Product Filter with Search */}
        <SearchableSelect
          value={filters.product}
          options={filterOptions.products || []}
          onChange={(val) => onFilterChange({ product: val })}
          placeholder="All Products"
          testId="product-filter"
        />

        {/* Category Filter */}
        <SimpleSelect
          value={filters.category}
          options={filterOptions.categories || []}
          onChange={(val) => onFilterChange({ category: val })}
          placeholder="All Categories"
          testId="category-filter"
        />

        {/* Account Filter */}
        <SimpleSelect
          value={filters.account}
          options={filterOptions.accounts || []}
          onChange={(val) => onFilterChange({ account: val })}
          placeholder="All Accounts"
          testId="account-filter"
        />
      </div>
    </div>
  );
}
