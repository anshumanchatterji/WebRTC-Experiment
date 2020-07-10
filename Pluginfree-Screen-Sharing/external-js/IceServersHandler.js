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
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        }];

        var iceServers2 = [{
            urls = ['stun:3.7.84.148:3478'],
        }, {
            urls = ['turn:3.7.84.148:3478'],
            username: "secureuser", // optional
            credential: "Password@1" // optional
        }];

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();