const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'bookings.json');
const ROOM_INVENTORY = {
  'Deluxe Room': 20,
  'Premium Suite': 10
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());
app.use(express.static(__dirname));

function getBookings() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to read bookings file:', error);
    return [];
  }
}

function saveBookings(bookings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

function getRoomStatus() {
  const bookings = getBookings();
  const status = Object.fromEntries(
    Object.entries(ROOM_INVENTORY).map(([roomType, total]) => {
      const booked = bookings.filter(b => b.roomType === roomType).length;
      return [roomType, {
        total,
        booked,
        available: Math.max(0, total - booked)
      }];
    })
  );

  const totalBooked = bookings.length;
  const totalAvailable = Object.values(status).reduce((sum, room) => sum + room.available, 0);
  const totalRooms = Object.values(ROOM_INVENTORY).reduce((sum, count) => sum + count, 0);

  return { totalRooms, totalBooked, totalAvailable, status };
}

function writeBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

app.get('/content/about', (req, res) => {
  res.json({
    content: "At Luxury Paradise Resort, we blend modern comforts with timeless elegance to create memorable escapes. Nestled in stunning surroundings, our property offers beautifully appointed suites, infinity pools, bespoke spa therapies, and gourmet dining experiences. Whether you're traveling with family, celebrating as a couple, or planning a corporate retreat, our attentive team curates every detail to make your stay effortless and unforgettable."
  });
});

app.get('/content/timeless', (req, res) => {
  res.json({
    title: "TIMELESS\nMOMENTS",
    content: "Wander through our gallery and discover opulent ballrooms, serene retreats, and breathtaking landscapes designed to make every moment unforgettable."
  });
});

app.post('/bookings', (req, res) => {
  const { fullName, mobile, email, roomType, message, timestamp } = req.body;
  const chosenRoomType = ROOM_INVENTORY[roomType] ? roomType : 'Deluxe Room';

  if (!fullName || !mobile || !email) {
    return res.status(400).json({ error: 'Name, mobile, and email are required.' });
  }

  const roomStatus = getRoomStatus();
  const selectedRoom = roomStatus.status[chosenRoomType];

  if (!selectedRoom || selectedRoom.available <= 0) {
    return res.status(409).json({
      error: `${chosenRoomType} is fully booked. Please choose another room.`,
      roomStatus
    });
  }

  const booking = {
    fullName,
    mobile,
    email,
    roomType: chosenRoomType,
    message: message || '',
    timestamp: timestamp || new Date().toISOString(),
    receivedAt: new Date().toISOString()
  };

  try {
    writeBooking(booking);
    console.log('New booking received:', booking);
    return res.status(201).json({ success: true, booking, roomStatus: getRoomStatus() });
  } catch (error) {
    console.error('Failed to save booking:', error);
    return res.status(500).json({ error: 'Unable to save booking at this time.' });
  }
});

app.get('/room-status', (req, res) => {
  res.json(getRoomStatus());
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'resort.html'));
});

app.listen(PORT, () => {
  console.log(`Resort backend available at http://localhost:${PORT}`);
});
