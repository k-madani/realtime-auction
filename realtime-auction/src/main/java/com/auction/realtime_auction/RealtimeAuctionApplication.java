package com.auction.realtime_auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RealtimeAuctionApplication {

	public static void main(String[] args) {
		SpringApplication.run(RealtimeAuctionApplication.class, args);
	}

}
