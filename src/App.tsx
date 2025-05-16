import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWebview = async () => {
      try {
        setIsLoading(true);

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

        // No need to register the fullscreen listener as it's injected via initialization script
        console.log('Fullscreen listener is automatically injected via initialization script');

        listen('fullscreenchange', (event: { payload: unknown }) => {
          console.log('Received fullscreenchange event from Rust:', event.payload);
        })
          .catch((e: Error) => console.error('Failed to register fullscreen listener:', e));

        // The window will be closed automatically when the app closes
        return () => {};
      } catch (err: unknown) {
        console.error('Failed to initialize Plex:', err);
        setError(`Failed to initialize Plex: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    initWebview();
  }, []);

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
