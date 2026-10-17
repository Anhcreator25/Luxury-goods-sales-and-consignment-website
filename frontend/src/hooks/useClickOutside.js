import { useEffect, useRef } from 'react';

/**
 * Custom hook tự động đóng dropdown/modal khi click ra ngoài vùng ref
 * @param {Function} handler Hàm callback được gọi khi click bên ngoài (ví dụ: () => setIsOpen(false))
 * @returns {React.RefObject} ref cần gắn vào thẻ bao bọc dropdown
 */
export function useClickOutside(handler) {
  const domRef = useRef(null);

  useEffect(() => {
    const checkClickOutside = (event) => {
      if (domRef.current && !domRef.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', checkClickOutside);
    document.addEventListener('touchstart', checkClickOutside);

    return () => {
      document.removeEventListener('mousedown', checkClickOutside);
      document.removeEventListener('touchstart', checkClickOutside);
    };
  }, [handler]);

  return domRef;
}

