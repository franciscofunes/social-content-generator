"use client";

import { useState, useEffect, RefObject } from 'react';

interface DropdownPosition {
  top: number | 'auto';
  left: number | 'auto';
  right: number | 'auto';
  bottom: number | 'auto';
}

interface UseDropdownPositionOptions {
  dropdownWidth?: number;
  dropdownHeight?: number;
  offset?: number;
  preferredDirection?: 'down' | 'up' | 'auto';
  preferredAlignment?: 'left' | 'right' | 'center' | 'auto';
}

export const useDropdownPosition = (
  triggerRef: RefObject<HTMLElement>,
  isOpen: boolean,
  options: UseDropdownPositionOptions = {}
) => {
  const {
    dropdownWidth = 320,
    dropdownHeight = 400,
    offset = 8,
    preferredDirection = 'auto',
    preferredAlignment = 'auto'
  } = options;

  const [position, setPosition] = useState<DropdownPosition>({
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto'
  });

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let newPosition: DropdownPosition = {
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto'
    };

    // Calculate available space
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceOnRight = viewportWidth - triggerRect.left;
    const spaceOnLeft = triggerRect.right;

    // Determine vertical position
    let openUpward = false;
    if (preferredDirection === 'up') {
      openUpward = spaceAbove >= dropdownHeight;
    } else if (preferredDirection === 'down') {
      openUpward = spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;
    } else {
      // Auto: prefer downward, but open upward if not enough space below
      openUpward = spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;
    }

    if (openUpward) {
      newPosition.bottom = viewportHeight - triggerRect.top - scrollY + offset;
    } else {
      newPosition.top = triggerRect.bottom + scrollY + offset;
    }

    // Determine horizontal position
    if (viewportWidth <= 768) {
      // Mobile: full width with padding
      newPosition.left = 16 + scrollX;
      newPosition.right = 16;
    } else {
      // Desktop: smart positioning
      if (preferredAlignment === 'left') {
        newPosition.left = triggerRect.left + scrollX;
      } else if (preferredAlignment === 'right') {
        newPosition.right = viewportWidth - triggerRect.right - scrollX;
      } else if (preferredAlignment === 'center') {
        const centerPosition = triggerRect.left + (triggerRect.width / 2) - (dropdownWidth / 2);
        newPosition.left = Math.max(16, Math.min(centerPosition + scrollX, viewportWidth - dropdownWidth - 16));
      } else {
        // Auto alignment
        if (spaceOnRight >= dropdownWidth) {
          // Align to left edge of trigger
          newPosition.left = triggerRect.left + scrollX;
        } else if (spaceOnLeft >= dropdownWidth) {
          // Align to right edge of trigger
          newPosition.right = viewportWidth - triggerRect.right - scrollX;
        } else {
          // Not enough space on either side, align to viewport edge
          newPosition.right = 16;
        }
      }
    }

    setPosition(newPosition);
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();

      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, dropdownWidth, dropdownHeight, offset, preferredDirection, preferredAlignment]);

  return { position, calculatePosition };
};