import { useEffect } from "react";

/**
 * Hook to enable kiosk mode optimizations
 * - Prevents screen sleep using Wake Lock API
 * - Disables context menu (right-click)
 * - Disables keyboard shortcuts that could exit kiosk
 * - Optionally enables fullscreen mode
 */
export const useKioskMode = (enableFullscreen = false) => {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    // Prevent screen sleep
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
          console.log("Wake Lock enabled");

          wakeLock.addEventListener("release", () => {
            console.log("Wake Lock released");
          });
        }
      } catch (err) {
        console.warn("Wake Lock not supported or denied:", err);
      }
    };

    // Re-acquire wake lock when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && wakeLock === null) {
        requestWakeLock();
      }
    };

    // Disable context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts that could exit kiosk
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F11 (fullscreen toggle)
      if (e.key === "F11") {
        e.preventDefault();
      }
      // Block Ctrl/Cmd + W (close tab)
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
      }
      // Block Ctrl/Cmd + T (new tab)
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
      }
      // Block Ctrl/Cmd + N (new window)
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
      }
      // Block Ctrl/Cmd + Q (quit browser)
      if ((e.ctrlKey || e.metaKey) && e.key === "q") {
        e.preventDefault();
      }
      // Block Alt + F4 (close window)
      if (e.altKey && e.key === "F4") {
        e.preventDefault();
      }
    };

    // Enter fullscreen if requested
    const enterFullscreen = async () => {
      if (enableFullscreen && document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
          console.log("Fullscreen enabled");
        } catch (err) {
          console.warn("Fullscreen not supported or denied:", err);
        }
      }
    };

    // Initialize
    requestWakeLock();
    enterFullscreen();

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [enableFullscreen]);
};
