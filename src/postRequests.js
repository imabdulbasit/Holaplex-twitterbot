var dotenv = require('dotenv')
dotenv.config()
const axios = require("axios");

async function getListings() {
  try {
    let listings = await axios.post(
        process.env.HOLAPLEX_API_ENDPOINT,
      {
        jsonrpc: "2.0",
        method: "getListings",
        params: [],
        id: " ",
      }
    );
    return listings.data.result;
  } catch (error) {
    throw error;
  }
}

async function getListingDetails(listingAddress) {
  try {
    let response = await axios.post(
        process.env.HOLAPLEX_API_ENDPOINT,
      {
        jsonrpc: "2.0",
        method: "getListingDetails",
        params: [listingAddress],
        id: " ",
      }
    );
    return response.data.result;
  } catch (error) {
    throw error;
  }
}

module.exports = { getListings, getListingDetails };
