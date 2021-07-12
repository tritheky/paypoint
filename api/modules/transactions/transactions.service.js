const database = require('../database');

module.exports = {
  getMaxRewardFromTransactions,
  getTransactionsByBooking,
  getCurrentTransactionsByBooking,
  insertTransaction,
  getSpinMaxTransaction,
  clearTransactions,
};

function getMaxRewardFromTransactions(transactions) {
  const maxRewardVouchers = transactions
    .filter((m) => m.reward_voucher)
    .sort((a, b) => b.reward_value - a.reward_value);
  const maxRewards = transactions
    .filter((m) => !m.reward_voucher)
    .sort((a, b) => b.reward_value - a.reward_value);
  const max_reward_voucher =
    maxRewardVouchers && maxRewardVouchers.length > 0
      ? maxRewardVouchers[0]
      : null;
  const max_reward = maxRewards && maxRewards.length > 0 ? maxRewards[0] : null;
  return {
    max_reward_voucher,
    max_reward,
  };
}

async function getBooking(booking_id) {
  var bookings = await database
    .connection()
    .select()
    .from('bookings')
    .where({ id: booking_id });
  return bookings && bookings.length > 0 ? bookings[0] : null;
}

async function getBookingsByUser(user_id) {
  var bookings = await database
    .connection()
    .select()
    .from('bookings')
    .where({ user: user_id });
  return bookings;
}

async function getTransactionsByBooking(booking_id) {
  if (!booking_id) throw 'Mã đặt chổ không tồn tại.';

  const transactions = await database
    .connection()
    .select(
      'transactions.turn',
      'transactions.spin_index',
      'transactions.reward as reward_id',
      'rewards.name as reward_name',
      'rewards.name_display as reward_name_display',
      'rewards.value as reward_value',
      'rewards.voucher as reward_voucher',
      'transactions.created',
    )
    .from('transactions')
    .join('rewards', 'rewards.id', '=', 'transactions.reward')
    .where({
      booking: booking_id,
    })
    .orderBy([{ column: 'turn' }, { column: 'spin_index' }]);
  return transactions;
}

async function getCurrentTransactionsByBooking(user_id, booking_id) {
  const booking = await getBooking(booking_id);
  if (!booking) throw 'Mã đặt chổ không tồn tại.';
  if (booking.user !== user_id) throw 'Không có quyền truy cập.';

  const transactions = await database
    .connection()
    .select(
      'transactions.spin_index',
      'transactions.reward as reward_id',
      'rewards.name as reward_name',
      'rewards.name_display as reward_name_display',
      'rewards.value as reward_value',
      'rewards.voucher as reward_voucher',
      'transactions.created',
    )
    .from('transactions')
    .join('rewards', 'rewards.id', '=', 'transactions.reward')
    .where({
      booking: booking.id,
      turn: booking.turn,
    })
    .orderBy('spin_index', 'asc');

  const maxSpinIndex = await getSpinMaxTransaction(booking.id, booking.turn);
  const spinRemainOfCurrentTurn = booking.max_spin - maxSpinIndex;
  const { max_reward_voucher, max_reward } =
    getMaxRewardFromTransactions(transactions);
  return {
    max_spin: booking.max_spin,
    turn_remain: booking.finished
      ? 0
      : booking.max_turn - booking.turn + (spinRemainOfCurrentTurn > 0 ? 1 : 0), //nếu lượt quay hiện tại còn lần quay thì + 1
    max_reward_voucher,
    max_reward,
    transactions: transactions,
  };
}

async function getSpinMaxTransaction(booking_id, turn) {
  const transactions = await database
    .connection()
    .max('spin_index as spin_index_max')
    .from('transactions')
    .where({
      booking: booking_id,
      turn: turn,
    });
  return transactions && transactions.length > 0
    ? transactions[0].spin_index_max
    : 0;
}

async function insertTransaction(user_id, booking_id, reward_id) {
  if (!booking_id || !reward_id) throw 'Dữ liệu vào không hợp lệ.';
  const booking = await getBooking(booking_id);
  if (!booking) throw 'Mã đặt chổ không tồn tại.';
  if (booking.user !== user_id) throw 'Không có quyền cập nhật.';
  if (booking.finished) throw 'Đã kết thúc lượt quay.';
  const maxIndex = await getSpinMaxTransaction(booking.id, booking.turn);
  if (booking.max_spin <= maxIndex) throw 'Đã hết lượt quay.';
  try {
    await database
      .connection()
      .table('transactions')
      .insert({
        booking: booking.id,
        turn: booking.turn,
        spin_index: maxIndex + 1,
        reward: reward_id,
      });
    return await getCurrentTransactionsByBooking(user_id, booking_id);
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function clearTransactions(user_id) {
  if (!user_id) throw 'Không có quyền cập nhật.';
  const bookings = await getBookingsByUser(user_id);
  bookings.forEach(async (booking) => {
    await database
      .connection()
      .table('transactions')
      .where('booking', booking.id)
      .del();
    await database
      .connection()
      .table('bookings')
      .where({ id: booking.id })
      .update({ turn: 1, finished: false });
  });
  return true;
}
