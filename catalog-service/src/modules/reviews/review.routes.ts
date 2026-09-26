import { Router } from "express";

import {
    ReviewController,
    type ReviewParams,
    type ServiceParams,
} from "./review.controller.js";

import { authenticate } from "../../infrastructure/http/auth.middleware.js";

const router = Router();

const controller = new ReviewController();

// Public: get service rating
router.get<ServiceParams>(
    "/service/:serviceId/rating",
    (req, res, next) => {
        void controller.getServiceRating(
            req,
            res,
            next
        );
    }
);

// Public: get service reviews
router.get<ServiceParams>(
    "/service/:serviceId",
    (req, res, next) => {
        void controller.getServiceReviews(
            req,
            res,
            next
        );
    }
);

// Public: get one review
router.get<ReviewParams>(
    "/:reviewId",
    (req, res, next) => {
        void controller.getReview(
            req,
            res,
            next
        );
    }
);

// Authenticated: create review
router.post(
    "/",
    authenticate,
    (req, res, next) => {
        void controller.createReview(
            req,
            res,
            next
        );
    }
);

// Authenticated + owner: update review
router.patch<ReviewParams>(
    "/:reviewId",
    authenticate,
    (req, res, next) => {
        void controller.updateReview(
            req,
            res,
            next
        );
    }
);

// Authenticated + owner: delete review
router.delete<ReviewParams>(
    "/:reviewId",
    authenticate,
    (req, res, next) => {
        void controller.deleteReview(
            req,
            res,
            next
        );
    }
);

export default router;