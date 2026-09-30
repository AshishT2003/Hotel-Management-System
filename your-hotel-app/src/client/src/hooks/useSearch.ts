import { useState, useMemo, useEffect, useRef } from 'react';
import { Reservation } from '../types';

export interface UseSearchResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredResults: Reservation[];
  filterTimeMs: number;
  totalCount: number;
  matchCount: number;
}

export function useSearch(
  items: Reservation[],
  debounceDelayMs = 50
): UseSearchResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [filterTimeMs, setFilterTimeMs] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Debounce input to ensure butter-smooth typing while maintaining <50ms response
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm, debounceDelayMs]);

  const filteredResults = useMemo(() => {
    const start = performance.now();
    const query = debouncedTerm.toLowerCase().trim();

    if (!query) {
      setFilterTimeMs(0);
      return items;
    }

    const cleanQueryDigits = query.replace(/\D/g, '');

    const results = items.filter(item => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const idStr = item.id.toString();
      const roomStr = item.roomNumber.toLowerCase();
      const emailStr = item.emailAddress.toLowerCase();
      const cityStr = item.city.toLowerCase();
      const stateStr = item.state.toLowerCase();
      const roomTypeStr = item.roomType.toLowerCase();

      // Check multi-field match
      if (
        fullName.includes(query) ||
        item.firstName.toLowerCase().includes(query) ||
        item.lastName.toLowerCase().includes(query) ||
        idStr.includes(query) ||
        roomStr.includes(query) ||
        emailStr.includes(query) ||
        cityStr.includes(query) ||
        stateStr.includes(query) ||
        roomTypeStr.includes(query)
      ) {
        return true;
      }

      // Check phone match
      if (cleanQueryDigits.length > 0) {
        const itemPhoneDigits = item.phoneNumber.replace(/\D/g, '');
        if (itemPhoneDigits.includes(cleanQueryDigits)) {
          return true;
        }
      }

      return false;
    });

    const duration = performance.now() - start;
    setFilterTimeMs(Math.round(duration * 100) / 100);

    return results;
  }, [items, debouncedTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredResults,
    filterTimeMs,
    totalCount: items.length,
    matchCount: filteredResults.length,
  };
}
