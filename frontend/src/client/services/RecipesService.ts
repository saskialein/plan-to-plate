/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_recipes_add_comment } from '../models/Body_recipes_add_comment';
import type { CommentOut } from '../models/CommentOut';
import type { FileRequest } from '../models/FileRequest';
import type { Message } from '../models/Message';
import type { RecipeOut } from '../models/RecipeOut';
import type { RecipesOut } from '../models/RecipesOut';
import type { RecipeUpdate } from '../models/RecipeUpdate';
import type { URLRequest } from '../models/URLRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RecipesService {

    /**
     * Create Recipe
     * Create new recipe.
     * @returns RecipeOut Successful Response
     * @throws ApiError
     */
    public static createRecipe(): CancelablePromise<RecipeOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recipes/',
        });
    }

    /**
     * Read Recipes
     * Retrieve recipes.
     * @returns RecipesOut Successful Response
     * @throws ApiError
     */
    public static readRecipes({
        skip,
        limit = 100,
    }: {
        skip?: number,
        limit?: number,
    }): CancelablePromise<RecipesOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recipes/',
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
     * Read Recipe
     * Get a recipe by ID.
     * @returns RecipeOut Successful Response
     * @throws ApiError
     */
    public static readRecipe({
        recipeId,
    }: {
        recipeId: number,
    }): CancelablePromise<RecipeOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Recipe
     * Update a recipe.
     * @returns RecipeOut Successful Response
     * @throws ApiError
     */
    public static updateRecipe({
        recipeId,
        requestBody,
    }: {
        recipeId: number,
        requestBody: RecipeUpdate,
    }): CancelablePromise<RecipeOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Recipe
     * Delete a recipe.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteRecipe({
        recipeId,
    }: {
        recipeId: number,
    }): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Generate Signed Url Endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static generateSignedUrlEndpoint({
        requestBody,
    }: {
        requestBody: FileRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recipes/generate-signed-url',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Fetch Opengraph
     * @returns any Successful Response
     * @throws ApiError
     */
    public static fetchOpengraph({
        requestBody,
    }: {
        requestBody: URLRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recipes/fetch-opengraph',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Comment
     * Add a comment to a recipe.
     * @returns CommentOut Successful Response
     * @throws ApiError
     */
    public static addComment({
        recipeId,
        formData,
    }: {
        recipeId: number,
        formData: Body_recipes_add_comment,
    }): CancelablePromise<CommentOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recipes/{recipe_id}/comments',
            path: {
                'recipe_id': recipeId,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Comment
     * Delete a comment from a recipe.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteComment({
        commentId,
    }: {
        commentId: number,
    }): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/recipes/comments/{comment_id}',
            path: {
                'comment_id': commentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
