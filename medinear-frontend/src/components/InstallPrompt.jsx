import { useState, useEffect } from 'react';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check for standalone display mode (app installed)
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    // Check if app is already installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show fallback button after 2 seconds if no beforeinstallprompt
    const timer = setTimeout(() => {
      if (!showPrompt && !dismissed && !isInstalled) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [showPrompt, dismissed, isInstalled]);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
        setDismissed(false);
      }
      setInstallPrompt(null);
    } else {
      // Fallback: show instructions
      alert(
        'To install 🏥 MediNear:\n\n' +
        'Android: Tap the menu (⋮) → "Install app"\n\n' +
        'iPhone: Tap Share → "Add to Home Screen"\n\n' +
        'Desktop: Click the install icon in address bar'
      );
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">📱</div>
        <div className="install-prompt-text">
          <h3>Install MediNear</h3>
          <p>Add MediNear to your home screen for quick access</p>
        </div>
        <div className="install-prompt-buttons">
          <button className="install-btn install-confirm" onClick={handleInstall}>
            Install
          </button>
          <button className="install-btn install-cancel" onClick={handleDismiss}>
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
