/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Body_recipes_create_recipe = {
    properties: {
        title: {
            type: 'string',
            isRequired: true,
        },
        url: {
            type: 'string',
        },
        file: {
            type: 'binary',
            format: 'binary',
        },
        description: {
            type: 'string',
        },
        store_in_vector_db: {
            type: 'boolean',
        },
        comments: {
            type: 'array',
            contains: {
                type: 'CommentCreate',
            },
        },
    },
} as const;
