# Silent Auto-Proxy Functionality

The WebsiteIframe component now automatically attempts to use proxy services when direct embedding fails, completely hidden from the user interface.

## How It Works

1. **Direct Load First**: Always tries to load the website directly
2. **Auto-Detection**: Detects when embedding fails (timeout or security error)
3. **Silent Auto-Retry**: Automatically switches to proxy service without user awareness
4. **Seamless Experience**: User only sees continuous "Loading website..." until success or final failure

## Testing the Auto-Proxy

### 1. Test with Known Blocked Sites

Try these URLs that typically block embedding:

```
https://github.com
https://facebook.com
https://twitter.com
https://instagram.com
https://linkedin.com
```

**Expected Behavior:**
1. Shows "Loading website..." continuously
2. Either loads successfully (could be direct or via proxy - user doesn't know)
3. Or shows standard error message after all attempts fail

### 2. Test with Your Agent

Navigate to your agent URL and observe the console:

```
Console Output Example:
> Domain is likely to block embedding: https://example.com
> Iframe load timeout, silently trying proxy...
> Iframe failed to load: https://example.com
> Auto-retrying with proxy service silently...
> Silently trying proxy URL: https://corsproxy.io/?https://example.com
> ✓ Proxy service worked successfully (hidden from user)
```

### 3. Console Debugging

Open browser DevTools (F12) and check the Console tab for these messages:

- `Domain is likely to block embedding:` - Initial detection
- `Iframe load timeout, assuming blocked` - Timeout triggered
- `Auto-retrying with proxy service silently...` - Auto-retry started (hidden from user)
- `Silently trying proxy URL:` - Shows which proxy is being used (backend only)
- `✓ Proxy service worked successfully (hidden from user)` - Proxy worked
- `Iframe loaded successfully:` - Final success

## Visual Indicators

### Loading States
1. **"Loading website..."** - Initial direct load attempt
2. **"Auto-retrying with proxy..."** - Auto-retry in progress
3. **"Using proxy service"** - Successfully loaded with proxy

### Error States
- **Basic Error**: Shows for sites that never had auto-retry
- **Enhanced Error**: Shows "cannot be embedded even with proxy services" 
- **Auto-retry Badge**: Blue badge showing "✓ Auto-retry with proxy was attempted"

## Configuration

### Timeouts
- **Known blocked domains**: 3 seconds (faster auto-retry)
- **Regular domains**: 6 seconds (standard timeout)
- **Auto-retry delay**: 2 seconds (prevents rapid switching)

### Proxy Services
The system tries multiple proxy services in order:
1. `corsproxy.io`
2. `allorigins.win`  
3. `api.codetabs.com`

## Troubleshooting

### If Auto-Proxy Doesn't Work
1. Check browser console for error messages
2. Verify the website URL is correct
3. Some websites block all proxy services
4. Try the manual "Try Again" button for different proxies

### Common Issues
- **CORS errors**: Normal, proxy should handle this
- **X-Frame-Options**: Expected for secure sites
- **CSP violations**: Some sites have very strict policies

## Benefits

✅ **Seamless UX**: Users don't need to manually click buttons
✅ **Fast Recovery**: Quick automatic retry on failures  
✅ **Clear Feedback**: Users know what's happening
✅ **Fallback Options**: Manual retry still available
✅ **Better Success Rate**: More websites will load successfully

The auto-proxy feature significantly improves the user experience by eliminating manual intervention while maintaining transparency about what's happening. 