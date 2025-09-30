# Peer-to-Peer Chat Application

A fully functional peer-to-peer chat application using WebRTC, Supabase, and GitHub Pages. This application enables direct browser-to-browser communication without any backend servers for message transmission.

## Features

- Real-time peer-to-peer text chat using WebRTC DataChannel
- Multi-user support with full mesh network topology
- Supabase Realtime Database for signaling
- Responsive design with dark mode toggle
- Random username generation
- Room-based chat with link sharing
- GitHub Pages deployment ready
- Automatic TURN server integration for better connectivity

## Files Included

- `index.html` - Main application interface
- `style.css` - Styling for the application
- `app.js` - Core application logic
- `config.js` - Supabase configuration
- `turn_helper.js` - TURN server helper for Cloudflare integration
- `README.md` - This documentation
- `SUPABASE_SETUP.md` - Detailed Supabase setup guide
- `supabase_schema.sql` - SQL schema for Supabase table
- `fix_signals_table.sql` - Fix script for ID column issues
- `supabase_test.html` - Supabase connection testing tool
- `signals_table.csv` - CSV template for table import
- `webrtc_test.html` - WebRTC connectivity testing tool
- `turn_test.html` - TURN server testing tool
- `WEBRTC_TROUBLESHOOTING.md` - Detailed WebRTC troubleshooting guide

## Prerequisites

1. A free [Supabase](https://supabase.io/) account
2. A [GitHub](https://github.com/) account
3. Basic knowledge of web development

## Setup Instructions

### 1. Supabase Setup

#### Create a Supabase Project
1. Go to [Supabase](https://app.supabase.io/) and create a new project
2. Note down your Project URL and anon key from `Settings > API`

#### Create the Signals Table
You can either:
1. Use the `supabase_schema.sql` file and run it in the Supabase SQL editor, or
2. Follow the manual steps in `SUPABASE_SETUP.md`

**Important**: Make sure the `id` column is properly configured as an auto-incrementing primary key. See the "Fixing ID Column Issues" section in SUPABASE_SETUP.md if you encounter errors.

#### Configure Row Level Security (RLS)
**Policy 1: Enable read access for all**
- Name: `Enable read access for all`
- Operation: `SELECT`
- Using expression: `true`

**Policy 2: Enable insert access for all**
- Name: `Enable insert access for all`
- Operation: `INSERT`
- With check expression: `true`

These policies allow all users to read and insert signaling data, which is necessary for the WebRTC peer discovery and connection process. The room_id field ensures users only see signals from their room.

### 2. Configure the Application

1. Open `config.js` in your code editor
2. Replace the placeholder values with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 3. Test Locally

1. Open `index.html` in your browser
2. Create a room by entering a room ID and clicking "Join Room"
3. Copy the room link and open it in another browser or private/incognito window
4. Test sending messages between browsers

Note: For testing with multiple users on the same machine, use different browsers or private/incognito windows to ensure proper WebRTC functionality.

You can also use `supabase_test.html` to verify your Supabase connection is working properly.

## Deployment to GitHub Pages

### Method 1: GitHub Repository

1. Create a new GitHub repository
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```
3. Go to your repository settings on GitHub
4. Scroll down to "Pages" section
5. Under "Source", select "Deploy from a branch"
6. Select "main" branch and "/ (root)" folder
7. Click "Save"
8. Your app will be available at `https://your-username.github.io/your-repo-name/`

### Method 2: GitHub Pages from Folder

If you have GitHub Desktop installed:
1. Create a new repository using GitHub Desktop
2. Drag all files into the repository folder
3. Commit and push the changes
4. Follow steps 3-8 from Method 1

## How It Works

1. **Signaling**: When a user joins a room, the app uses Supabase Realtime to broadcast their presence. Other users in the room receive this signal and initiate WebRTC connections.

2. **Connection**: Each user creates a direct peer-to-peer connection with every other user in the room using WebRTC DataChannel, forming a full mesh network.

3. **Messaging**: All messages are sent directly between browsers through the DataChannel, with no server involvement after the initial connection.

4. **Multi-user Support**: The app supports multiple users in the same room by establishing a full mesh network where each user connects directly to every other user.

5. **TURN Server Integration**: The application automatically fetches TURN server credentials from Cloudflare's free service to improve connectivity through restrictive networks.

## Security Notes

- The application uses Supabase's anon key which is safe to expose in client-side code
- Row Level Security ensures users can only access data from their room
- No sensitive information is stored in the database
- All communication after connection establishment is peer-to-peer
- TURN credentials are fetched securely from Cloudflare

## Troubleshooting

### Common Issues and Solutions

1. **No data appears in Supabase table**:
   - Check browser console for JavaScript errors
   - Verify Supabase credentials in `config.js` are correct
   - Confirm the `signals` table exists with the correct schema
   - Ensure RLS policies are properly configured
   - Check Supabase dashboard for any error messages

2. **Connection Issues**: 
   - Ensure you're using a supported browser (Chrome, Firefox, Edge)
   - Check that both users are using the exact same room ID
   - Make sure both users joined the room (the first user must be in the room when the second user joins)
   - Some networks (especially corporate networks) may block WebRTC connections

3. **Messages Not Sending**:
   - Check browser console for errors
   - Ensure WebRTC is not blocked by browser extensions or firewall
   - Verify that the WebRTC connection is established (check connection status)
   - Confirm that data channels are opening properly

4. **Supabase Errors**:
   - Double-check your Project URL and anon key
   - Verify RLS policies are correctly configured
   - Ensure the `signals` table has the correct schema
   - Check that you're using the anon key and not the service key
   - **"null value in column 'id' violates not-null constraint"**: The ID column is not configured for auto-increment (see SUPABASE_SETUP.md)

5. **WebRTC Connection Issues**:
   - Peers can't connect to each other
   - Messages aren't being sent between peers
   - ICE candidates aren't being generated
   - Data channels aren't opening
   - STUN servers are unreachable

   For WebRTC-specific issues, see [WEBRTC_TROUBLESHOOTING.md](file:///C:/Users/PMLS/Desktop/chat/WEBRTC_TROUBLESHOOTING.md) for detailed troubleshooting steps.

### Debugging Steps

1. Open the browser's developer tools (F12)
2. Check the Console tab for any error messages
3. Check the Network tab to see if requests to Supabase are successful
4. Verify that the Supabase client is being initialized correctly
5. Check that the Realtime subscription is working
6. Look for any WebRTC-related errors

### Testing the Supabase Connection

1. Make sure you can access your Supabase project URL in the browser
2. Verify that your anon key is correct by checking it in the Supabase dashboard
3. Try manually inserting a record into the signals table through the Supabase SQL editor:
   ```sql
   INSERT INTO signals (room_id, sender, sender_name, type) 
   VALUES ('test-room', 'test-user', 'Test User', 'test');
   ```

You can also use the `supabase_test.html` file included in the project to test your Supabase connection.

### Testing WebRTC Connectivity

Use the `webrtc_test.html` file to test:
1. Browser WebRTC support
2. STUN server connectivity
3. ICE candidate generation
4. Data channel functionality

### Testing TURN Server Connectivity

Use the `turn_test.html` file to test:
1. TURN server credential fetching
2. TURN server connectivity
3. ICE candidate analysis with TURN servers

See [WEBRTC_TROUBLESHOOTING.md](file:///C:/Users/PMLS/Desktop/chat/WEBRTC_TROUBLESHOOTING.md) for detailed WebRTC troubleshooting steps.

## Browser Support

This application works on modern browsers that support WebRTC:
- Chrome 28+
- Firefox 22+
- Safari 11+
- Edge 15+

Note: For the best experience, use the latest versions of these browsers. Some older versions may have compatibility issues with WebRTC features.

## Limitations

1. **NAT Traversal**: Some network configurations may prevent direct peer connections
2. **Mobile Networks**: Some mobile carriers restrict P2P connections
3. **Scalability**: Full mesh network becomes inefficient with many users (>5)
4. **Connection Persistence**: Users must remain connected to maintain the chat session
5. **TURN Server Availability**: Cloudflare's TURN service may have rate limits or availability issues

## Customization

You can customize the application by modifying:
- `style.css` for visual appearance
- `app.js` for functionality changes
- `index.html` for UI structure

## License

This project is open source and available under the MIT License.