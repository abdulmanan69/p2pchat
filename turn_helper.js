// TURN Helper for Cloudflare TURN service
class TurnHelper {
    static async getTurnCredentials() {
        try {
            // Fetch TURN credentials from Cloudflare
            const response = await fetch('https://speed.cloudflare.com/turn-creds', { 
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Format the credentials for WebRTC
            const iceServers = [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.cloudflare.com:3478' }
            ];
            
            // Add TURN servers if available
            if (data.urls && data.username && data.credential) {
                // Handle both single URL and array of URLs
                if (Array.isArray(data.urls)) {
                    data.urls.forEach(url => {
                        iceServers.push({
                            urls: url,
                            username: data.username,
                            credential: data.credential
                        });
                    });
                } else {
                    iceServers.push({
                        urls: data.urls,
                        username: data.username,
                        credential: data.credential
                    });
                }
            }
            
            console.log('ICE servers configured:', iceServers);
            return iceServers;
        } catch (error) {
            console.error('Error fetching TURN credentials:', error);
            // Fallback to STUN only
            return [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.cloudflare.com:3478' }
            ];
        }
    }
    
    static async createPeerConnectionWithTurn() {
        const iceServers = await this.getTurnCredentials();
        return new RTCPeerConnection({ iceServers });
    }
}

// Export for use in other files
window.TurnHelper = TurnHelper;