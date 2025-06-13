# Real-Time Debugging Guide for Zenya AI

## Overview
The real-time debugging system allows you to monitor all application activity as you perform end-to-end tests, without manually copying and pasting errors.

## Getting Started

### 1. Start Debug Monitor
Open the debug monitor in a separate browser window:
```
http://localhost:3000/debug/monitor
```

### 2. Start E2E Test Session
In your terminal or another browser tab, start a test session:
```bash
curl http://localhost:3000/api/debug/e2e
```

This will return a session ID and confirm the debug URL.

### 3. Run Your Tests
Navigate through the application normally. The debug monitor will capture:
- All API calls (success and errors)
- CSRF token issues
- User interactions (clicks, form submissions, navigation)
- Performance metrics
- State changes
- Error messages
- Console logs

## Debug Monitor Features

### Real-Time Streaming
- Live updates as events occur
- Automatic reconnection if connection drops
- Heartbeat to keep connection alive

### Filtering
Click filter buttons to focus on specific event types:
- **all** - Show everything
- **log** - General debug logs
- **error** - Errors and exceptions (including CSRF errors)
- **api** - API requests and responses
- **user** - User interactions
- **performance** - Performance metrics
- **state** - State changes
- **voice** - Voice-related events

### Controls
- **Pause/Play** - Stop/resume log collection
- **Download** - Export logs as JSON
- **Clear** - Clear current logs

## What Gets Captured

### API Errors
- CSRF token validation failures
- Authentication errors
- Rate limiting
- Server errors
- Network failures

### User Interactions
- Button clicks
- Form submissions
- Navigation changes
- Input field changes

### Performance
- API response times
- Component render times
- Memory usage warnings

## Testing Workflow

1. **Open Debug Monitor** in one window
2. **Open Application** in another window
3. **Perform Tests** - The debug monitor will show everything in real-time
4. **Use Filters** to focus on specific issues
5. **Download Logs** if needed for further analysis

## Troubleshooting

### CSRF Token Issues
- Check the **error** filter for "CSRF Token Invalid" messages
- Look at **api** logs to see if tokens are being sent
- Verify cookies are enabled in your browser

### Connection Issues
- Debug monitor shows "Disconnected" - It will auto-reconnect
- Check browser console for connection errors
- Ensure you're on localhost

### Missing Logs
- Check if debug mode is enabled
- Verify the pause button isn't active
- Clear browser cache and reload

## Advanced Usage

### Programmatic E2E Tracking
You can send custom events during automated tests:

```javascript
// Track test progress
fetch('/api/debug/e2e', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'test-step',
    testName: 'user-registration',
    data: { step: 1, description: 'Filling registration form' }
  })
})
```

### Component Tracking
Components can use the E2E tracking hook:

```typescript
import { useE2ETracking } from '@/hooks/use-e2e-tracking'

export function MyComponent() {
  useE2ETracking('MyComponent')
  // Component will automatically track mount, unmount, and interactions
}
```

## Security Note
The debug endpoints are only available in development mode (localhost). They are automatically disabled in production for security.