/**
 * AccessibilityWidget - React Component
 * Easy integration for React apps
 * 
 * Usage:
 * import AccessibilityWidget from './AccessibilityWidget';
 * 
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <AccessibilityWidget 
 *         theme="auto"
 *         position="bottom-right"
 *         profiles={true}
 *         onChange={(settings) => console.log(settings)}
 *       />
 *     </>
 *   );
 * }
 */

import React, { useEffect, useRef, useState } from 'react';

const AccessibilityWidget = ({
  // Appearance
  theme = 'auto',
  position = 'bottom-right',
  
  // Behavior
  autoOpen = false,
  showIntro = true,
  profiles = true,
  
  // Data
  saveSettings = true,
  storageKey = 'accessibility-widget',
  
  // Events
  onChange,
  onOpen,
  onClose,
  onProfileChange,
  
  // Custom
  className,
  style
}) => {
  const widgetRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load widget script if not already loaded
    if (!window.AccessibilityWidgetPro) {
      const script = document.createElement('script');
      script.src = '/accessibility-widget-pro.min.js';
      script.async = true;
      script.onload = () => initWidget();
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      if (widgetRef.current) return; // Already initialized

      widgetRef.current = new window.AccessibilityWidgetPro({
        theme,
        position,
        autoOpen,
        showIntro,
        profiles,
        saveSettings,
        storageKey,
        onChange: (settings) => {
          if (onChange) onChange(settings);
        },
        onOpen: () => {
          if (onOpen) onOpen();
        },
        onClose: () => {
          if (onClose) onClose();
        },
        onProfileChange: (profile) => {
          if (onProfileChange) onProfileChange(profile);
        }
      });

      setIsReady(true);
    }

    return () => {
      // Cleanup on unmount
      if (widgetRef.current && widgetRef.current.destroy) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  // Update widget when props change
  useEffect(() => {
    if (widgetRef.current && widgetRef.current.updateConfig) {
      widgetRef.current.updateConfig({
        theme,
        position
      });
    }
  }, [theme, position]);

  // Expose widget methods via ref
  React.useImperativeHandle(widgetRef, () => ({
    open: () => widgetRef.current?.open(),
    close: () => widgetRef.current?.close(),
    toggle: () => widgetRef.current?.toggle(),
    applyProfile: (profile) => widgetRef.current?.applyProfile(profile),
    updateSetting: (key, value) => widgetRef.current?.updateSetting(key, value),
    reset: () => widgetRef.current?.reset(),
    getSettings: () => widgetRef.current?.getSettings()
  }));

  return (
    <div 
      className={`accessibility-widget-wrapper ${className || ''}`}
      style={style}
      data-widget-ready={isReady}
    />
  );
};

export default AccessibilityWidget;

// Hook for programmatic control
export const useAccessibilityWidget = () => {
  const [widget, setWidget] = useState(null);

  useEffect(() => {
    if (window.AccessibilityWidgetPro) {
      // Find existing widget instance
      const instance = window.AccessibilityWidgetPro.getInstance();
      setWidget(instance);
    }
  }, []);

  return {
    widget,
    open: () => widget?.open(),
    close: () => widget?.close(),
    toggle: () => widget?.toggle(),
    applyProfile: (profile) => widget?.applyProfile(profile),
    updateSetting: (key, value) => widget?.updateSetting(key, value),
    reset: () => widget?.reset(),
    getSettings: () => widget?.getSettings()
  };
};
