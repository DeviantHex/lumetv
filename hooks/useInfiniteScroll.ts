// hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (loadMore: () => void, hasMore: boolean) => {
  const [isFetching, setIsFetching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to debounce the scroll event
    timeoutRef.current = setTimeout(() => {
      if (isFetching || !hasMore) return;

      // Calculate scroll position
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;

      // Check if we're near the bottom (within 500px)
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        setIsFetching(true);
      }
    }, 200); // 200ms debounce
  }, [isFetching, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    
    // Call loadMore and reset isFetching when done
    const executeLoadMore = async () => {
      await loadMore();
      setIsFetching(false);
    };
    
    executeLoadMore();
  }, [isFetching, loadMore]);

  return [isFetching, setIsFetching] as const;
};