const database = require('../database');
const readXlsxFile = require('read-excel-file/node');
const {
  DEFAULT_MAX_SPIN,
  DEFAULT_MAX_TURN,
  DEFAULT_TURN_TIME,
} = require('../constants');
const path = require('path');
const fs = require('fs');
const uploadsDir = path.resolve(__dirname, '..', '..', 'assets');
const { cryptPassword } = require('../users/users.service');

module.exports = {
  uploadBookings,
  uploadUsers,
};

async function uploadBookings(file) {
  try {
    if (!file) throw 'Tệp tải lên là bắt buộc.';
    let path = `${uploadsDir}/${file.filename}`;
    const rows = await readXlsxFile(path);
    // skip header
    rows.shift();
    let bookings = [];
    rows.forEach((row) => {
      let booking = {
        index: row[0],
        block: row[1],
        product_code: row[2],
        orientation: row[3],
        floor: row[4],
        room_type: row[5],
        built_up_area: row[6],
        carpet_area: row[7],
        price: row[8],
        price_vat: row[9],
        max_spin: DEFAULT_MAX_SPIN,
        turn: DEFAULT_TURN_TIME,
        max_turn: DEFAULT_MAX_TURN,
      };
      bookings.push(booking);
    });
    await database
      .connection()
      .table('bookings')
      .insert(bookings)
      .onConflict('product_code')
      .merge([
        'index',
        'block',
        'orientation',
        'floor',
        'room_type',
        'built_up_area',
        'carpet_area',
        'price',
        'price_vat',
      ]);
    fs.unlinkSync(path);
    return true;
  } catch (error) {
    console.error(error);
    throw 'Could not upload the file: ' + file.originalname;
  }
}

async function uploadUsers(file) {
  try {
    if (!file) throw 'Tệp tải lên là bắt buộc.';
    let path = `${uploadsDir}/${file.filename}`;
    const rows = await readXlsxFile(path);
    // skip header
    rows.shift();
    rows.forEach(async (row) => {
      if (row[2] && row[3]) {
        const product_code = row[4];
        const payment_1 = row[5];
        const payment_2 = row[6];
        const update_spin_time = row[7];
        const phone =
          row[2] && row[2].toString().length == 9
            ? '0' + row[2].toString()
            : row[2].toString();
        const password = await cryptPassword(phone);
        let user = {
          index: row[0],
          fullname: row[1],
          phone: phone,
          idcard: row[3].toString(),
          username: row[3].toString().split('/')[0],
          password: password,
        };

        const userInserts = await database
          .connection()
          .table('users')
          .insert(user, ['id'])
          .onConflict('username')
          .merge(['index', 'fullname', 'phone', 'idcard', 'password']);

        const bookingDataUpdate = {
          user: userInserts[0].id,
          payment_1: payment_1,
          payment_2: payment_2,
        };
        if (payment_1 && payment_2) {
          bookingDataUpdate['max_turn'] = 2;
        }
        const bookingsUpdated = await database
          .connection()
          .table('bookings')
          .where({ product_code: product_code })
          .update(bookingDataUpdate, ['id', 'max_spin', 'finished']);

        if (
          update_spin_time &&
          bookingsUpdated.length > 0 &&
          bookingsUpdated[0].max_spin < update_spin_time
        ) {
          //cộng thêm lần quay cho lượt quay hiện tại
          await database
            .connection()
            .table('bookings')
            .where({ id: bookingsUpdated[0].id })
            .update(
              {
                finished: false,
                max_spin: update_spin_time,
              },
              ['id'],
            );
        }
      }
    });
    fs.unlinkSync(path);
    return true;
  } catch (error) {
    console.error(error);
    throw 'Could not upload the file: ' + file.originalname;
  }
}
