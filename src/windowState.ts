import { saveWindowState, restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';

/**
 * Save the current window state (size and position)
 */
export async function saveCurrentWindowState(): Promise<void> {
  try {
    await saveWindowState(StateFlags.ALL);
    console.log('Window state saved successfully');
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

/**
 * Restore the full window state from saved data (including maximized state)
 */
export async function restoreWindowState(): Promise<void> {
  try {
    await restoreStateCurrent(StateFlags.ALL);
    console.log('Window state restored successfully');
  } catch (error) {
    console.error('Failed to restore window state:', error);
  }
}

/**
 * Restore only the size and position, but not the maximized state
 */
export async function restoreSizeAndPosition(): Promise<void> {
  try {
    await restoreStateCurrent(StateFlags.SIZE | StateFlags.POSITION);
    console.log('Window size and position restored successfully');
  } catch (error) {
    console.error('Failed to restore window size and position:', error);
  }
}
