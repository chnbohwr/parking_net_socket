const crc = require('./crc');
const leftPad = require('left-pad')
const net = require('net');
const config = require('./config.json');
const fs = require('fs');

const d2h = (d) => { return leftPad((+d).toString(16), 4, '0'); };
const getData = () => {
  const fileData = fs.readFileSync(config.car_file).toString();
  const car_now = parseInt(fileData);
  const data = config.parking_num +
    '12000000060C' +
    d2h(config.car_total) +
    d2h(car_now) +
    d2h(config.moto_total) +
    d2h(0) +
    d2h(config.bus_total) +
    d2h(0);
  const sum = leftPad(crc.calCrc(data).toString(16), 4, '0');
  return data + sum;
};

setInterval(() => {
  const client = new net.Socket();
  try {
    client.connect(config.port, config.ip, () => {
      const data = getData();
      console.log('send data: ' + data);
      client.write(data, 'hex');
    });
    client.on('data', (data) => {
      console.log('Received: ' + data.toString('hex'));
      client.destroy(); // kill client after server's response
    });
    client.on('close', () => {
      console.log('Connection closed');
    });
  } catch (e) {
    console.log('something error', e);
  }
}, config.timeout);

