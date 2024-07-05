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
        filePath: {
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
        storeInVectorDb: {
            type: 'boolean',
        },
        categories: {
            type: 'array',
            contains: {
                type: 'string',
            },
        },
        id: {
            type: 'number',
            isRequired: true,
        },
        ownerId: {
            type: 'number',
            isRequired: true,
        },
        comments: {
            type: 'array',
            contains: {
                type: 'CommentOut',
            },
        },
    },
} as const;
