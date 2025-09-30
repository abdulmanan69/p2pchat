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
1. In your Supabase dashboard, go to Table Editor
2. Click "New Table" and name it `signals`
3. Add the following columns:
   - `id` (auto-incrementing integer, primary key)
   - `room_id` (text)
   - `sender` (text)
   - `sender_name` (text)
   - `target` (text, nullable)
   - `type` (text)
   - `sdp` (text, nullable)
   - `candidate` (text, nullable)
   - `created_at` (timestamp, default: now())

#### Configure Row Level Security (RLS)
1. In the Table Editor, select the `signals` table
2. Go to the "Policies" tab
3. Enable Row Level Security
4. Create the following policies:

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

## Security Notes

- The application uses Supabase's anon key which is safe to expose in client-side code
- Row Level Security ensures users can only access data from their room
- No sensitive information is stored in the database
- All communication after connection establishment is peer-to-peer

## Troubleshooting

1. **Connection Issues**: 
   - Ensure you're using a supported browser (Chrome, Firefox, Edge)
   - Check that both users are using the exact same room ID
   - Make sure both users joined the room (the first user must be in the room when the second user joins)

2. **Messages Not Sending**:
   - Check browser console for errors
   - Ensure WebRTC is not blocked by browser extensions or firewall
   - Verify Supabase credentials are correct

3. **Supabase Errors**:
   - Double-check your Project URL and anon key
   - Verify RLS policies are correctly configured
   - Ensure the `signals` table has the correct schema

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

## Customization

You can customize the application by modifying:
- `style.css` for visual appearance
- `app.js` for functionality changes
- `index.html` for UI structure

## License

This project is open source and available under the MIT License.