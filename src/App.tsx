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

        // Create a new webview window that loads Plex
        const webview = new WebviewWindow('plex-webview', {
          url: 'https://app.plex.tv/desktop',
          title: 'Plex on Arm',
          width: 1280,
          height: 800,
          center: true,
          focus: true
        });

        // Listen for window events
        webview.once('tauri://created', () => {
          console.log('Webview window created');
          setIsLoading(false);

          // No need to register the fullscreen listener as it's injected via initialization script
          console.log('Fullscreen listener is automatically injected via initialization script');

          listen('fullscreenchange', (event: { payload: unknown }) => {
            console.log('Received fullscreenchange event from Rust:', event.payload);
          })
            .catch((e: Error) => console.error('Failed to register fullscreen listener:', e));

          // Since we can't directly inject JavaScript into the webview in Tauri v2,
          // we'll use the resize event to detect fullscreen changes

          // Listen for the webview window's resize event
        });

        webview.once('tauri://error', (event: { payload: unknown }) => {
          console.error('Error creating webview window:', event.payload);
          setError('Failed to create Plex window');
          setIsLoading(false);
        });

        // The webview will be closed automatically when the app closes
        // No need to explicitly close it in the cleanup function
        return () => {};
      } catch (err: unknown) {
        console.error('Failed to initialize webview:', err);
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
