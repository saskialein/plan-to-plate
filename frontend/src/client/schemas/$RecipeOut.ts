/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RecipeOut = {
    properties: {
        title: {
            type: 'string',
            isRequired: true,
        },
        url: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        file_path: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        description: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        store_in_vector_db: {
            type: 'boolean',
        },
        id: {
            type: 'number',
            isRequired: true,
        },
        owner_id: {
            type: 'number',
            isRequired: true,
        },
        comments: {
            type: 'array',
            contains: {
                type: 'CommentCreate',
            },
        },
    },
} as const;
