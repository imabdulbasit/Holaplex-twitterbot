var dotenv = require('dotenv')
dotenv.config()
const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:process.env.DB_PORT,
});

async function getListing(listingAddress) {
  try {
    let response = await pool.query(
      "Select * from listings where listing_address = $1",
      [listingAddress]
    );
    return response.rows;
  } catch (error) {
    throw error;
  }
}

async function updateListing(highestBid, listingAddress) {
  try {
    return await pool.query(
      "UPDATE listings SET highest_bid = $1 WHERE listing_address = $2 AND highest_bid < $1",
      [highestBid, listingAddress]
    );
  } catch (error) {
    throw error;
  }
}

async function ifNotified(listingAddress, bidders) {
  try {
    let result = await pool.query(
      "Select * from notifications where listing_address = $1 AND bidder_address = ANY($2::varchar[])",
      [listingAddress, bidders]
    );
    return result;
  } catch (error) {
    throw error;
  }
}

async function insertNotification(listingAddress, handle, bidderAddress) {
  try {
    await pool.query(
      "INSERT INTO  notifications ( listing_address , handle , bidder_address) VALUES ($1, $2 , $3)",
      [listingAddress, handle, bidderAddress]
    );
  } catch (error) {
    throw error;
  }
}

async function initialize(listings) {
  try {
    await pool.query("DELETE FROM listings");
    for (var i = 0; i < listings.length; i++) {
      await pool.query(
        "INSERT INTO listings (listing_address, highest_bid, last_bid_time, created_at, ends_at) VALUES ($1, $2,$3,$4, $5)",
        [
          listings[i].listingAddress,
          listings[i].highestBid,
          listings[i].lastBidTime,
          listings[i].createdAt,
          listings[i].endsAt,
        ]
      );
    }
    console.log("listings inserted into database!");
  } catch (error) {
    throw error;
  }
}

async function updateNotification(
  handle,
  bidderAddress,
  listingAddress,
  bidderAddress
) {
  try {
    await pool.query(
      "update notifications set handle = $1 , bidder_address = $2 where listing_address = $3 AND bidder_address = $4",
      [handle, bidderAddress, listingAddress, bidderAddress]
    );
  } catch (error) {}
}

module.exports = { initialize, getListing ,updateListing,updateNotification , insertNotification , ifNotified};
