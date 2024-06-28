/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatRequest } from '../models/ChatRequest';
import type { ChatResponse } from '../models/ChatResponse';
import type { MealPlanRequest } from '../models/MealPlanRequest';
import type { MealPlanResponse } from '../models/MealPlanResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LlmService {

    /**
     * Chat with AI
     * Get answers to your questions from the AI.
     * @returns ChatResponse Successful Response
     * @throws ApiError
     */
    public static chatWithAi({
        requestBody,
    }: {
        requestBody: ChatRequest,
    }): CancelablePromise<ChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/llm/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Generate meal plan
     * Generate a meal plan based on selected diets and available vegetables.
     * @returns MealPlanResponse Successful Response
     * @throws ApiError
     */
    public static generateMealPlan({
        requestBody,
    }: {
        requestBody: MealPlanRequest,
    }): CancelablePromise<MealPlanResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/llm/meal-plan',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
