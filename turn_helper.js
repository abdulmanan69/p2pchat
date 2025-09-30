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
                    // Check if it's the specific Cloudflare TURN server we identified
                    if (data.urls.includes('turn.speed.cloudflare.com:50000')) {
                        console.log('Using specific Cloudflare TURN server:', data.urls);
                    }
                    
                    iceServers.push({
                        urls: data.urls,
                        username: data.username,
                        credential: data.credential
                    });
                }
                console.log('TURN servers added:', data.urls);
            } else {
                console.log('No TURN servers available in response');
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
    
    // Method to test TURN connectivity with more detailed feedback
    static async testTurnConnectivity() {
        try {
            console.log('Testing TURN connectivity...');
            const iceServers = await this.getTurnCredentials();
            
            const results = {
                iceServers: iceServers,
                candidates: [],
                candidateTypes: {},
                states: [],
                error: null
            };
            
            const pc = new RTCPeerConnection({ iceServers });
            
            // Track state changes
            pc.oniceconnectionstatechange = () => {
                results.states.push({
                    time: new Date().toISOString(),
                    state: pc.iceConnectionState
                });
                console.log('ICE Connection State:', pc.iceConnectionState);
            };
            
            pc.onconnectionstatechange = () => {
                console.log('Connection State:', pc.connectionState);
            };
            
            // Handle ICE gathering state
            pc.onicegatheringstatechange = () => {
                console.log('ICE Gathering State:', pc.iceGatheringState);
            };
            
            // Collect ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    results.candidates.push(event.candidate);
                    const type = event.candidate.type;
                    results.candidateTypes[type] = (results.candidateTypes[type] || 0) + 1;
                    console.log('ICE Candidate:', event.candidate.type, event.candidate.address, event.candidate.port);
                }
            };
            
            // Create a dummy data channel to trigger ICE
            const dataChannel = pc.createDataChannel('test');
            
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            // Wait for candidates to gather (increased timeout)
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            pc.close();
            
            return results;
        } catch (error) {
            console.error('TURN connectivity test failed:', error);
            return {
                error: error.message,
                iceServers: [],
                candidates: [],
                candidateTypes: {},
                states: []
            };
        }
    }
    
    // Method to test with specific Cloudflare TURN server
    static async testSpecificTurnServer() {
        try {
            const results = {
                candidates: [],
                candidateTypes: {},
                states: [],
                error: null
            };
            
            // Use specific Cloudflare TURN server configuration
            const iceServers = [
                { urls: 'stun:stun.l.google.com:19302' },
                { 
                    urls: 'turn:turn.speed.cloudflare.com:50000', 
                    username: 'test', 
                    credential: 'test' 
                }
            ];
            
            const pc = new RTCPeerConnection({ iceServers });
            
            // Track state changes
            pc.oniceconnectionstatechange = () => {
                results.states.push({
                    time: new Date().toISOString(),
                    state: pc.iceConnectionState
                });
                console.log('ICE Connection State (Specific TURN):', pc.iceConnectionState);
            };
            
            // Collect ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    results.candidates.push(event.candidate);
                    const type = event.candidate.type;
                    results.candidateTypes[type] = (results.candidateTypes[type] || 0) + 1;
                    console.log('Specific TURN ICE Candidate:', event.candidate.type, event.candidate.address, event.candidate.port);
                }
            };
            
            // Create a dummy data channel to trigger ICE
            const dataChannel = pc.createDataChannel('test');
            
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            // Wait for candidates to gather
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            pc.close();
            
            return results;
        } catch (error) {
            console.error('Specific TURN server test failed:', error);
            return {
                error: error.message,
                candidates: [],
                candidateTypes: {},
                states: []
            };
        }
    }
}

// Export for use in other files
window.TurnHelper = TurnHelper;