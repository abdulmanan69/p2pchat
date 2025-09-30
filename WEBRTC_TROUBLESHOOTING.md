# WebRTC Connection Troubleshooting Guide

This guide helps diagnose and fix common WebRTC connection issues in the P2P Chat application.

## Common WebRTC Issues

1. **Peers can't connect to each other**
2. **Messages aren't being sent between peers**
3. **ICE candidates aren't being generated**
4. **Data channels aren't opening**
5. **STUN servers are unreachable**

## Diagnostic Steps

### 1. Test Browser Compatibility

Open [webrtc_test.html](file:///C:/Users/PMLS/Desktop/chat/webrtc_test.html) in your browser and run all tests:
- Check WebRTC Support
- Test STUN Servers
- Generate ICE Candidates
- Test Data Channel

If any tests fail, check the error messages for specific issues.

### 2. Check Browser Console

Open the browser's developer tools (F12) and check the Console tab for any error messages:
- Look for WebRTC-related errors
- Check for Supabase connection issues
- Look for JavaScript exceptions

### 3. Verify Network Connectivity

- Ensure both browser tabs are on the same network
- Check that your firewall isn't blocking WebRTC connections
- Some corporate networks block P2P connections

### 4. Test with Different Browsers

Try using different browsers:
- Chrome
- Firefox
- Edge
- Safari

Some browsers handle WebRTC differently.

## Specific Issue Solutions

### Issue: "Peers can't connect to each other"

**Symptoms**: 
- Both users show as connected to the room
- No error messages
- Messages aren't delivered

**Solutions**:
1. Ensure both users are using the exact same room ID
2. Check that both users joined the room (the first user must be in the room when the second user joins)
3. Wait a few seconds after the second user joins for connections to establish
4. Check the browser console for ICE connection state changes

### Issue: "ICE candidates aren't being generated"

**Symptoms**:
- No ICE candidates appear in the console logs
- Connection state remains "new" or "checking"

**Solutions**:
1. Verify STUN servers are reachable (use the WebRTC test page)
2. Check your network/firewall settings
3. Try different STUN servers:
   ```javascript
   iceServers: [
       { urls: 'stun:stun.l.google.com:19302' },
       { urls: 'stun:stun1.l.google.com:19302' },
       { urls: 'stun:stun.stunprotocol.org:3478' }
   ]
   ```

### Issue: "Data channels aren't opening"

**Symptoms**:
- ICE connection shows as connected
- Data channel state remains "connecting"

**Solutions**:
1. Check that both peers are creating data channels correctly
2. Ensure the offer/answer exchange is completed
3. Look for data channel errors in the console

### Issue: "STUN servers are unreachable"

**Symptoms**:
- Errors when testing STUN servers
- No ICE candidates generated

**Solutions**:
1. Try different STUN servers:
   ```javascript
   iceServers: [
       { urls: 'stun:stun.cloudflare.com:3478' },
       { urls: 'stun:stun.stunprotocol.org:3478' },
       { urls: 'stun:stun.voip.blackberry.com:3478' }
   ]
   ```
2. Check your network connection
3. Verify that your firewall isn't blocking UDP traffic

## Advanced Debugging

### Enable Detailed WebRTC Logging

Add this to your browser startup flags to enable detailed WebRTC logging:
- Chrome: `--enable-logging --v=1`
- Firefox: Set `media.peerconnection.debug` to `true` in about:config

### Check ICE Candidate Types

In the browser console, look for the types of ICE candidates being generated:
- host candidates (local IP addresses)
- srflx candidates (STUN server responses)
- relay candidates (TURN server, if configured)

For direct connections to work, you typically need both peers to generate srflx candidates.

## Network Configuration Issues

### Symmetric NAT

Some networks use symmetric NAT which can prevent direct P2P connections. Symptoms:
- ICE candidates are generated but connection fails
- Connection works on some networks but not others

**Solutions**:
1. Use a TURN server (requires additional setup)
2. Test on a different network
3. Use a VPN

### Firewall Blocking

Firewalls may block:
- UDP traffic (required for WebRTC)
- Specific port ranges
- STUN/TURN server connections

**Solutions**:
1. Configure firewall to allow UDP traffic
2. Use TCP-based TURN servers
3. Test on a network without restrictive firewall rules

## Testing Checklist

Before reporting issues, verify:

- [ ] Both users are using the same room ID
- [ ] Both users successfully connected to Supabase
- [ ] No JavaScript errors in the console
- [ ] STUN servers are reachable
- [ ] ICE candidates are being generated
- [ ] ICE connection state changes from "checking" to "connected"
- [ ] Data channels open successfully
- [ ] Testing with latest browser versions
- [ ] Testing on the same network (for initial testing)

## When to Use TURN Servers

If direct P2P connections consistently fail, you may need to set up TURN servers:
1. WebRTC attempts direct connection (P2P)
2. If that fails, it tries STUN (NAT traversal)
3. If that fails, TURN servers act as relays

TURN servers require:
- A dedicated server
- Bandwidth for relaying traffic
- Additional configuration in the WebRTC setup

For most local testing, STUN servers should be sufficient.