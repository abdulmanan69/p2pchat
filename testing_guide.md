# P2P Chat Application Testing Guide

This guide will help you thoroughly test the peer-to-peer chat application to ensure all components are working correctly.

## Prerequisites

1. A Supabase project with the `signals` table properly configured
2. The application files (index.html, app.js, config.js, etc.) in a web-accessible directory
3. Two separate browser instances (or one browser and one incognito/private window)

## Testing Steps

### 1. Supabase Configuration Test

1. Open `supabase_test.html` in your browser
2. Click the "Test Supabase Connection" button
3. Verify that:
   - The test shows "Supabase client initialized successfully"
   - The test shows "Record inserted successfully"
   - The test shows "Query successful"

### 2. TURN Server Test

1. Open `turn_test.html` in your browser
2. Click all the test buttons:
   - "Fetch TURN Credentials"
   - "Test TURN Connectivity"
   - "Analyze ICE Candidates"
3. Verify that:
   - TURN credentials are fetched successfully
   - ICE candidates are generated
   - You see different candidate types (host, srflx, relay if TURN works)

### 3. Network Diagnostics

1. Open `network_diagnostics.html` in your browser
2. Run all tests to check your network environment
3. Pay attention to any restrictions that might block WebRTC

### 4. Main Application Test

#### Step 1: First User Joins Room
1. Open `index.html` in your browser (regular window)
2. Enter a room name (e.g., "testroom") in the room ID field
3. Click "Join Room"
4. Verify that:
   - Status changes to "Connected"
   - "Database connection successful" message appears
   - "Successfully connected to room" message appears
   - "Sending signal: new-peer" message appears
   - "Peers: 0 (Connected: 0, Connecting: 0)" status appears periodically

#### Step 2: Second User Joins Room
1. Open `index.html` in a different browser or incognito/private window
2. Enter the same room name ("testroom")
3. Click "Join Room"
4. In the first browser window, verify that:
   - You see messages like:
     - "Processing signal from [user]: new-peer"
     - "Creating connection offer for peer: [user]"
     - "Sending signal: offer"
   - Peer count should increase: "Peers: 1 (Connected: 0, Connecting: 1)"
   - Eventually: "Peers: 1 (Connected: 1, Connecting: 0)" when connection is established

#### Step 3: Message Exchange Test
1. In either browser window, type a message and click "Send"
2. Verify that:
   - The message appears in both browser windows
   - The message shows the correct sender name
   - Messages are delivered in real-time

#### Step 4: Connection Status Verification
1. Check that both users show as connected in both windows
2. Verify that the peer count is correct (should be 1 for each user)
3. Check the connection states are "connected" or "completed"

## Common Issues and Solutions

### Issue: "Peers connected: 0" Even with Multiple Users
**Possible Causes:**
1. Supabase signals aren't being inserted/retreived properly
2. WebRTC signaling (offer/answer) isn't working
3. ICE candidates aren't being exchanged
4. Network/firewall restrictions

**Solutions:**
1. Check the Supabase `signals` table to see if entries are being created
2. Look for JavaScript errors in the browser console
3. Verify that both users are using the exact same room ID
4. Try the "Discover Peers" button if automatic discovery isn't working

### Issue: Messages Not Sending
**Possible Causes:**
1. Data channels aren't opening properly
2. Peer connections aren't fully established
3. Network issues

**Solutions:**
1. Check that peer connections show as "connected"
2. Verify that data channels have "open" readyState
3. Try resetting connections and rejoining the room

### Issue: No ICE Candidates Generated
**Possible Causes:**
1. Network/firewall restrictions
2. TURN server connectivity issues
3. Browser WebRTC restrictions

**Solutions:**
1. Run the TURN tests to verify connectivity
2. Check network diagnostics for restrictions
3. Try a different network environment

## Diagnostic Information to Collect

If you encounter issues, collect the following information:

1. **Browser Console Logs**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Copy any error messages

2. **Supabase Signals Table Data**:
   - Check what entries exist in the `signals` table
   - Look for patterns in the signal types and flow

3. **Network Information**:
   - Run the network diagnostics tests
   - Note any restrictions or issues found

4. **ICE Candidate Information**:
   - Check what types of candidates are being generated
   - Look for relay candidates if using TURN

## Testing Checklist

Before reporting issues, verify:

- [ ] Supabase configuration is correct in `config.js`
- [ ] `signals` table exists with correct schema
- [ ] RLS policies are properly configured
- [ ] Both users use the exact same room ID
- [ ] No JavaScript errors in browser console
- [ ] Supabase signals are being inserted into the database
- [ ] ICE candidates are being generated
- [ ] Peer connections show as "connected"
- [ ] Data channels have "open" readyState
- [ ] Messages appear in both browser windows

## Advanced Testing

### Database Monitoring
1. Keep the Supabase table editor open while testing
2. Watch for new entries as you perform actions
3. Verify the signal flow: new-peer → offer → answer → ice-candidate

### Network Environment Testing
1. Try testing on different networks (home, mobile hotspot, etc.)
2. Test with different browsers
3. Test with firewall temporarily disabled (if possible)

### Stress Testing
1. Try with more than 2 users in the same room
2. Send many messages rapidly
3. Test connection stability over time

This comprehensive testing guide should help you identify and resolve any issues with the peer-to-peer chat application.