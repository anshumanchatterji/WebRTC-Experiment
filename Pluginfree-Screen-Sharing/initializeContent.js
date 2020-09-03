var _eventHandlers = {};

const addListener = (node, event, handler, capture = false) => {
    if (!(event in _eventHandlers)) {
        _eventHandlers[event] = []
    }
    // here we track the events and their nodes (note that we cannot
    // use node as Object keys, as they'd get coerced into a string
    _eventHandlers[event].push({
        node: node,
        handler: handler,
        capture: capture
    })
    node.addEventListener(event, handler, capture)
}

const removeAllListeners = (targetNode, event) => {
    // remove listeners from the matching nodes
    _eventHandlers[event]
        .filter(({
            node
        }) => node === targetNode)
        .forEach(({
            node,
            handler,
            capture
        }) => node.removeEventListener(event, handler, capture))

    // update _eventHandlers global
    _eventHandlers[event] = _eventHandlers[event].filter(
        ({
            node
        }) => node !== targetNode,
    )
}

var videosContainer = document.getElementById("mainVideoContainer") || document.body;
var config = {
    openSocket: function(config) {
        // var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
        //var SIGNALING_SERVER = 'https://dev1-browsercloud-in.pcloudy.com/';
        var SIGNALING_SERVER = window.location.origin + '/';
        console.log("SIGNALING_SERVER: " + SIGNALING_SERVER + 'SIGNALING_SERVER/socket.io');
        config.channel = config.channel || findGetParameter('roomToken');

        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER, {
            resource: 'SIGNALING_SERVER/socket.io'
        }).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + config.channel, {
            resource: 'SIGNALING_SERVER/socket.io'
        });
        socket.channel = config.channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);

    },
    onRemoteStream: function(media) {
        if (isbroadcaster) return;
        console.log('************ on remote stream ****************');
        var video = media.video;
        videosContainer.insertBefore(video, videosContainer.firstChild);

        if (video.canPlayType('video/ogg').length > 0) {
            video.setAttribute("id", "mainVideoElementClient");
            video.muted = true;
            video.volume = 0;

            if (video.hasAttribute("controls")) {
                video.removeAttribute("controls");
            }
            console.log('inside capture user media ---- check support');
            console.log('trying to add auto play');

            try {
                if (document.referrer !== "" && document.referrer !== undefined) {
                    var url = new URL(document.referrer);
                } else {
                    var url = new URL(window.location.href);
                }

                var target = url.protocol + "//" + url.host;
                window.parent.postMessage({
                    "action": "connection_status",
                    "message": 'connected'
                }, target);
            } catch (e) {
                console.log(e);
            }

            try {
                if (document.referrer !== "" && document.referrer !== undefined) {
                    var url = new URL(document.referrer);
                } else {
                    var url = new URL(window.location.href);
                }
                var mainVideoElementID = document.getElementById('mainVideoElementClient');

                console.log("mainVideoElementIDWidth2222222222222222222" + mainVideoElementID.clientWidth);
                console.log("mainVideoElementIDHeight222222222222222222" + mainVideoElementID.clientHeight);

                var target = url.protocol + "//" + url.host;
                var videoContainer = document.getElementById('mainVideoContainer');
                var videoContainerWidth = videoContainer.clientWidth;
                var videoContainerHeight = videoContainer.clientHeight;
                window.parent.postMessage({
                    "action": "video_container_stat",
                    "message": {
                        "width": videoContainerWidth,
                        "height": videoContainerHeight
                    }
                }, target);
            } catch (e) {
                console.log(e);
            }
        }
    },
    onRoomFound: function(room) {
        if (isbroadcaster) return;

        console.log('************ on room found conference ui ****************: ROOM:' + JSON.stringify(room));
        conferenceUI.joinRoom({
            roomToken: room.roomToken,
            joinUser: room.broadcaster
        });
    },
    onNewParticipant: function(numberOfParticipants) {
        var text = numberOfParticipants + ' users are viewing your screen!';

        if (numberOfParticipants <= 0) {
            text = 'No one is viewing your screen YET.';
        } else if (numberOfParticipants == 1) {
            text = 'Only one user is viewing your screen!';
        }

        document.title = text;
        showErrorMessage(document.title, 'green');
    },
    oniceconnectionstatechange: function(state) {
        var text = '';

        if (state == 'closed' || state == 'disconnected') {
            text = 'One of the participants just left.';
            document.title = text;
            showErrorMessage(document.title);
            try {
                if (document.referrer !== "" && document.referrer !== undefined) {
                    var url = new URL(document.referrer);
                } else {
                    var url = new URL(window.location.href);
                }
                var target = url.protocol + "//" + url.host;
                window.parent.postMessage({
                    "action": "connection_status",
                    "message": state
                }, target);
            } catch (e) {
                console.log(e);
            }
        }

        if (state == 'failed') {
            text = 'Failed to bypass Firewall rules. It seems that target user did not receive your screen. Please ask him reload the page and try again.';
            document.title = text;
            showErrorMessage(document.title);
            try {
                if (document.referrer !== "" && document.referrer !== undefined) {
                    var url = new URL(document.referrer);
                } else {
                    var url = new URL(window.location.href);
                }
                var target = url.protocol + "//" + url.host;
                window.parent.postMessage({
                    "action": "connection_status",
                    "message": state
                }, target);
            } catch (e) {
                console.log(e);
            }
        }

        if (state == 'connected' || state == 'completed') {
            text = 'A user successfully received your screen.';
            document.title = text;
            showErrorMessage(document.title, 'green');
            try {
                if (document.referrer !== "" && document.referrer !== undefined) {
                    var url = new URL(document.referrer);
                } else {
                    var url = new URL(window.location.href);
                }
                var target = url.protocol + "//" + url.host;
                window.parent.postMessage({
                    "action": "connection_status",
                    "message": 'connected'
                }, target);
            } catch (e) {
                console.log(e);
            }
        }

        if (state == 'new' || state == 'checking') {
            text = 'Someone is trying to join you.';
            document.title = text;
            showErrorMessage(document.title, 'green');
            try {
                if (document.referrer !== "" && document.referrer !== undefined) {
                    var url = new URL(document.referrer);
                } else {
                    var url = new URL(window.location.href);
                }
                var target = url.protocol + "//" + url.host;
                window.parent.postMessage({
                    "action": "connection_status",
                    "message": state
                }, target);
            } catch (e) {
                console.log(e);
            }
        }
    }
};

/* UI specific */
var conferenceUI = conference(config);

if (findGetParameter('mode') == 'broadcaster') {
    console.log('inside broadcaster');
    window.onload = function() {
        console.log('inside broadcaster ---- on load');

        console.log('inside broadcaster: videosContainer' + videosContainer);
        var roomName = document.getElementById('room-name') || {};
        console.log('inside broadcaster: roomName' + roomName);
        roomName.disabled = true;
        captureUserMedia(function() {
            console.log('inside broadcaster: captureUserMedia');
            conferenceUI.createRoom({
                roomName: (roomName.value || 'Anonymous') + ' shared his screen with you'
            });
        });
        this.disabled = true;

        console.log('inside broadcaster: ---- going to enter post message');
        try {
            console.log('inside broadcaster: ---- inside try');
            if (document.referrer !== "" && document.referrer !== undefined) {
                var url = new URL(document.referrer);
            } else {
                var url = new URL(window.location.href);
            }
            var target = url.protocol + "//" + url.host;
            window.parent.postMessage({
                "action": "connection_status",
                "message": 'connected'
            }, target);
        } catch (e) {
            console.log(e);
        }
    }
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

function showErrorMessage(error, color) {
    console.error(error);
}

function getDisplayMediaError(error) {
    if (location.protocol === 'http:') {
        showErrorMessage('Please test this WebRTC experiment on HTTPS.');
    } else {
        showErrorMessage(error.toString());
    }
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute("id", "mainVideoElement");
    video.muted = true;
    video.volume = 0;

    console.log('inside capture user media');

    try {
        console.log('inside capture user media ---- try');
        video.setAttributeNode(document.createAttribute('autoplay'));
        video.setAttributeNode(document.createAttribute('playsinline'));
        video.setAttributeNode(document.createAttribute('muted'));
    } catch (e) {
        console.log('inside capture user media ---- catch');
        video.setAttribute('autoplay', true);
        video.setAttribute('playsinline', true);
    }

    if (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
        console.log('inside capture user media ---- inside if of navigator media type');

        function onGettingSteam(stream) {
            console.log('inside capture user media ---- inside if of navigator media type ***** on getting stream');
            video.srcObject = stream;
            videosContainer.insertBefore(video, videosContainer.firstChild);

            console.log('Streeeeeeeeeeeeeaaaaaammmmmmmmmmm:' + stream);

            addStreamStopListener(stream, function() {
                location.reload();
            });

            config.attachStream = stream;
            callback && callback();
            //rotateVideo(video);

            addStreamStopListener(stream, function() {
                location.reload();
            });

            if (video.canPlayType('video/ogg').length > 0) {
                console.log('inside capture user media ---- check support');
                console.log('trying to add auto play');
                video.autoplay = true;
            }
        }

        if (navigator.mediaDevices.getDisplayMedia) {
            console.log('inside capture user media ---- inside if of navigator media type ***** if of navigator.mediaDevices.getDisplayMedia');
            navigator.mediaDevices.getDisplayMedia({
                video: true
            }).then(stream => {
                onGettingSteam(stream);
            }, getDisplayMediaError).catch(getDisplayMediaError);
        } else if (navigator.getDisplayMedia) {
            console.log('inside capture user media ---- inside if of navigator media type ***** else if of navigator.getDisplayMedia');
            navigator.getDisplayMedia({
                video: true
            }).then(stream => {
                onGettingSteam(stream);
            }, getDisplayMediaError).catch(getDisplayMediaError);
        }
    } else {

        console.log('inside capture user media ---- inside else of navigator media type');
        if (DetectRTC.browser.name === 'Chrome') {
            if (DetectRTC.browser.version == 71) {
                showErrorMessage('Please enable "Experimental WebPlatform" flag via chrome://flags.');
            } else if (DetectRTC.browser.version < 71) {
                showErrorMessage('Please upgrade your Chrome browser.');
            } else {
                showErrorMessage('Please make sure that you are not using Chrome on iOS.');
            }
        }

        if (DetectRTC.browser.name === 'Firefox') {
            showErrorMessage('Please upgrade your Firefox browser.');
        }

        if (DetectRTC.browser.name === 'Edge') {
            showErrorMessage('Please upgrade your Edge browser.');
        }

        if (DetectRTC.browser.name === 'Safari') {
            showErrorMessage('Safari does NOT supports getDisplayMedia API yet.');
        }
    }
}

var videoContainer = document.getElementById('mainVideoContainer');
var clientViewportWidth = videoContainer.clientWidth;
var clientViewportHeight = videoContainer.clientHeight;

var webSocketClientCounter = 0;

bindEvent(window, 'message', function(e) {
    console.log(e.data);
    if (e.data !== undefined && e.data.hasOwnProperty('action') && e.data.action != null && (e.data.action == "set_client_viewport" || e.data.action == "recalibrate_client_viewport")) {
        var instance_id = e.data.message.instance_id;
        clientViewportWidth = e.data.message.viewportWidth;
        clientViewportHeight = e.data.message.viewportHeight;

        var relay_server_url = e.data.message.main_relay_server_url;

        videoContainer.style.width = clientViewportWidth + "px";
        videoContainer.style.height = clientViewportHeight + "px";


        console.log('RecievedvideoContainerWidth : ' + clientViewportWidth);
        console.log('RecievedvideoContainerHeight : ' + clientViewportHeight);
        console.log('videoContainerWidth : ' + videoContainer.offsetWidth);
        console.log('videoContainerHeight : ' + videoContainer.offsetHeight);

        var mainVideoElementID = document.getElementById('mainVideoElementClient');

        console.log("mainVideoElementIDWidth1111" + mainVideoElementID.clientWidth);
        console.log("mainVideoElementIDHeight111" + mainVideoElementID.clientHeight);

        if (e.data.action == "recalibrate_client_viewport") {
            var recalibrateStatus = true;
            calibrateEvents(instance_id, relay_server_url, clientViewportWidth, clientViewportHeight, recalibrateStatus);
        }

        addListener(mainVideoElementID, "loadedmetadata", function(e) {
            console.log("mainVideoElementIDWidth33333333333333333333333" + mainVideoElementID.clientWidth);
            console.log("mainVideoElementIDHeight3333333333333333333333" + mainVideoElementID.clientHeight);
            clientViewportWidth = this.clientWidth,
                clientViewportHeight = this.clientHeight;
            var recalibrateStatus = false;
            calibrateEvents(instance_id, relay_server_url, clientViewportWidth, clientViewportHeight, recalibrateStatus);

        }, false);
    } else if (e.data !== undefined && e.data.hasOwnProperty('action') && e.data.action != null && e.data.action == "sendClipboardDataToBrowserNodeActual") {
        if ("WebSocket" in window) {
            var relay_server_url = e.data.message.main_relay_server_url;
            var instance_id = e.data.message.instance_id;
            var webSocket = new WebSocket(relay_server_url + '/browserCloud/ws/', "echo-protocol");

            webSocket.onopen = function() {
                console.log("Message is sent..." + e.data.message.clipboardData);
                webSocket.send(JSON.stringify({
                    "messageType": "SendCommandToBrowserNode",
                    "instance_id": instance_id,
                    "command": "typeText",
                    "text": e.data.message.clipboardData
                }));
            };

            webSocket.onmessage = function(evt) {
                var received_msg = evt.data;
                console.log("Message is received...");
            };

            webSocket.onclose = function() {
                // websocket is closed.
                console.log("Connection is closed for clipboard...");
            };
        }
    } else {
        console.log(JSON.stringify(e));
    }
});

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

function calibrateEvents(instance_id, relay_server_url, clientViewportWidth, clientViewportHeight, recalibrateStatus) {
    var mainVideoElementID = document.getElementById('mainVideoElementClient');

    if (recalibrateStatus == true) {
        clientViewportWidth = mainVideoElementID.clientWidth;
        clientViewportHeight = mainVideoElementID.clientHeight;

        removeAllListeners(mainVideoElementID, 'mousemove');
        removeAllListeners(mainVideoElementID, 'mousedown');
        removeAllListeners(mainVideoElementID, 'contextmenu');
        removeAllListeners(mainVideoElementID, 'dblclick');
        removeAllListeners(mainVideoElementID, 'wheel');
        removeAllListeners(mainVideoElementID, 'mouseup');
        removeAllListeners(document, 'keydown');
    }

    if ("WebSocket" in window) {
        var webSocket = new WebSocket(relay_server_url + '/browserCloud/ws/', "echo-protocol");

        webSocket.onopen = function() {
            webSocketClientCounter++;
            webSocket.send(JSON.stringify({
                "messageType": "SendCommandToBrowserNode",
                "instance_id": instance_id
            }));

            videoContainerWidth = videoContainer.clientWidth;

            mainVideoElementWidth = clientViewportWidth;
            mainVideoElementLeft = (videoContainerWidth - mainVideoElementWidth) / 2;

            let drag = false;

            addListener(mainVideoElementID, 'mousedown', () => drag = false);

            addListener(mainVideoElementID, 'mousemove', (event) => {

                if (event.buttons != 0) {
                    drag = true;
                }
                /*console.log(JSON.stringify({
                    "messageType": "SendCommandToBrowserNode",
                    "instance_id": instance_id,
                    "command": "mouseMove",
                    "sourceX": event.pageX - (mainVideoElementLeft - 1),
                    "sourceY": event.pageY,
                    "sourceWidth": clientViewportWidth,
                    "sourceHeight": clientViewportHeight,
                    "buttons": event.buttons
                }));*/
                webSocket.send(JSON.stringify({
                    "messageType": "SendCommandToBrowserNode",
                    "instance_id": instance_id,
                    "command": "mouseMove",
                    "sourceX": event.pageX - (mainVideoElementLeft - 1),
                    "sourceY": event.pageY,
                    "sourceWidth": clientViewportWidth,
                    "sourceHeight": clientViewportHeight,
                    "buttons": event.buttons
                }));
            });

            addListener(mainVideoElementID, 'contextmenu', function(event) {
                event.preventDefault();
                return false;
            }, false);

            addListener(mainVideoElementID, "dblclick", function(event) {
                webSocket.send(JSON.stringify({
                    "messageType": "SendCommandToBrowserNode",
                    "instance_id": instance_id,
                    "command": "mouseDoubleClick",
                    "sourceX": event.pageX - (mainVideoElementLeft - 1),
                    "sourceY": event.pageY,
                    "sourceWidth": clientViewportWidth,
                    "sourceHeight": clientViewportHeight
                }));
            });

            addListener(mainVideoElementID, "wheel", onWheelScrollEventFunction);

            function onWheelScrollEventFunction(event) {
                console.log('**** Mouse scroll event cartured' + JSON.stringify(event));
                webSocket.send(JSON.stringify({
                    "messageType": "SendCommandToBrowserNode",
                    "instance_id": instance_id,
                    "command": "scrollMouse",
                    "scrollX": -(event.deltaX),
                    "scrollY": -(event.deltaY),
                    "sourceWidth": clientViewportWidth,
                    "sourceHeight": clientViewportHeight
                }));
            }

            addListener(mainVideoElementID, 'mouseup', (event) => {
                if (drag) {
                    drag = false;
                    return false;
                }
                switch (event.button) {
                    case 0:
                        webSocket.send(JSON.stringify({
                            "messageType": "SendCommandToBrowserNode",
                            "instance_id": instance_id,
                            "command": "mouseLeftClick",
                            "sourceX": event.pageX - (mainVideoElementLeft - 1),
                            "sourceY": event.pageY,
                            "sourceWidth": clientViewportWidth,
                            "sourceHeight": clientViewportHeight
                        }));
                        break;
                    case 1:
                        webSocket.send(JSON.stringify({
                            "messageType": "SendCommandToBrowserNode",
                            "instance_id": instance_id,
                            "command": "mouseMiddleClick",
                            "sourceX": event.pageX - (mainVideoElementLeft - 1),
                            "sourceY": event.pageY,
                            "sourceWidth": clientViewportWidth,
                            "sourceHeight": clientViewportHeight
                        }));
                        break;
                    case 2:
                        webSocket.send(JSON.stringify({
                            "messageType": "SendCommandToBrowserNode",
                            "instance_id": instance_id,
                            "command": "mouseRightClick",
                            "sourceX": event.pageX - (mainVideoElementLeft - 1),
                            "sourceY": event.pageY,
                            "sourceWidth": clientViewportWidth,
                            "sourceHeight": clientViewportHeight
                        }));
                        break;
                    default:
                        break;
                }
            });

            addListener(document, "keydown", function(event) {
                console.log(event);

                var sendModifier = [];
                if (event.altKey) {
                    sendModifier.push("alt");
                }

                if (event.ctrlKey) {
                    sendModifier.push("command");
                    if (event.key == "v") {
                        console.log("*****************welcome******************************");
                        if (document.referrer !== "" && document.referrer !== undefined) {
                            var url = new URL(document.referrer);
                        } else {
                            var url = new URL(window.location.href);
                        }
                        var target = url.protocol + "//" + url.host;
                        window.parent.postMessage({
                            "action": "sendClipboardDataToBrowserNode",
                            "message": 'read'
                        }, target);
                        return;
                    }
                }

                if (event.shiftKey) {
                    sendModifier.push("shift");
                }

                if (event.metaKey) {
                    sendModifier.push("meta");
                }

                var eventKey = event.key.toLowerCase();

                var msg = JSON.stringify({
                    "messageType": "SendCommandToBrowserNode",
                    "instance_id": instance_id,
                    "command": "keyEvent",
                    "key": eventKey,
                    "keyState": "down",
                    "modifier": sendModifier
                });

                console.log(msg);
                webSocket.send(msg);
                if(event.key == "Tab"){
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }

        webSocket.onmessage = function(evt) {
            var received_msg = evt.data;
            console.log("Message is received...");
        };

        webSocket.onclose = function() {
            console.log("Connection is closed...");
        };
    } else {
        // The browser doesn't support WebSocket
        console.log("WebSocket NOT supported by your Browser!");
    }
}