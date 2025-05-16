import { useState, useEffect } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [plexUrl, setPlexUrl] = useState('https://app.plex.tv/desktop');

  // Load saved URL from store when component mounts
  useEffect(() => {
    const loadSavedUrl = async () => {
      try {
        const store = await load('settings.json');
        const savedUrl = await store.get<string>('plexUrl');
        if (savedUrl) {
          setPlexUrl(savedUrl);
        }
      } catch (err) {
        console.error('Failed to load saved URL:', err);
        // Continue with default URL if loading fails
      }
    };

    loadSavedUrl();
  }, []);

  const saveUrl = async (url: string) => {
    try {
      const store = await load('settings.json');
      await store.set('plexUrl', url);
      await store.save();
      console.log('URL saved successfully:', url);
    } catch (err) {
      console.error('Failed to save URL:', err);
    }
  };

  const loadPlex = async () => {
    try {
      setIsLoading(true);
      setShowConfirmation(false);

      // Save the URL before loading Plex
      await saveUrl(plexUrl);

      // Configure the current window to load Plex
      const mainWindow = await WebviewWindow.getByLabel('main');
      if (mainWindow) {
        await mainWindow.setTitle('Plex on Tauri');
        // Set size and center are handled by the window configuration
      }

      // Navigate to Plex using the custom URL
      window.location.href = plexUrl;

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
        <h2>Welcome to Plex on Tauri</h2>
        <p>This application will load Plex in the current window.</p>

        <div className="url-input-container">
          <label htmlFor="plex-url">Plex URL:</label>
          <input
            id="plex-url"
            type="text"
            value={plexUrl}
            onChange={(e) => setPlexUrl(e.target.value)}
            placeholder="Enter Plex URL"
          />
        </div>

        <p className="url-help-text">
          Examples: <br />
          - Default Plex: https://app.plex.tv/desktop <br />
          - Local Plex: http://192.168.1.100:32400/web <br />
          - Tailscale: http://plexserver:32400/web
        </p>

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
