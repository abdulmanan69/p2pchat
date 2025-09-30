class P2PChat {
    constructor() {
        this.supabase = null;
        this.roomId = null;
        this.userId = this.generateUserId();
        this.username = this.generateUsername();
        this.peers = new Map(); // peerId -> {connection, dataChannel}
        this.channel = null;
        
        // DOM Elements
        this.elements = {
            roomIdInput: document.getElementById('roomId'),
            joinRoomBtn: document.getElementById('joinRoom'),
            copyLinkBtn: document.getElementById('copyLink'),
            roomStatus: document.getElementById('roomStatus'),
            messagesContainer: document.getElementById('messages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            themeToggle: document.getElementById('themeToggle')
        };
        
        this.init();
    }
    
    init() {
        // Check if Supabase config is available
        if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
            this.showMessage('Error: Supabase configuration not found. Please check config.js');
            return;
        }
        
        // Initialize Supabase
        this.supabase = supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for room ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomIdFromUrl = urlParams.get('room');
        if (roomIdFromUrl) {
            this.elements.roomIdInput.value = roomIdFromUrl;
        }
        
        // Load theme preference
        this.loadThemePreference();
    }
    
    setupEventListeners() {
        this.elements.joinRoomBtn.addEventListener('click', () => this.joinRoom());
        this.elements.copyLinkBtn.addEventListener('click', () => this.copyRoomLink());
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    async joinRoom() {
        const roomId = this.elements.roomIdInput.value.trim();
        if (!roomId) {
            alert('Please enter a room ID');
            return;
        }
        
        this.roomId = roomId;
        this.updateRoomStatus('Connecting...');
        
        try {
            // Create signaling channel
            this.channel = this.supabase
                .channel(`room-${this.roomId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'signals'
                    },
                    (payload) => {
                        this.handleSignal(payload.new);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Successfully subscribed to room channel');
                        this.updateRoomStatus('Connected');
                        this.enableChat();
                    }
                });
            
            // When joining a room, we don't automatically create offers
            // Instead, we wait for other peers to send 'new-peer' signals
            // and then we'll create offers for them
        } catch (error) {
            console.error('Error joining room:', error);
            this.updateRoomStatus('Connection failed');
        }
    }
    
    async createOfferForPeer(targetPeerId) {
        // Don't create offer if we already have a connection with this peer
        if (this.peers.has(targetPeerId)) {
            return;
        }
        
        try {
            // Create RTCPeerConnection
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            // Create data channel
            const dataChannel = peerConnection.createDataChannel('chat');
            this.setupDataChannel(dataChannel, targetPeerId);
            
            // Store connection
            this.peers.set(targetPeerId, { connection: peerConnection, dataChannel: dataChannel });
            
            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.sendSignal({
                        type: 'ice-candidate',
                        candidate: event.candidate,
                        target: targetPeerId
                    });
                }
            };
            
            // Create offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            // Send offer via Supabase
            this.sendSignal({
                type: 'offer',
                sdp: offer.sdp,
                target: targetPeerId
            });
        } catch (error) {
            console.error('Error creating offer for peer:', targetPeerId, error);
        }
    }
    
    async handleSignal(signal) {
        // Don't process our own signals
        if (signal.sender === this.userId) return;
        
        try {
            switch (signal.type) {
                case 'new-peer':
                    // When a new peer joins, we create an offer to connect to them
                    // But only if we're not the sender (to avoid circular connections)
                    if (signal.sender !== this.userId) {
                        await this.createOfferForPeer(signal.sender);
                    }
                    break;
                case 'offer':
                    await this.handleOffer(signal);
                    break;
                case 'answer':
                    await this.handleAnswer(signal);
                    break;
                case 'ice-candidate':
                    await this.handleIceCandidate(signal);
                    break;
            }
        } catch (error) {
            console.error('Error handling signal:', error);
        }
    }
    
    async handleOffer(signal) {
        // Create RTCPeerConnection for remote peer
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        // Store connection
        this.peers.set(signal.sender, { connection: peerConnection });
        
        // Handle data channel
        peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;
            this.setupDataChannel(dataChannel, signal.sender);
            // Update the peer with the data channel
            const peer = this.peers.get(signal.sender);
            if (peer) {
                peer.dataChannel = dataChannel;
            }
        };
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    target: signal.sender
                });
            }
        };
        
        // Set remote description
        await peerConnection.setRemoteDescription({
            type: 'offer',
            sdp: signal.sdp
        });
        
        // Create answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Send answer
        this.sendSignal({
            type: 'answer',
            sdp: answer.sdp,
            target: signal.sender
        });
    }
    
    async handleAnswer(signal) {
        // Find the peer connection for this answer
        const peer = this.peers.get(signal.sender);
        if (peer && peer.connection) {
            await peer.connection.setRemoteDescription({
                type: 'answer',
                sdp: signal.sdp
            });
        }
    }
    
    async handleIceCandidate(signal) {
        const peerConnection = signal.target === this.userId ? 
            this.localConnection : 
            this.peers.get(signal.sender)?.connection;
            
        if (peerConnection) {
            try {
                // Parse the candidate if it's a string
                const candidate = typeof signal.candidate === 'string' ? 
                    JSON.parse(signal.candidate) : signal.candidate;
                await peerConnection.addIceCandidate(candidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    }
    
    setupDataChannel(dataChannel, peerId = null) {
        dataChannel.onopen = () => {
            console.log(`Data channel opened with ${peerId || 'unknown peer'}`);
            // Update the peer with the data channel if not already set
            if (peerId) {
                const peer = this.peers.get(peerId);
                if (peer) {
                    peer.dataChannel = dataChannel;
                }
            }
        };
        
        dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.displayMessage(message.text, message.sender, message.sender === this.username);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
        
        dataChannel.onclose = () => {
            console.log(`Data channel closed with ${peerId || 'unknown peer'}`);
            if (peerId) {
                this.peers.delete(peerId);
            }
        };
    }
    
    async sendSignal(signal) {
        if (!this.roomId) return;
        
        const signalData = {
            room_id: this.roomId,
            sender: this.userId,
            sender_name: this.username,
            target: signal.target || null,
            type: signal.type,
            sdp: signal.sdp || null,
            candidate: signal.candidate ? 
                (typeof signal.candidate === 'string' ? signal.candidate : JSON.stringify(signal.candidate)) : 
                null,
            created_at: new Date().toISOString()
        };
        
        try {
            await this.supabase.from('signals').insert(signalData);
        } catch (error) {
            console.error('Error sending signal:', error);
        }
    }
    
    sendMessage() {
        const messageText = this.elements.messageInput.value.trim();
        if (!messageText) return;
        
        // Create message object
        const message = {
            text: messageText,
            sender: this.username,
            timestamp: new Date().toISOString()
        };
        
        // Send to all peers
        this.broadcastMessage(message);
        
        // Display own message
        this.displayMessage(messageText, this.username, true);
        
        // Clear input
        this.elements.messageInput.value = '';
    }
    
    broadcastMessage(message) {
        // Send via data channels to all peers
        for (const [peerId, peer] of this.peers.entries()) {
            if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
                try {
                    peer.dataChannel.send(JSON.stringify(message));
                } catch (error) {
                    console.error(`Error sending message to peer ${peerId}:`, error);
                }
            } else if (peer.dataChannel && peer.dataChannel.readyState === 'connecting') {
                // Wait a bit and try again
                setTimeout(() => {
                    if (peer.dataChannel.readyState === 'open') {
                        try {
                            peer.dataChannel.send(JSON.stringify(message));
                        } catch (error) {
                            console.error(`Error sending message to peer ${peerId}:`, error);
                        }
                    }
                }, 1000);
            }
        }
    }
    
    displayMessage(text, sender, isOwn = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.textContent = sender;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        messageDiv.appendChild(headerDiv);
        messageDiv.appendChild(textDiv);
        
        this.elements.messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }
    
    copyRoomLink() {
        if (!this.roomId) {
            alert('Please join a room first');
            return;
        }
        
        const url = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = this.elements.copyLinkBtn.textContent;
            this.elements.copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.elements.copyLinkBtn.textContent = originalText;
            }, 2000);
        });
    }
    
    updateRoomStatus(status) {
        this.elements.roomStatus.textContent = status;
    }
    
    enableChat() {
        this.elements.messageInput.disabled = false;
        this.elements.sendButton.disabled = false;
        this.elements.joinRoomBtn.disabled = true;
        this.elements.roomIdInput.disabled = true;
    }
    
    generateUserId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    generateUsername() {
        const adjectives = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Silver'];
        const nouns = ['Tiger', 'Dragon', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Lion', 'Hawk', 'Shark', 'Panther'];
        const number = Math.floor(Math.random() * 100);
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adjective}${noun}${number}`;
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        this.elements.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    }
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.elements.themeToggle.textContent = '☀️';
        }
    }
    
    showMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message other';
        messageDiv.innerHTML = `<strong>System:</strong> ${text}`;
        this.elements.messagesContainer.appendChild(messageDiv);
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new P2PChat();
});