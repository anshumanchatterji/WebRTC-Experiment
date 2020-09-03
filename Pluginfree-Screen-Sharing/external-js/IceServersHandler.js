// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        // pions: 7575
        var iceServers = [{
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp'
            ]
        }];

        var iceServers2 = [{
            urls: ['stun:3.7.84.148:3478',
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp'
            ]
        }, {
            url: 'turn:relay.backups.cz',
            credential: 'webrtc',
            username: 'webrtc'
        }, {
            url: 'turn:relay.backups.cz?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        }];

        var iceServers4 = [{
            urls: ["stun:bn-turn1.xirsys.com"]
        }, {
            username: "yxO8MTLbvLGojix48-s8tK7Ft3X50fV4xHstNIO_sysjmGxSAlGYnoeKC2vaEA87AAAAAF9QdLphbnNodW1hbmNoYXR0ZXJqZWU=",
            credential: "2e9d6748-eda0-11ea-8c2b-0242ac140004",
            urls: ["turn:bn-turn1.xirsys.com:80?transport=udp", "turn:bn-turn1.xirsys.com:3478?transport=udp", "turn:bn-turn1.xirsys.com:80?transport=tcp", "turn:bn-turn1.xirsys.com:3478?transport=tcp", "turns:bn-turn1.xirsys.com:443?transport=tcp", "turns:bn-turn1.xirsys.com:5349?transport=tcp"]
        }];

        return iceServers4;
    }

    return {
        getIceServers: getIceServers
    };
})();