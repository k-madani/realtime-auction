package com.auction.realtime_auction.service;

import com.auction.realtime_auction.dto.CreateReviewRequest;
import com.auction.realtime_auction.dto.ReviewResponse;
import com.auction.realtime_auction.dto.UserRatingResponse;
import com.auction.realtime_auction.exception.BadRequestException;
import com.auction.realtime_auction.exception.ForbiddenException;
import com.auction.realtime_auction.exception.ResourceNotFoundException;
import com.auction.realtime_auction.model.Auction;
import com.auction.realtime_auction.model.Review;
import com.auction.realtime_auction.model.User;
import com.auction.realtime_auction.repository.AuctionRepository;
import com.auction.realtime_auction.repository.ReviewRepository;
import com.auction.realtime_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(Long auctionId, CreateReviewRequest request, String reviewerUsername) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reviewerUsername));

        if (auction.getStatus() != Auction.AuctionStatus.ENDED) {
            throw new BadRequestException("Reviews can only be submitted for completed auctions");
        }

        if (auction.getWinner() == null) {
            throw new BadRequestException("Cannot review an auction with no winner");
        }

        User seller = auction.getSeller();
        User winner = auction.getWinner();

        User reviewee;
        Review.ReviewRole revieweeRole;

        if (reviewer.getId().equals(winner.getId())) {
            reviewee = seller;
            revieweeRole = Review.ReviewRole.SELLER;
        } else if (reviewer.getId().equals(seller.getId())) {
            reviewee = winner;
            revieweeRole = Review.ReviewRole.BUYER;
        } else {
            throw new ForbiddenException("Only the seller and winner can leave reviews for this auction");
        }

        if (reviewRepository.existsByAuctionIdAndReviewerIdAndRevieweeId(
                auctionId, reviewer.getId(), reviewee.getId())) {
            throw new BadRequestException("You have already submitted a review for this transaction");
        }

        Review review = new Review();
        review.setAuction(auction);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRevieweeRole(revieweeRole);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = reviewRepository.save(review);
        updateUserRatings(reviewee.getId());

        return mapToResponse(review);
    }

    public UserRatingResponse getUserRatings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<ReviewResponse> recentReviews = reviewRepository
                .findByRevieweeIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new UserRatingResponse(
                user.getId(), user.getUsername(),
                user.getOverallRating(), user.getTotalReviews(),
                user.getSellerRating(), user.getSellerReviews(),
                user.getBuyerRating(), user.getBuyerReviews(),
                recentReviews);
    }

    public List<ReviewResponse> getAuctionReviews(Long auctionId) {
        auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        return reviewRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public boolean canReviewAuction(Long auctionId, String username) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (auction.getStatus() != Auction.AuctionStatus.ENDED) return false;
        if (auction.getWinner() == null) return false;

        boolean isParticipant = user.getId().equals(auction.getSeller().getId()) ||
                user.getId().equals(auction.getWinner().getId());
        if (!isParticipant) return false;

        Long revieweeId = user.getId().equals(auction.getWinner().getId())
                ? auction.getSeller().getId()
                : auction.getWinner().getId();

        return !reviewRepository.existsByAuctionIdAndReviewerIdAndRevieweeId(
                auctionId, user.getId(), revieweeId);
    }

    @Transactional
    protected void updateUserRatings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Double overallRating = reviewRepository.calculateOverallAverageRating(userId);
        user.setOverallRating(overallRating != null ? overallRating : 0.0);

        Double sellerRating = reviewRepository.calculateAverageRatingForRole(userId, Review.ReviewRole.SELLER);
        user.setSellerRating(sellerRating != null ? sellerRating : 0.0);
        Long sellerCount = reviewRepository.countByRevieweeIdAndRevieweeRole(userId, Review.ReviewRole.SELLER);
        user.setSellerReviews(sellerCount != null ? sellerCount.intValue() : 0);

        Double buyerRating = reviewRepository.calculateAverageRatingForRole(userId, Review.ReviewRole.BUYER);
        user.setBuyerRating(buyerRating != null ? buyerRating : 0.0);
        Long buyerCount = reviewRepository.countByRevieweeIdAndRevieweeRole(userId, Review.ReviewRole.BUYER);
        user.setBuyerReviews(buyerCount != null ? buyerCount.intValue() : 0);

        user.setTotalReviews(user.getSellerReviews() + user.getBuyerReviews());
        userRepository.save(user);
    }

    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getAuction().getId(),
                review.getAuction().getTitle(),
                review.getReviewer().getUsername(),
                review.getReviewee().getUsername(),
                review.getRevieweeRole().name(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt());
    }
}