const io = require('socket.io')();
io.on('connection', client => { console.log(client); });
io.listen(3000);