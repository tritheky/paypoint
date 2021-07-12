const database = require('../database');
const transactionsService = require('../transactions/transactions.service');
const selectBookingSummary = [
  'bookings.id',
  'bookings.user',
  'bookings.index',
  'bookings.product_code',
  'bookings.max_spin',
  'users.fullname',
  'users.phone',
  'users.idcard',
  'bookings.payment_1',
  'bookings.payment_2',
  'bookings.finished',
  'users.sms_login',
  'users.sms_result',
  'users.sms_reward',
];
module.exports = {
  getAllSummary,
  getAllByUser,
  getBooking,
  updateBooking,
  nextTurnBooking,
};

async function getAllSummary(search, page, pageSize) {
  if (!page) page = 1;
  if (!pageSize) pageSize = 100;
  let bookings;
  let totalRecords;
  if (search) {
    bookings = await database
      .connection()
      .select(selectBookingSummary)
      .from('bookings')
      .join('users', 'users.id', '=', 'bookings.user')
      .where('phone', 'ilike', '%' + search + '%')
      .orWhere('product_code', 'ilike', '%' + search + '%')
      .orWhere('idcard', 'ilike', '%' + search + '%')
      .orWhereRaw(`unaccent('${search}') <% unaccent(fullname)`)
      .orderBy('bookings.index', 'asc')
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    totalRecords = await database
      .connection()
      .table('bookings')
      .join('users', 'users.id', '=', 'bookings.user')
      .where('users.phone', 'ilike', '%' + search + '%')
      .orWhere('bookings.product_code', 'ilike', '%' + search + '%')
      .orWhere('users.idcard', 'ilike', '%' + search + '%')
      .orWhereRaw(`unaccent('${search}') <% unaccent(users.fullname)`)
      .count('bookings.id as count');
  } else {
    bookings = await database
      .connection()
      .select(selectBookingSummary)
      .from('bookings')
      .join('users', 'users.id', '=', 'bookings.user')
      .orderBy('bookings.index', 'asc')
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    totalRecords = await database
      .connection()
      .table('bookings')
      .join('users', 'users.id', '=', 'bookings.user')
      .count('bookings.id as count');
  }
  const results = [];
  for (const booking of bookings) {
    var transactions = await transactionsService.getTransactionsByBooking(
      booking.id,
    );
    const dataRow = {};
    let resultReward = '';
    if (booking.finished) {
      const { max_reward_voucher, max_reward } =
        transactionsService.getMaxRewardFromTransactions(transactions);
      if (max_reward_voucher && max_reward) {
        resultReward = `${max_reward_voucher.reward_name_display} & ${max_reward.reward_name_display}`;
      } else if (max_reward_voucher) {
        resultReward = max_reward_voucher.reward_name_display;
      } else if (max_reward) {
        resultReward = max_reward.reward_name_display;
      }
    }
    dataRow[0] = booking.index;
    dataRow[1] = booking.fullname;
    dataRow[2] = booking.phone;
    dataRow[3] = booking.idcard;
    dataRow[4] = booking.product_code;
    dataRow[5] = booking.payment_1 ? booking.payment_1 : '';
    dataRow[6] = booking.payment_2 ? booking.payment_2 : '';
    let index = 7;
    for (let i = 1; i < 3; i++) {
      for (let j = 1; j < 7; j++) {
        const spined = transactions.filter(
          (m) => m.turn === i && m.spin_index === j,
        );
        dataRow[index] =
          spined.length > 0
            ? spined[0].reward_name_display
            : // ? {
              //     reward: spined[0].reward_name_display,
              //     created: spined[0].created,
              //   }
              '';
        index++;
      }
    }

    if (booking.max_spin < 6) {
      dataRow[12] = 'X';
      dataRow[18] = 'X';
    }
    dataRow[19] = resultReward;
    dataRow[20] = booking.sms_login;
    dataRow[21] = booking.sms_result;
    dataRow[22] = booking.sms_reward;
    results.push({
      booking_id: booking.id,
      user_id: booking.user,
      dataRow,
    });
  }
  const totalItems = totalRecords.length > 0 ? totalRecords[0].count : 0;
  return {
    pagination: {
      page,
      page_size: pageSize,
      max_page: Math.ceil(totalItems / pageSize),
    },
    data: results,
  };
}

async function getAllByUser(userId) {
  const bookings = await database
    .connection()
    .select('id', 'product_code', 'max_spin', 'max_turn', 'turn', 'finished')
    .from('bookings')
    .where('bookings.user', userId)
    .orderBy('id', 'asc');

  const results = [];
  for (const booking of bookings) {
    const maxSpinIndex = await transactionsService.getSpinMaxTransaction(
      booking.id,
      booking.turn,
    );
    let resultReward = null;
    if (booking.finished) {
      const currentTransaction =
        await transactionsService.getCurrentTransactionsByBooking(
          userId,
          booking.id,
        );
      if (currentTransaction) {
        if (
          currentTransaction.max_reward_voucher &&
          currentTransaction.max_reward
        ) {
          resultReward = `${currentTransaction.max_reward_voucher.reward_name_display} & ${currentTransaction.max_reward.reward_name_display}`;
        } else if (currentTransaction.max_reward_voucher) {
          resultReward =
            currentTransaction.max_reward_voucher.reward_name_display;
        } else if (currentTransaction.max_reward) {
          resultReward = currentTransaction.max_reward.reward_name_display;
        }
      }
    }
    const turnRemain = booking.finished ? 0 : booking.max_turn - booking.turn;
    const spinRemainOfCurrentTurn = booking.max_spin - maxSpinIndex;
    const totalSpinRemainOtherTurn = turnRemain * booking.max_spin;
    const spinRemain = booking.finished
      ? 0
      : totalSpinRemainOtherTurn + spinRemainOfCurrentTurn;
    results.push({
      id: booking.id,
      product_code: booking.product_code,
      max_spin: booking.max_spin,
      max_turn: booking.max_turn,
      finished: booking.finished,
      turn_remain: turnRemain + (spinRemainOfCurrentTurn > 0 ? 1 : 0), //nếu lượt quay hiện tại còn lần quay thì + 1
      spin_remain: spinRemain,
      reward_result: resultReward,
    });
  }
  return results;
}

async function getBooking(booking_id) {
  const bookings = await database
    .connection()
    .select()
    .from('bookings')
    .where({ id: booking_id });
  return bookings && bookings.length > 0 ? bookings[0] : null;
}

async function updateBooking(user_id, booking_id, data) {
  const booking = await getBooking(booking_id);
  if (!booking) throw 'Mã đặt chổ không tồn tại.';
  if (booking.user !== user_id) throw 'Không có quyền cập nhật.';
  await database
    .connection()
    .table('bookings')
    .where({ id: booking_id })
    .update(data);
  return true;
}

async function nextTurnBooking(user_id, booking_id) {
  const booking = await getBooking(booking_id);
  if (!booking) throw 'Mã đặt chổ không tồn tại.';
  if (booking.user !== user_id) throw 'Không có quyền cập nhật.';
  if (booking.turn >= booking.max_turn)
    throw 'Lượt quay kế tiếp không tồn tại.';
  await database
    .connection()
    .table('bookings')
    .where({ id: booking_id })
    .update({ turn: booking.turn + 1 });
  return true;
}
