import { useRef, useState, useEffect, useCallback } from 'react';

const useScrollContainer = () => {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const autoScrollRef = useRef(null);
    const lastInteractionTime = useRef(Date.now());

    // Handle Drag Scrolling
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
        lastInteractionTime.current = Date.now();
        stopAutoScroll();
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsHovering(false);
        stopAutoScroll();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        lastInteractionTime.current = Date.now();
        // Resume auto-scroll after delay if still hovering
        if (isHovering) {
            setTimeout(() => {
                if (Date.now() - lastInteractionTime.current >= 2000 && !isDragging) {
                    startAutoScroll();
                }
            }, 2000);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        containerRef.current.scrollLeft = scrollLeft - walk;
        lastInteractionTime.current = Date.now();
    };

    // Handle Auto Scroll
    const startAutoScroll = useCallback(() => {
        if (isDragging) return;
        setIsAutoScrolling(true);

        const scroll = () => {
            if (containerRef.current) {
                containerRef.current.scrollLeft += 1; // Smooth slow scroll
                // Loop back to start if reached end? Or just stop?
                // For now, just scroll.
                if (containerRef.current.scrollLeft >= containerRef.current.scrollWidth - containerRef.current.clientWidth) {
                    // Optional: Loop or stop. Let's stop for now or reset.
                    // containerRef.current.scrollLeft = 0; // Loop
                }
            }
            autoScrollRef.current = requestAnimationFrame(scroll);
        };
        autoScrollRef.current = requestAnimationFrame(scroll);
    }, [isDragging]);

    const stopAutoScroll = () => {
        setIsAutoScrolling(false);
        if (autoScrollRef.current) {
            cancelAnimationFrame(autoScrollRef.current);
        }
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
        startAutoScroll();
    };

    // Cleanup
    useEffect(() => {
        return () => stopAutoScroll();
    }, []);

    // Watch for hover/drag state changes to manage auto-scroll
    useEffect(() => {
        if (isHovering && !isDragging) {
            // Check if we should be auto-scrolling (e.g. after interaction delay)
            // But the requirement says "Hover -> Auto scroll". "Drag -> Pause". "Stop drag -> Wait 2s -> Resume".
            // The handleMouseUp handles the resume logic.
            // But if we just entered, we start immediately.
        } else {
            stopAutoScroll();
        }
    }, [isHovering, isDragging]);

    return {
        containerRef,
        events: {
            onMouseDown: handleMouseDown,
            onMouseLeave: handleMouseLeave,
            onMouseUp: handleMouseUp,
            onMouseMove: handleMouseMove,
            onMouseEnter: handleMouseEnter
        }
    };
};

export default useScrollContainer;
