import { useState, useEffect } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { restoreWindowState } from "./windowState";
import "./App.css";

function App() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showConfirmation, setShowConfirmation] = useState(true);
	const [plexUrl, setPlexUrl] = useState("https://app.plex.tv/desktop");

	// Load saved URL from store and set up initial window state when component mounts
	useEffect(() => {
		const initialize = async () => {
			try {
				// Load saved URL
				const store = await load("settings.json");
				const savedUrl = await store.get<string>("plexUrl");
				if (savedUrl) {
					setPlexUrl(savedUrl);
				}

				// Skip window state restoration on initial load
				// We'll manually set the window size and position

				// Get the main window
				const mainWindow = await WebviewWindow.getByLabel("main");
				mainWindow?.hide();
				if (mainWindow) {
					// Now show the window
					await mainWindow.show();
				}
			} catch (err) {
				console.error("Failed during initialization:", err);
				// Make window visible even if there was an error
				try {
					const mainWindow = await WebviewWindow.getByLabel("main");
					if (mainWindow) {
						// Ensure the window is not maximized before showing it
						// Now show the window
						await mainWindow.show();
					}
				} catch (showErr) {
					console.error("Failed to show window:", showErr);
				}
			}
		};

		initialize();
	}, []);

	const saveUrl = async (url: string) => {
		try {
			const store = await load("settings.json");
			await store.set("plexUrl", url);
			await store.save();
			console.log("URL saved successfully:", url);
		} catch (err) {
			console.error("Failed to save URL:", err);
		}
	};

	const loadPlex = async () => {
		try {
			setIsLoading(true);
			setShowConfirmation(false);

			// Save URL to settings
			await saveUrl(plexUrl);

			// Get main window and set title
			const mainWindow = await WebviewWindow.getByLabel("main");
			if (mainWindow) {
				await mainWindow.setTitle("Plex On Tauri");
			}

			// Now restore the FULL window state including maximized state
			// This will apply any previously saved maximized state
			await restoreWindowState();

			console.log("Restored full window state including maximized state");

			// Navigate to Plex
			window.location.href = plexUrl;

			console.log("Navigated to Plex in the current window");
			setIsLoading(false);

			return () => {};
		} catch (err: unknown) {
			console.error("Failed to initialize Plex:", err);
			setError(
				`Failed to initialize Plex: ${err instanceof Error ? err.message : String(err)}`,
			);
			setIsLoading(false);
		}
	};

	if (showConfirmation) {
		return (
			<div className="confirmation-container">
				<h2>Welcome to Plex on Tauri</h2>
				<p>This application will load Plex in the current window.</p>

				<div className="url-input-container">
					<label htmlFor="plex-url">Plex Client URL:</label>
					<input
						id="plex-url"
						type="text"
						value={plexUrl}
						onChange={(e) => setPlexUrl(e.target.value)}
						placeholder="Enter Plex Client URL"
					/>
				</div>

				<p className="url-help-text">
					Examples: <br />- Default Plex: https://app.plex.tv/desktop <br />-
					Local Plex: http://192.168.1.100:32400/web <br />- Tailscale:
					http://plexserver:32400/web
				</p>

				<button onClick={loadPlex}>Continue to Plex</button>
			</div>
		);
	}

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

	return <div className="success-container"></div>;
}

export default App;
