CREATE TABLE IF NOT EXISTS public.listings
(
    listing_address character varying(48) NOT NULL,
    highest_bid bigint,
    last_bid_time timestamp without time zone,
    created_at timestamp without time zone,
    ends_at timestamp without time zone,
    CONSTRAINT listings_pkey PRIMARY KEY (listing_address)
);


CREATE TABLE IF NOT EXISTS public.notifications
(
    listing_address character varying(48)  NOT NULL,
    handle character varying(15) ,
    bidder_address character varying(48) NOT NULL,
    CONSTRAINT notifications_pkey PRIMARY KEY (listing_address, bidder_address)
);