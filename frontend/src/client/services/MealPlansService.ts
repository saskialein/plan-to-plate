/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealPlanCreate } from '../models/MealPlanCreate';
import type { MealPlanOut } from '../models/MealPlanOut';
import type { MealPlansOut } from '../models/MealPlansOut';
import type { Message } from '../models/Message';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MealPlansService {

    /**
     * Create Meal Plan
     * Create new meal plan.
     * @returns MealPlanOut Successful Response
     * @throws ApiError
     */
    public static createMealPlan({
        requestBody,
    }: {
        requestBody: MealPlanCreate,
    }): CancelablePromise<MealPlanOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/meal-plans/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Meal Plans
     * Retrieve meal plans.
     * @returns MealPlansOut Successful Response
     * @throws ApiError
     */
    public static readMealPlans({
        skip,
        limit = 100,
    }: {
        skip?: number,
        limit?: number,
    }): CancelablePromise<MealPlansOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/meal-plans/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Meal Plan
     * Delete a meal plan.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteMealPlan({
        id,
    }: {
        id: number,
    }): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/meal-plans/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
