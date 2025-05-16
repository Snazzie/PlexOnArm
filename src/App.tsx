import { useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(true);

  const loadPlex = async () => {
    try {
      setIsLoading(true);
      setShowConfirmation(false);

      // Configure the current window to load Plex
      const mainWindow = await WebviewWindow.getByLabel('main');
      if (mainWindow) {
        await mainWindow.setTitle('Plex on Arm');
        // Set size and center are handled by the window configuration
      }

      // Navigate to Plex
      window.location.href = 'https://app.plex.tv/desktop';

      console.log('Navigated to Plex in the current window');
      setIsLoading(false);

      return () => {};
    } catch (err: unknown) {
      console.error('Failed to initialize Plex:', err);
      setError(`Failed to initialize Plex: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Show confirmation screen
  if (showConfirmation) {
    return (
      <div className="confirmation-container">
        <h2>Welcome to Plex on Arm</h2>
        <p>This application will load Plex in the current window.</p>
        <p>Click the button below to continue to Plex.</p>
        <button onClick={loadPlex}>Continue to Plex</button>
      </div>
    );
  }

  // Show loading state or error
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Plex...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Plex</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // The webview is created in a separate window, so we just show a message
  return (
    <div className="success-container">
      <h2>Plex is running in a separate window</h2>
      <p>If the Plex window was closed, you can reopen it by refreshing this page.</p>
      <button onClick={() => window.location.reload()}>Reopen Plex</button>
    </div>
  );
}

export default App;
