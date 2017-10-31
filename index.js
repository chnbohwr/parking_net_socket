var crc = require('node-crc16');
var net = require('net');
var config = require('./config.json');
var fs = require('fs');


function padLeft(str) {
  if (str.length >= 4)
    return str;
  else
    return padLeft("0" + str, 4);
}

function d2h(d) { return (+d).toString(16); }

function carNum(d) { return padLeft(d2h(d)); }

function getData() {
  var fileData = fs.readFileSync(config.car_file).toString();
  // console.log(fileData);
  var car_now = parseInt(fileData);
  // console.log(car_now);
  var data = config.parking_num +
    '12000000060C' +
    carNum(config.car_total) +
    carNum(car_now) +
    carNum(config.moto_total) +
    carNum(0) +
    carNum(config.bus_total) +
    carNum(0);
  var sum = crc.checkSum(data);
  return data + sum;
}

var client = new net.Socket();
client.connect(53504, '61.216.159.208', function () {
  var data = getData();
  console.log('send data: ' + data);
  // client.write(data);
  client.write(data, 'hex');
});

client.on('data', function (data) {
  console.log('Received: ' + data);
  // client.destroy(); // kill client after server's response
});

client.on('close', function () {
  console.log('Connection closed');
});