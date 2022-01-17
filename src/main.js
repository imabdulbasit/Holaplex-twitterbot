var dotenv = require("dotenv");
dotenv.config();

const CronJob = require("cron").CronJob;

const { getHandleAndRegistryKey } = require("@bonfida/spl-name-service");
const { PublicKey, Connection } = require("@solana/web3.js");

const {
  initialize,
  getListing,
  updateListing,
  updateNotification,
  insertNotification,
  ifNotified,
} = require("./queries");

const { getListings, getListingDetails } = require("./postRequests");

const { tweet } = require("./twitterApi");

let connection = new Connection(process.env.SOLANA_ENDPOINT);

async function polling() {
  try {
    const listings = await getListings();
    process.stdout.write(`.`);

    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      const db_listing = await getListing(listing.listingAddress);
      const res = await updateListing(
        listing.highestBid,
        listing.listingAddress
      );

      if (res.rowCount == 1) {
        const listingDetails = await getListingDetails(listing.listingAddress);
        try {
          if (listingDetails.bidders.length) {
            const highestBidderAddress = listingDetails.bidders.find(
              (o) => o.lastBidAmount == db_listing[0].highest_bid
            ).bidderAddress;
            const [handle, registryKey] = await getHandleAndRegistryKey(
              connection,
              new PublicKey(highestBidderAddress)
            );

            let notification = await ifNotified(
              listing.listingAddress,
              listingDetails.bidders
            );
            if (notification.rowCount == 0) {
              console.log("new bid! ", handle);
              tweet.log("@" + handle + " outbidden! New bid: " +  listingDetails.highestBid/10E8 +" sol on " +
                listingDetails.items[0].name +
                " https://" +
                listingDetails.subdomain +
                ".holaplex.com/listings/" +
                listingDetails.listingAddress);
              await insertNotification(
                listing.listingAddress,
                handle,
                highestBidderAddress
              );
            } else {
              if (notification.data.results[0].handle == handle) {
                console.log("handle already notified!");
              } else {
                console.log("new bid! ", handle);
                tweet.log("@" + handle + " outbidden! New bid: " +  listingDetails.highestBid/10E8 +" sol on " +
                listingDetails.items[0].name +
                " https://" +
                listingDetails.subdomain +
                ".holaplex.com/listings/" +
                listingDetails.listingAddress);
                await updateNotification(
                  handle,
                  highestBidderAddress,
                  notification.data.results[0].listing_address,
                  notification.data.results[0].bidder_address
                );
              }
            }
          }
        } catch (error) {
          console.log(error);
          console.log(
            "new bid! " +
              listingDetails.highestBid/10E8 +
              " sol on " +
              listingDetails.items[0].name +
              " https://" +
              listingDetails.subdomain +
              ".holaplex.com/listings/" +
              listingDetails.listingAddress
          );
          // tweet(
          //   "New bid! " +
          //     listingDetails.highestBid/10E8 +
          //     " sol on " +
          //     listingDetails.items[0].name +
          //     " https://" +
          //     listingDetails.subdomain +
          //     ".holaplex.com/listings/" +
          //     listingDetails.listingAddress
          // );
        }
      }
    }
    initialize(listings);
  } catch (err) {
    console.log(err);
  }
}

async function main(){
initialize(await getListings());
botRunning = false;
const job3 = new CronJob("*/59 * * * * *", async () => {
  if (botRunning) {
    return;
  }
  botRunning = true;
  try {
    await polling();
    botRunning = false;
  } catch (err) {
    console.log(err);
  }
});
console.log("Twitter Bot!");

job3.start();
}

main()